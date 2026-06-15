import "server-only";
import { prisma } from "./prisma";
import { stripeConfigured, resolveStripeCustomerId } from "./billing";
import { deathCondolenceCreditUsd } from "./pet-closure";
import { toStripeCents } from "./money";

/** Grant ~3 months of extra-pet slot fees as Stripe customer balance credit. */
export async function grantDeathCondolenceCredit(
  userId: string,
): Promise<{ ok: true } | { error: string }> {
  const creditUsd = deathCondolenceCreditUsd();
  if (creditUsd <= 0) return { ok: true };

  if (!stripeConfigured()) {
    console.warn("[death-claim] Stripe not configured — skip auto credit");
    return { ok: true };
  }

  const customerId = await resolveStripeCustomerId({ kind: "user", id: userId });
  if (!customerId) {
    console.warn("[death-claim] No Stripe customer for user", userId);
    return { ok: true };
  }

  try {
    const { default: Stripe } = await import("stripe");
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
    await stripe.customers.createBalanceTransaction(customerId, {
      amount: -toStripeCents(creditUsd),
      currency: "usd",
      description: "PawSure condolence credit (3 months extra pet slot)",
    });
    return { ok: true };
  } catch (e) {
    console.error("[death-claim] Stripe credit failed", e);
    return { error: "REFUND_FAILED" };
  }
}

export async function markDeathClaimReviewed(
  claimId: string,
  decision: "APPROVED" | "REJECTED",
  reviewNote: string,
): Promise<{ ok: true } | { error: string }> {
  const claim = await prisma.petDeathClaim.findUnique({ where: { id: claimId } });
  if (!claim) return { error: "Not found" };
  if (claim.status !== "PENDING") return { error: "ALREADY_REVIEWED" };

  if (decision === "REJECTED") {
    await prisma.petDeathClaim.update({
      where: { id: claimId },
      data: { status: "REJECTED", reviewNote, reviewedAt: new Date() },
    });
    return { ok: true };
  }

  const credit = await grantDeathCondolenceCredit(claim.userId);
  if ("error" in credit && credit.error) {
    return credit;
  }

  await prisma.petDeathClaim.update({
    where: { id: claimId },
    data: {
      status: "APPROVED",
      reviewNote,
      reviewedAt: new Date(),
      refundGrantedAt: new Date(),
    },
  });
  return { ok: true };
}
