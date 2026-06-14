"use client";

import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return reduced;
}

function useInView(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);

  return { ref, visible };
}

/** Ambient gradient orbs for hero / landing sections. */
export function AuroraOrbs({ className = "" }: { className?: string }) {
  return (
    <div
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      aria-hidden
    >
      <div className="ps-aurora-drift-a absolute -left-16 top-8 h-72 w-72 rounded-full bg-brand-200/50 blur-3xl" />
      <div className="ps-aurora-drift-b absolute right-0 top-24 h-64 w-64 rounded-full bg-gold/25 blur-3xl" />
      <div className="ps-aurora-glow absolute bottom-0 left-1/3 h-56 w-56 rounded-full bg-blue/30 blur-3xl" />
    </div>
  );
}

/** Scroll-triggered fade/slide-in. */
export function MotionReveal({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const { ref, visible } = useInView();
  const reduced = usePrefersReducedMotion();

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
        visible || reduced
          ? "translate-y-0 opacity-100"
          : "translate-y-8 opacity-0"
      } ${className}`}
      style={{ transitionDelay: reduced ? "0ms" : `${delay}ms` }}
    >
      {children}
    </div>
  );
}

/** Hero stagger entrance on page load. */
export function MotionPop({
  children,
  className = "",
  index = 0,
  stepMs = 120,
}: {
  children: ReactNode;
  className?: string;
  index?: number;
  stepMs?: number;
}) {
  const reduced = usePrefersReducedMotion();
  return (
    <div
      className={`${reduced ? "" : "ps-aurora-pop-in"} ${className}`}
      style={reduced ? undefined : { animationDelay: `${index * stepMs}ms` }}
    >
      {children}
    </div>
  );
}

/** Gentle float for demo screenshots / hero media. */
export function MotionFloat({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const reduced = usePrefersReducedMotion();
  return (
    <div className={`relative ${reduced ? className : `ps-aurora-float ${className}`}`}>
      {children}
      {!reduced && (
        <div
          className="ps-aurora-glow pointer-events-none absolute -bottom-6 -left-6 h-24 w-24 rounded-full bg-sage/30 blur-2xl"
          aria-hidden
        />
      )}
    </div>
  );
}

/** Shared hover polish for landing cards. */
export const motionCardHover =
  "transition duration-300 hover:border-brand-200 hover:shadow-[0_14px_36px_rgba(36,89,76,0.12)]";
