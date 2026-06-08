import { randomBytes } from "crypto";
import { prisma } from "./prisma";
import {
  getOrgPlan,
  getUserPlan,
  maxExtraSlots,
  shopPriceRmb,
  isBillingInterval,
  type BillingInterval,
  type Plan,
} from "./plans";

export type CheckoutScope =
  | { kind: "org"; id: string }
  | { kind: "user"; id: string };

export type Provider = "stripe" | "wechat" | "alipay";

export type CheckoutResult =
  | { url: string } // redirect the customer to the provider
  | { activated: true; demo?: boolean } // plan applied immediately
  | { error: string };

function planFor(scope: CheckoutScope, planKey: string): Plan | null {
  const plan = scope.kind === "org" ? getOrgPlan(planKey) : getUserPlan(planKey);
  return plan.key === planKey ? plan : null;
}

export function stripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

export function chinaPayConfigured(provider: "wechat" | "alipay"): boolean {
  if (provider === "wechat") return Boolean(process.env.WECHAT_PAY_MCH_ID);
  return Boolean(process.env.ALIPAY_APP_ID);
}

export function anyProviderConfigured(): boolean {
  return (
    stripeConfigured() ||
    chinaPayConfigured("wechat") ||
    chinaPayConfigured("alipay")
  );
}

// Apply a plan to the org/user. Used by free-tier switches, the dev/demo path,
// and after a provider confirms payment.
export async function activatePlan(
  scope: CheckoutScope,
  planKey: string,
  interval?: BillingInterval,
): Promise<void> {
  if (scope.kind === "org") {
    await prisma.organization.update({
      where: { id: scope.id },
      data: {
        plan: planKey,
        // Free tier clears the interval; paid records how it was bought.
        planInterval: planKey === "STARTER" ? null : (interval ?? null),
        planActivatedAt: planKey === "STARTER" ? null : new Date(),
      },
    });
  } else {
    await prisma.user.update({
      where: { id: scope.id },
      data: { plan: planKey },
    });
  }
}

// Count of shops that registered through this org's referral link.
export async function getReferralCount(orgId: string): Promise<number> {
  return prisma.organization.count({ where: { referredById: orgId } });
}

// Ensure an org has a unique referral code, creating one on first access.
export async function ensureReferralCode(orgId: string): Promise<string> {
  const org = await prisma.organization.findUnique({
    where: { id: orgId },
    select: { referralCode: true },
  });
  if (org?.referralCode) return org.referralCode;
  // Retry on the rare unique collision.
  for (let i = 0; i < 5; i++) {
    const code = randomBytes(5).toString("hex"); // 10 hex chars
    try {
      await prisma.organization.update({
        where: { id: orgId },
        data: { referralCode: code },
      });
      return code;
    } catch {
      /* collision — try again */
    }
  }
  throw new Error("Could not allocate referral code");
}

type StripeMethod = "card" | "wechat_pay" | "alipay";

function stripeMethodFor(provider: Provider): StripeMethod {
  if (provider === "wechat") return "wechat_pay";
  if (provider === "alipay") return "alipay";
  return "card";
}

// Build a Stripe Checkout session for any supported provider. Stripe is our
// cross-border processor: a Hong Kong Stripe account can charge mainland users
// via Alipay / WeChat Pay with no native merchant account. Cards bill as a real
// monthly *subscription*; Alipay & WeChat Pay are one-time methods in Stripe
// (no recurring support), so they're charged one month at a time and the
// customer re-pays each period rather than auto-renewing.
async function createStripeCheckout(opts: {
  provider: Provider;
  amountRmb: number;
  productName: string;
  metadata: Record<string, string>;
  baseUrl: string;
  // "month"/"year" bill as a real recurring subscription on card; "lifetime"
  // (and any Alipay/WeChat payment, which can't recur) is a one-time charge.
  interval?: BillingInterval;
}): Promise<CheckoutResult> {
  const { provider, amountRmb, productName, metadata, baseUrl, interval } = opts;
  const { default: Stripe } = await import("stripe");
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
  const method = stripeMethodFor(provider);
  // Cards can auto-renew monthly/yearly; lifetime is one-time. Alipay/WeChat
  // have no recurring support in Stripe, so they're always one-time.
  const recurring =
    method === "card" && (interval === "month" || interval === "year");
  const session = await stripe.checkout.sessions.create({
    mode: recurring ? "subscription" : "payment",
    payment_method_types: [method],
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "cny",
          unit_amount: amountRmb * 100,
          ...(recurring
            ? { recurring: { interval: interval as "month" | "year" } }
            : {}),
          product_data: { name: productName },
        },
      },
    ],
    ...(method === "wechat_pay"
      ? { payment_method_options: { wechat_pay: { client: "web" as const } } }
      : {}),
    success_url: `${baseUrl}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/billing/cancelled`,
    metadata,
  });
  if (!session.url) return { error: "STRIPE_NO_URL" };
  return { url: session.url };
}

export async function startCheckout(opts: {
  scope: CheckoutScope;
  planKey: string;
  provider: Provider;
  baseUrl: string;
  interval?: BillingInterval;
}): Promise<CheckoutResult> {
  const { scope, planKey, provider, baseUrl } = opts;
  const plan = planFor(scope, planKey);
  if (!plan) return { error: "UNKNOWN_PLAN" };

  // Free plans need no payment — just switch.
  if (plan.priceRmb === 0) {
    await activatePlan(scope, planKey);
    return { activated: true };
  }

  // Resolve price. The paid SHOP plan is interval-based; the yearly option
  // applies the referrer's stacking discount. Other (user) plans use priceRmb.
  let interval: BillingInterval | undefined;
  let amountRmb = plan.priceRmb;
  if (scope.kind === "org" && planKey === "SHOP") {
    interval = isBillingInterval(opts.interval) ? opts.interval : "month";
    const referralCount =
      interval === "year" ? await getReferralCount(scope.id) : 0;
    amountRmb = shopPriceRmb(interval, referralCount);
  }

  // No provider configured anywhere → demo mode: activate immediately so the
  // upgrade flow is fully demoable before real credentials are added.
  if (!anyProviderConfigured()) {
    await activatePlan(scope, planKey, interval);
    return { activated: true, demo: true };
  }

  if (provider === "stripe" || provider === "wechat" || provider === "alipay") {
    if (stripeConfigured()) {
      return createStripeCheckout({
        provider,
        amountRmb,
        productName: `Pet Health OS — ${plan.key}`,
        metadata: {
          scopeKind: scope.kind,
          scopeId: scope.id,
          planKey,
          ...(interval ? { interval } : {}),
        },
        baseUrl,
        interval,
      });
    }
    if (provider === "stripe") return { error: "STRIPE_NOT_CONFIGURED" };
    // Stripe is the intended route for the Chinese wallets too; a native
    // WeChat/Alipay merchant integration isn't implemented.
    if (!chinaPayConfigured(provider)) return { error: "PROVIDER_NOT_CONFIGURED" };
    return { error: "PROVIDER_NOT_IMPLEMENTED" };
  }

  return { error: "UNKNOWN_PROVIDER" };
}

// Buy one extra pet slot for an owner (¥25/mo). Demo-increments the slot count
// when no provider is configured; otherwise routes through Stripe and the slot
// is granted on return (see finalizeStripeSession). Hard-capped by the plan.
export async function buyOwnerPetSlot(opts: {
  userId: string;
  baseUrl: string;
  provider: Provider;
}): Promise<CheckoutResult> {
  const { userId, baseUrl, provider } = opts;
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return { error: "NO_USER" };
  const plan = getUserPlan(user.plan);
  if (plan.extraPetPriceRmb <= 0) return { error: "NO_OVERAGE" };
  if (user.extraPetSlots >= maxExtraSlots(plan)) return { error: "CAP_REACHED" };

  // No provider configured → demo mode: grant the slot immediately.
  if (!anyProviderConfigured()) {
    await prisma.user.update({
      where: { id: userId },
      data: { extraPetSlots: { increment: 1 } },
    });
    return { activated: true, demo: true };
  }

  if (provider === "stripe" || provider === "wechat" || provider === "alipay") {
    if (stripeConfigured()) {
      return createStripeCheckout({
        provider,
        amountRmb: plan.extraPetPriceRmb,
        productName: "PawSure — extra pet slot",
        metadata: { scopeKind: "user_slot", scopeId: userId },
        baseUrl,
      });
    }
    if (provider === "stripe") return { error: "STRIPE_NOT_CONFIGURED" };
    if (!chinaPayConfigured(provider)) return { error: "PROVIDER_NOT_CONFIGURED" };
    return { error: "PROVIDER_NOT_IMPLEMENTED" };
  }
  return { error: "UNKNOWN_PROVIDER" };
}

// Confirm a returning Stripe Checkout session and apply what it paid for —
// either a plan upgrade or a single extra pet slot.
export async function finalizeStripeSession(
  sessionId: string,
): Promise<{
  ok: boolean;
  planKey?: string;
  scopeKind?: "org" | "user" | "user_slot";
}> {
  if (!stripeConfigured()) return { ok: false };
  const { default: Stripe } = await import("stripe");
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
  const session = await stripe.checkout.sessions.retrieve(sessionId);

  const paid =
    session.payment_status === "paid" || session.status === "complete";
  const md = session.metadata;
  if (!paid || !md?.scopeKind || !md?.scopeId) return { ok: false };

  if (md.scopeKind === "user_slot") {
    await prisma.user.update({
      where: { id: md.scopeId },
      data: { extraPetSlots: { increment: 1 } },
    });
    return { ok: true, scopeKind: "user_slot" };
  }

  if (!md.planKey) return { ok: false };
  const scopeKind = md.scopeKind as "org" | "user";
  const interval = isBillingInterval(md.interval) ? md.interval : undefined;
  await activatePlan({ kind: scopeKind, id: md.scopeId }, md.planKey, interval);
  return { ok: true, planKey: md.planKey, scopeKind };
}
