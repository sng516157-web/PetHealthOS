import Link from "next/link";
import {
  ArrowRight,
  Check,
  User,
  Store,
  Hospital,
  ShieldCheck,
  FileText,
  Lock,
} from "lucide-react";
import { messagingDemo } from "@/lib/demo/messaging-copy";
import { MessagingDemoChrome } from "@/components/demo/messaging/MessagingDemoChrome";
import {
  SectionHeading,
  PathCard,
  StepGrid,
} from "@/components/demo/messaging/LandingBlocks";
import { SamplePetPassport } from "@/components/demo/messaging/SamplePetPassport";
import {
  AuroraOrbs,
  MotionPop,
  MotionReveal,
  motionCardHover,
} from "@/components/motion/aurora";

const TRUST_ICONS = [Lock, FileText, ShieldCheck];

export default function MessagingHomeDemo() {
  const h = messagingDemo.home;

  return (
    <>
      <MessagingDemoChrome active="/demo/messaging" />

      <section className="relative overflow-hidden">
        <AuroraOrbs subtle />
        <div className="relative mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-22">
          <MotionPop index={0}>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-200 bg-white px-3 py-1 text-xs font-medium text-forest">
              {h.heroEyebrow}
            </span>
          </MotionPop>
          <MotionPop index={1}>
            <h1 className="mt-5 max-w-3xl text-4xl font-extrabold leading-[1.1] tracking-tight text-forest md:text-5xl">
              {h.heroTitle}
            </h1>
          </MotionPop>
          <MotionPop index={2}>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-ink/70">{h.heroSubtitle}</p>
          </MotionPop>
          <MotionPop index={3}>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="#choose"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-ps-button transition hover:bg-brand-700"
              >
                {h.heroPrimary} <ArrowRight size={16} />
              </Link>
              <Link
                href="#sample-passport"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-border bg-white/90 px-6 py-3 text-sm font-semibold text-forest backdrop-blur transition hover:border-brand-300"
              >
                {h.heroSecondary}
              </Link>
            </div>
          </MotionPop>
          <MotionPop index={4}>
            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-xs font-medium text-ink/60">
              {h.trustBullets.map((item) => (
                <li key={item} className="inline-flex items-center gap-1.5">
                  <Check size={14} className="text-sage" /> {item}
                </li>
              ))}
            </ul>
          </MotionPop>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-14 md:px-8">
        <MotionReveal>
          <SectionHeading eyebrow={h.howEyebrow} title={h.howTitle} />
        </MotionReveal>
        <MotionReveal delay={80} className="mt-10">
          <StepGrid steps={h.steps} />
        </MotionReveal>
      </section>

      <section className="bg-sand/30 py-14">
        <div className="mx-auto max-w-6xl px-5 md:px-8">
          <MotionReveal>
            <SectionHeading eyebrow={h.sampleEyebrow} title={h.sampleTitle} subtitle={h.sampleDesc} />
          </MotionReveal>
          <MotionReveal delay={100} className="mt-10">
            <SamplePetPassport />
          </MotionReveal>
        </div>
      </section>

      <section id="choose" className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-20">
        <MotionReveal>
          <SectionHeading
            eyebrow={h.chooseEyebrow}
            title={h.chooseTitle}
            subtitle={h.chooseSubtitle}
          />
        </MotionReveal>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          <MotionReveal delay={0}>
            <PathCard
              href="/owner"
              demoHref="/demo/messaging/owner"
              icon={<User size={22} />}
              title={h.ownerCardTitle}
              desc={h.ownerCardDesc}
              cta={h.ownerCardCta}
            />
          </MotionReveal>
          <MotionReveal delay={100}>
            <PathCard
              href="/shop"
              demoHref="/demo/messaging/shop"
              icon={<Store size={22} />}
              title={h.shopCardTitle}
              desc={h.shopCardDesc}
              cta={h.shopCardCta}
              highlight
            />
          </MotionReveal>
          <MotionReveal delay={200}>
            <PathCard
              href="/facility"
              demoHref="/demo/messaging/facility"
              icon={<Hospital size={22} />}
              title={h.facilityCardTitle}
              desc={h.facilityCardDesc}
              cta={h.facilityCardCta}
            />
          </MotionReveal>
        </div>
      </section>

      <section className="border-t border-border bg-surface py-16">
        <div className="mx-auto max-w-6xl px-5 md:px-8">
          <MotionReveal>
            <SectionHeading eyebrow={h.trustEyebrow} title={h.trustTitle} />
          </MotionReveal>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {h.trustItems.map((item, i) => {
              const Icon = TRUST_ICONS[i % TRUST_ICONS.length]!;
              return (
                <MotionReveal key={item.title} delay={i * 60}>
                  <div
                    className={`rounded-2xl border border-border bg-paper p-5 shadow-soft ${motionCardHover}`}
                  >
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-forest/10 text-forest">
                      <Icon size={18} />
                    </span>
                    <h3 className="mt-3 text-sm font-bold text-forest">{item.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-ink/70">{item.desc}</p>
                  </div>
                </MotionReveal>
              );
            })}
          </div>
        </div>
      </section>

      <footer className="border-t border-border py-8 text-center text-xs text-muted">
        <p>Preview only — production homepage is unchanged at <Link href="/" className="font-medium text-brand-700 hover:underline">/</Link></p>
      </footer>
    </>
  );
}
