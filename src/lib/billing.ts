import { randomBytes } from "crypto";
import { revalidatePath } from "next/cache";
import { prisma } from "./prisma";
import {
  getOrgPlan,
  getUserPlan,
  maxExtraSlots,
  shopPriceRmb,
  isBillingInterval,
  FACILITY_EXTRA_SLOT_PRICE_RMB,
  type BillingInterval,
  type Plan,
} from "./plans";

export type CheckoutScope =
  | { kind: "org"; id: string }
  | { kind: "user"; id: string };

/** Card checkout via Stripe HK. WeChat/Alipay deferred — see docs/PAYMENTS_WALLETS_DEFERRED.md */
export type Provider = "stripe";

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

export function anyProviderConfigured(): boolean {
  return stripeConfigured();
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

// Build a Stripe Checkout session (card only). Monthly/yearly plans use a real
// subscription; one-off slot purchases use mode "payment".
async function createStripeCheckout(opts: {
  amountRmb: number;
  productName: string;
  metadata: Record<string, string>;
  baseUrl: string;
  interval?: BillingInterval;
}): Promise<CheckoutResult> {
  const { amountRmb, productName, metadata, baseUrl, interval } = opts;
  const { default: Stripe } = await import("stripe");
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
  const recurring = interval === "month" || interval === "year";
  const session = await stripe.checkout.sessions.create({
    mode: recurring ? "subscription" : "payment",
    payment_method_types: ["card"],
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
  const { scope, planKey, baseUrl } = opts;
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

  // No provider configured → demo mode: activate immediately.
  if (!anyProviderConfigured()) {
    await activatePlan(scope, planKey, interval);
    return { activated: true, demo: true };
  }

  if (!stripeConfigured()) return { error: "STRIPE_NOT_CONFIGURED" };

  return createStripeCheckout({
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

// Buy one extra pet slot for an owner (¥15/mo). Demo-increments the slot count
// when no provider is configured; otherwise routes through Stripe and the slot
// is granted on return (see finalizeStripeSession). Hard-capped by the plan.
export async function buyOwnerPetSlot(opts: {
  userId: string;
  baseUrl: string;
  provider: Provider;
}): Promise<CheckoutResult> {
  const { userId, baseUrl } = opts;
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return { error: "NO_USER" };
  const plan = getUserPlan(user.plan);
  if (plan.extraPetPriceRmb <= 0) return { error: "NO_OVERAGE" };
  if (user.extraPetSlots >= maxExtraSlots(plan)) return { error: "CAP_REACHED" };

  if (!anyProviderConfigured()) {
    await prisma.user.update({
      where: { id: userId },
      data: { extraPetSlots: { increment: 1 } },
    });
    return { activated: true, demo: true };
  }

  if (!stripeConfigured()) return { error: "STRIPE_NOT_CONFIGURED" };

  return createStripeCheckout({
    amountRmb: plan.extraPetPriceRmb,
    productName: "PawSure — extra pet slot",
    metadata: { scopeKind: "user_slot", scopeId: userId },
    baseUrl,
  });
}

// Buy one extra facility "care slot" (¥30/mo). Demo-grants the slot when no
// provider is configured; otherwise routes through Stripe and the slot is
// granted on return. The slot persists (org.extraPetSlots) until cancelled.
export async function buyFacilitySlot(opts: {
  orgId: string;
  baseUrl: string;
  provider: Provider;
}): Promise<CheckoutResult> {
  const { orgId, baseUrl } = opts;

  if (!anyProviderConfigured()) {
    await prisma.organization.update({
      where: { id: orgId },
      data: { extraPetSlots: { increment: 1 } },
    });
    return { activated: true, demo: true };
  }

  if (!stripeConfigured()) return { error: "STRIPE_NOT_CONFIGURED" };

  return createStripeCheckout({
    amountRmb: FACILITY_EXTRA_SLOT_PRICE_RMB,
    productName: "PawSure — facility care slot",
    metadata: { scopeKind: "org_slot", scopeId: orgId },
    baseUrl,
    interval: "month",
  });
}

export type FulfillScopeKind = "org" | "user" | "user_slot" | "org_slot";

export type FulfillResult = {
  ok: boolean;
  error?: "NOT_CONFIGURED" | "NOT_READY" | "INVALID_METADATA";
  alreadyFulfilled?: boolean;
  planKey?: string;
  scopeKind?: FulfillScopeKind;
};

type StripeCheckoutSession = {
  id: string;
  status: string | null;
  payment_status: string | null;
  metadata: Record<string, string> | null;
};

function checkoutSessionReady(session: StripeCheckoutSession): boolean {
  return (
    session.payment_status === "paid" ||
    session.status === "complete"
  );
}

function revalidateAfterFulfillment(scopeKind: string) {
  if (scopeKind === "user" || scopeKind === "user_slot") {
    revalidatePath("/me/billing");
    revalidatePath("/me");
    revalidatePath("/me/pets/new");
  } else {
    revalidatePath("/app/billing");
    revalidatePath("/app");
    revalidatePath("/app/pets");
  }
  revalidatePath("/pricing");
}

// Apply what a paid Checkout session bought. Idempotent via metadata.fulfilled
// so the success page and webhook can both call this safely.
export async function fulfillCheckoutSession(
  session: StripeCheckoutSession,
  stripeClient?: { checkout: { sessions: { update: (id: string, params: { metadata: Record<string, string> }) => Promise<unknown> } } },
): Promise<FulfillResult> {
  const md = session.metadata ?? {};
  const scopeKind = md.scopeKind as FulfillScopeKind | undefined;

  if (md.fulfilled === "1" && scopeKind) {
    return {
      ok: true,
      alreadyFulfilled: true,
      scopeKind,
      planKey: md.planKey,
    };
  }

  if (!checkoutSessionReady(session)) {
    return { ok: false, error: "NOT_READY" };
  }
  if (!scopeKind || !md.scopeId) {
    return { ok: false, error: "INVALID_METADATA" };
  }

  if (scopeKind === "user_slot") {
    await prisma.user.update({
      where: { id: md.scopeId },
      data: { extraPetSlots: { increment: 1 } },
    });
  } else if (scopeKind === "org_slot") {
    await prisma.organization.update({
      where: { id: md.scopeId },
      data: { extraPetSlots: { increment: 1 } },
    });
  } else if (scopeKind === "org" || scopeKind === "user") {
    if (!md.planKey) return { ok: false, error: "INVALID_METADATA" };
    const interval = isBillingInterval(md.interval) ? md.interval : undefined;
    await activatePlan({ kind: scopeKind, id: md.scopeId }, md.planKey, interval);
  } else {
    return { ok: false, error: "INVALID_METADATA" };
  }

  if (stripeClient) {
    await stripeClient.checkout.sessions.update(session.id, {
      metadata: { ...md, fulfilled: "1" },
    });
  }

  revalidateAfterFulfillment(scopeKind);
  return {
    ok: true,
    scopeKind,
    planKey: md.planKey,
  };
}

// Confirm a returning Stripe Checkout session (success-page redirect).
export async function finalizeStripeSession(sessionId: string): Promise<FulfillResult> {
  if (!stripeConfigured()) return { ok: false, error: "NOT_CONFIGURED" };
  const { default: Stripe } = await import("stripe");
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  return fulfillCheckoutSession(session, stripe);
}
