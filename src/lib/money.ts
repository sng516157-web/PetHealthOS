/** Format USD for UI — whole dollars omit decimals; otherwise two decimals. */
export function formatUsd(amount: number): string {
  if (Number.isInteger(amount)) return `$${amount}`;
  return `$${amount.toFixed(2)}`;
}

/** Stripe Checkout `unit_amount` for USD (cents). */
export function toStripeCents(amountUsd: number): number {
  return Math.round(amountUsd * 100);
}
