import { randomBytes } from "crypto";
import { revalidatePath } from "next/cache";
import {
  countPurchasedOwnerSlots,
  createOwnerPetSlot,
  ensureOwnerPetSlotActive,
  revokeOwnerPetSlot,
  syncOwnerSlotCount,
} from "./owner-slots";
import {
  countPurchasedOrgCareSlots,
  createOrgSlot,
  ensureOrgSlotActive,
  revokeOrgSlot,
  syncOrgCareSlotCount,
} from "./org-slots";
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

export type FulfillScopeKind = "org" | "user" | "user_slot" | "org_slot";

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

export async function getStripeCustomerId(scope: CheckoutScope): Promise<string | null> {
  if (scope.kind === "org") {
    const rows = await prisma.$queryRaw<{ stripeCustomerId: string | null }[]>`
      SELECT "stripeCustomerId" FROM "Organization" WHERE id = ${scope.id} LIMIT 1
    `;
    return rows[0]?.stripeCustomerId ?? null;
  }
  const rows = await prisma.$queryRaw<{ stripeCustomerId: string | null }[]>`
    SELECT "stripeCustomerId" FROM "User" WHERE id = ${scope.id} LIMIT 1
  `;
  return rows[0]?.stripeCustomerId ?? null;
}

/** Find Stripe customer by account email when checkout paid but we never persisted the id. */
export async function resolveStripeCustomerId(
  scope: CheckoutScope,
): Promise<string | null> {
  const cached = await getStripeCustomerId(scope);
  if (cached) return cached;
  if (!stripeConfigured()) return null;

  let email: string | null = null;
  if (scope.kind === "org") {
    const member = await prisma.user.findFirst({
      where: { orgId: scope.id, email: { not: null } },
      select: { email: true },
      orderBy: { createdAt: "asc" },
    });
    email = member?.email ?? null;
  } else {
    const user = await prisma.user.findUnique({
      where: { id: scope.id },
      select: { email: true },
    });
    email = user?.email ?? null;
  }
  if (!email) return null;

  const { default: Stripe } = await import("stripe");
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
  const customers = await stripe.customers.list({ email, limit: 5 });
  const customerId = customers.data[0]?.id;
  if (!customerId) return null;

  if (scope.kind === "org") {
    await prisma.$executeRaw`
      UPDATE "Organization" SET "stripeCustomerId" = ${customerId}
      WHERE id = ${scope.id}
    `;
  } else {
    await prisma.$executeRaw`
      UPDATE "User" SET "stripeCustomerId" = ${customerId}
      WHERE id = ${scope.id}
    `;
  }
  return customerId;
}

function stripeCustomerIdFromSession(
  customer: string | { id: string } | null | undefined,
): string | null {
  if (!customer) return null;
  return typeof customer === "string" ? customer : customer.id;
}

async function persistStripeCustomer(
  scopeKind: FulfillScopeKind,
  scopeId: string,
  customerId: string,
): Promise<void> {
  if (scopeKind === "user" || scopeKind === "user_slot") {
    await prisma.$executeRaw`
      UPDATE "User" SET "stripeCustomerId" = ${customerId}
      WHERE id = ${scopeId} AND "stripeCustomerId" IS NULL
    `;
  } else if (scopeKind === "org" || scopeKind === "org_slot") {
    await prisma.$executeRaw`
      UPDATE "Organization" SET "stripeCustomerId" = ${customerId}
      WHERE id = ${scopeId} AND "stripeCustomerId" IS NULL
    `;
  }
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
  stripeCustomerId?: string | null;
}): Promise<CheckoutResult> {
  const { amountRmb, productName, metadata, baseUrl, interval, stripeCustomerId } =
    opts;
  const { default: Stripe } = await import("stripe");
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
  const recurring = interval === "month" || interval === "year";
  const session = await stripe.checkout.sessions.create({
    mode: recurring ? "subscription" : "payment",
    payment_method_types: ["card"],
    ...(stripeCustomerId ? { customer: stripeCustomerId } : {}),
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
    ...(recurring ? { subscription_data: { metadata } } : {}),
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

  const stripeCustomerId = await getStripeCustomerId(scope);

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
    stripeCustomerId,
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
  const purchased = await countPurchasedOwnerSlots(userId);
  if (purchased >= maxExtraSlots(plan)) return { error: "CAP_REACHED" };

  if (!anyProviderConfigured()) {
    await createOwnerPetSlot(userId);
    return { activated: true, demo: true };
  }

  if (!stripeConfigured()) return { error: "STRIPE_NOT_CONFIGURED" };

  const slotId = await createOwnerPetSlot(userId, { pending: true });
  const stripeCustomerId = await getStripeCustomerId({ kind: "user", id: userId });

  return createStripeCheckout({
    amountRmb: plan.extraPetPriceRmb,
    productName: "PawSure — extra pet slot",
    metadata: { scopeKind: "user_slot", scopeId: userId, slotId },
    baseUrl,
    interval: "month",
    stripeCustomerId,
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
    await createOrgSlot(orgId, "care");
    return { activated: true, demo: true };
  }

  if (!stripeConfigured()) return { error: "STRIPE_NOT_CONFIGURED" };

  const slotId = await createOrgSlot(orgId, "care", { pending: true });
  const stripeCustomerId = await getStripeCustomerId({ kind: "org", id: orgId });

  return createStripeCheckout({
    amountRmb: FACILITY_EXTRA_SLOT_PRICE_RMB,
    productName: "PawSure — facility care slot",
    metadata: { scopeKind: "org_slot", scopeId: orgId, slotId },
    baseUrl,
    interval: "month",
    stripeCustomerId,
  });
}

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
  customer?: string | { id: string } | null;
};

function checkoutSessionReady(session: StripeCheckoutSession): boolean {
  return (
    session.payment_status === "paid" ||
    session.status === "complete"
  );
}

async function repairSlotFromMetadata(
  scopeKind: FulfillScopeKind,
  scopeId: string,
  slotId: string | undefined,
): Promise<void> {
  if (!slotId) return;
  if (scopeKind === "user_slot") {
    await ensureOwnerPetSlotActive(scopeId, slotId);
  } else if (scopeKind === "org_slot") {
    await ensureOrgSlotActive(scopeId, slotId, "care");
  }
}

/** Reconcile DB slots with active Stripe slot subscriptions (missed webhooks / success page). */
export async function syncSlotSubscriptionsFromStripe(
  scope: CheckoutScope,
): Promise<void> {
  if (!stripeConfigured()) return;
  const customerId = await resolveStripeCustomerId(scope);
  if (!customerId) return;

  const { default: Stripe } = await import("stripe");
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

  let startingAfter: string | undefined;
  for (;;) {
    const page = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 100,
      ...(startingAfter ? { starting_after: startingAfter } : {}),
    });
    for (const sub of page.data) {
      const md = sub.metadata ?? {};
      if (md.scopeId !== scope.id) continue;
      if (md.scopeKind === "org_slot" && scope.kind === "org") {
        await repairSlotFromMetadata("org_slot", md.scopeId, md.slotId);
      } else if (md.scopeKind === "user_slot" && scope.kind === "user") {
        await repairSlotFromMetadata("user_slot", md.scopeId, md.slotId);
      }
    }
    if (!page.has_more) break;
    startingAfter = page.data.at(-1)?.id;
  }
}

/** Fulfill paid Checkout sessions that were never marked fulfilled (idempotent). */
export async function repairUnfulfilledCheckoutSessions(
  scope: CheckoutScope,
): Promise<void> {
  if (!stripeConfigured()) return;
  const customerId = await resolveStripeCustomerId(scope);
  if (!customerId) return;

  const { default: Stripe } = await import("stripe");
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
  const sessions = await stripe.checkout.sessions.list({
    customer: customerId,
    limit: 25,
  });
  for (const session of sessions.data) {
    const md = session.metadata ?? {};
    if (md.scopeId !== scope.id) continue;
    if (md.scopeKind !== "org_slot" && md.scopeKind !== "user_slot") continue;
    if (!checkoutSessionReady(session)) continue;
    await fulfillCheckoutSession(session, stripe);
  }
}

/** Activate slot subscriptions on recurring invoice payment (backup to checkout webhook). */
export async function handleInvoicePaymentSucceeded(invoice: {
  subscription?: string | { id: string } | null;
}): Promise<void> {
  if (!stripeConfigured()) return;
  const subRef = invoice.subscription;
  const subId = typeof subRef === "string" ? subRef : subRef?.id;
  if (!subId) return;

  const { default: Stripe } = await import("stripe");
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
  const sub = await stripe.subscriptions.retrieve(subId);
  const md = sub.metadata ?? {};
  const scopeKind = md.scopeKind as FulfillScopeKind | undefined;
  if (!scopeKind || !md.scopeId || !md.slotId) return;
  await repairSlotFromMetadata(scopeKind, md.scopeId, md.slotId);
  revalidateAfterFulfillment(scopeKind);
}

function revalidateAfterFulfillment(scopeKind: string) {
  if (scopeKind === "user" || scopeKind === "user_slot") {
    revalidatePath("/me/billing");
    revalidatePath("/me/account");
    revalidatePath("/me");
    revalidatePath("/me/pets/new");
  } else {
    revalidatePath("/app/billing");
    revalidatePath("/app/account");
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
    await repairSlotFromMetadata(scopeKind, md.scopeId, md.slotId);
    revalidateAfterFulfillment(scopeKind);
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
    if (md.slotId) {
      await ensureOwnerPetSlotActive(md.scopeId, md.slotId);
    } else {
      await createOwnerPetSlot(md.scopeId);
    }
  } else if (scopeKind === "org_slot") {
    if (md.slotId) {
      await ensureOrgSlotActive(md.scopeId, md.slotId, "care");
    } else {
      await createOrgSlot(md.scopeId, "care");
    }
  } else if (scopeKind === "org" || scopeKind === "user") {
    if (!md.planKey) return { ok: false, error: "INVALID_METADATA" };
    const interval = isBillingInterval(md.interval) ? md.interval : undefined;
    await activatePlan({ kind: scopeKind, id: md.scopeId }, md.planKey, interval);
  } else {
    return { ok: false, error: "INVALID_METADATA" };
  }

  const customerId = stripeCustomerIdFromSession(session.customer);
  if (customerId) {
    await persistStripeCustomer(scopeKind, md.scopeId, customerId);
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

// Stripe Customer Portal — cancel subscriptions, update payment method, view invoices.
export async function createBillingPortalSession(opts: {
  stripeCustomerId: string;
  returnUrl: string;
}): Promise<CheckoutResult> {
  if (!stripeConfigured()) return { error: "STRIPE_NOT_CONFIGURED" };
  const { default: Stripe } = await import("stripe");
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: opts.stripeCustomerId,
      return_url: opts.returnUrl,
    });
    if (!session.url) return { error: "STRIPE_NO_URL" };
    return { url: session.url };
  } catch {
    return { error: "PORTAL_NOT_AVAILABLE" };
  }
}

// Downgrade or adjust quotas when a Stripe subscription ends.
export async function handleSubscriptionEnded(subscription: {
  id?: string;
  metadata: Record<string, string> | null;
}): Promise<void> {
  const md = subscription.metadata ?? {};
  const scopeKind = md.scopeKind as FulfillScopeKind | undefined;
  const scopeId = md.scopeId;
  if (!scopeKind || !scopeId) return;

  if (scopeKind === "user_slot") {
    if (md.slotId) {
      await revokeOwnerPetSlot(md.slotId);
    } else {
      await syncOwnerSlotCount(scopeId);
    }
    revalidateAfterFulfillment(scopeKind);
    return;
  }

  if (scopeKind === "org") {
    await activatePlan({ kind: "org", id: scopeId }, "STARTER");
  } else if (scopeKind === "org_slot") {
    if (md.slotId) {
      await revokeOrgSlot(md.slotId);
    } else {
      await syncOrgCareSlotCount(scopeId);
    }
  }

  revalidateAfterFulfillment(scopeKind);
}

// Manual refund in Stripe — revoke a tagged owner slot when the charge is refunded.
export async function handleChargeRefunded(charge: {
  payment_intent?: string | { id: string } | null;
}): Promise<void> {
  if (!stripeConfigured()) return;
  const pi = charge.payment_intent;
  const paymentIntentId = typeof pi === "string" ? pi : pi?.id;
  if (!paymentIntentId) return;

  const { default: Stripe } = await import("stripe");
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
  const sessions = await stripe.checkout.sessions.list({
    payment_intent: paymentIntentId,
    limit: 1,
  });
  const session = sessions.data[0];
  const slotId = session?.metadata?.slotId;
  const scopeKind = session?.metadata?.scopeKind;
  if (!slotId) return;
  if (scopeKind === "user_slot") {
    await revokeOwnerPetSlot(slotId);
    revalidateAfterFulfillment("user_slot");
  } else if (scopeKind === "org_slot") {
    await revokeOrgSlot(slotId);
    revalidateAfterFulfillment("org_slot");
  }
}

// Confirm a returning Stripe Checkout session (success-page redirect).
export async function finalizeStripeSession(sessionId: string): Promise<FulfillResult> {
  if (!stripeConfigured()) return { ok: false, error: "NOT_CONFIGURED" };
  const { default: Stripe } = await import("stripe");
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  return fulfillCheckoutSession(session, stripe);
}
