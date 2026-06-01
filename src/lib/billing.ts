import { prisma } from "./prisma";
import { getOrgPlan, getUserPlan, type Plan } from "./plans";

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
): Promise<void> {
  if (scope.kind === "org") {
    await prisma.organization.update({
      where: { id: scope.id },
      data: { plan: planKey },
    });
  } else {
    await prisma.user.update({
      where: { id: scope.id },
      data: { plan: planKey },
    });
  }
}

export async function startCheckout(opts: {
  scope: CheckoutScope;
  planKey: string;
  provider: Provider;
  baseUrl: string;
}): Promise<CheckoutResult> {
  const { scope, planKey, provider, baseUrl } = opts;
  const plan = planFor(scope, planKey);
  if (!plan) return { error: "UNKNOWN_PLAN" };

  // Free plans need no payment — just switch.
  if (plan.priceRmb === 0) {
    await activatePlan(scope, planKey);
    return { activated: true };
  }

  // No provider configured anywhere → demo mode: activate immediately so the
  // upgrade flow is fully demoable before real credentials are added.
  if (!anyProviderConfigured()) {
    await activatePlan(scope, planKey);
    return { activated: true, demo: true };
  }

  if (provider === "stripe") {
    if (!stripeConfigured()) return { error: "STRIPE_NOT_CONFIGURED" };
    const { default: Stripe } = await import("stripe");
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "cny",
            unit_amount: plan.priceRmb * 100,
            recurring: { interval: "month" },
            product_data: { name: `Pet Health OS — ${plan.key}` },
          },
        },
      ],
      success_url: `${baseUrl}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/billing/cancelled`,
      metadata: {
        scopeKind: scope.kind,
        scopeId: scope.id,
        planKey,
      },
    });
    if (!session.url) return { error: "STRIPE_NO_URL" };
    return { url: session.url };
  }

  // WeChat Pay / Alipay — wired as stubs. When you add merchant credentials,
  // implement the order-creation call here and return its pay URL / QR.
  if (provider === "wechat" || provider === "alipay") {
    if (!chinaPayConfigured(provider)) {
      return { error: "PROVIDER_NOT_CONFIGURED" };
    }
    return { error: "PROVIDER_NOT_IMPLEMENTED" };
  }

  return { error: "UNKNOWN_PROVIDER" };
}

// Confirm a returning Stripe Checkout session and apply the plan it paid for.
export async function finalizeStripeSession(
  sessionId: string,
): Promise<{ ok: boolean; planKey?: string; scopeKind?: "org" | "user" }> {
  if (!stripeConfigured()) return { ok: false };
  const { default: Stripe } = await import("stripe");
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
  const session = await stripe.checkout.sessions.retrieve(sessionId);

  const paid =
    session.payment_status === "paid" || session.status === "complete";
  const md = session.metadata;
  if (!paid || !md?.scopeKind || !md?.scopeId || !md?.planKey) {
    return { ok: false };
  }

  const scopeKind = md.scopeKind as "org" | "user";
  await activatePlan({ kind: scopeKind, id: md.scopeId }, md.planKey);
  return { ok: true, planKey: md.planKey, scopeKind };
}
