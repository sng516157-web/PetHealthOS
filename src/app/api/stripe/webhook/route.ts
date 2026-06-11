import {
  fulfillCheckoutSession,
  handleChargeRefunded,
  handleCheckoutSessionExpired,
  handleInvoicePaymentSucceeded,
  handleSubscriptionEnded,
} from "@/lib/billing";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!secret || !key) {
    return Response.json({ error: "Webhook not configured" }, { status: 500 });
  }

  const body = await req.text();
  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return Response.json({ error: "Missing signature" }, { status: 400 });
  }

  const { default: Stripe } = await import("stripe");
  const stripe = new Stripe(key);

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, secret);
  } catch {
    return Response.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (
    event.type === "checkout.session.completed" ||
    event.type === "checkout.session.async_payment_succeeded"
  ) {
    const session = event.data.object;
    await fulfillCheckoutSession(session, stripe);
  }

  if (event.type === "checkout.session.expired") {
    const session = event.data.object;
    await handleCheckoutSessionExpired(session);
  }

  if (event.type === "customer.subscription.deleted") {
    const subscription = event.data.object;
    await handleSubscriptionEnded(subscription);
  }

  if (event.type === "charge.refunded") {
    const charge = event.data.object;
    await handleChargeRefunded(charge);
  }

  if (event.type === "invoice.payment_succeeded") {
    const invoice = event.data.object as { subscription?: string | { id: string } | null };
    await handleInvoicePaymentSucceeded(invoice);
  }

  return Response.json({ received: true });
}
