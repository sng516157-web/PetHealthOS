import { getI18n } from "@/lib/i18n/server";

export async function BreederPricingFaq() {
  const { t } = await getI18n();
  const items = t.pricing.foundingFaq;

  return (
    <section className="mt-10 rounded-2xl border border-border bg-surface/80 p-6">
      <h3 className="text-sm font-semibold text-forest">{t.pricing.foundingFaqTitle}</h3>
      <dl className="mt-4 space-y-4">
        {items.map((item) => (
          <div key={item.q}>
            <dt className="text-sm font-semibold text-foreground">{item.q}</dt>
            <dd className="mt-1 text-sm leading-relaxed text-ink/70">{item.a}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
