"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";

export function usePrefersReducedMotion() {
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

export function useInView(threshold = 0.15) {
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

export function Reveal({
  children,
  className = "",
  delay = 0,
  from = "up",
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  from?: "up" | "left" | "right";
}) {
  const { ref, visible } = useInView();
  const reduced = usePrefersReducedMotion();
  const hidden =
    from === "left"
      ? "opacity-0 -translate-x-8"
      : from === "right"
        ? "opacity-0 translate-x-8"
        : "opacity-0 translate-y-8";

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
        visible || reduced ? "opacity-100 translate-x-0 translate-y-0" : hidden
      } ${className}`}
      style={{ transitionDelay: reduced ? "0ms" : `${delay}ms` }}
    >
      {children}
    </div>
  );
}

export function CountUp({
  to,
  suffix = "",
  className = "",
}: {
  to: number;
  suffix?: string;
  className?: string;
}) {
  const { ref, visible } = useInView();
  const reduced = usePrefersReducedMotion();
  const [value, setValue] = useState(reduced ? to : 0);

  useEffect(() => {
    if (!visible || reduced) {
      setValue(to);
      return;
    }
    let frame = 0;
    const total = 36;
    const tick = () => {
      frame += 1;
      const progress = frame / total;
      const eased = 1 - (1 - progress) ** 3;
      setValue(Math.round(eased * to));
      if (frame < total) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [visible, to, reduced]);

  return (
    <span ref={ref} className={className}>
      {value}
      {suffix}
    </span>
  );
}

export function FloatingOrbs() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div className="demo-drift-a absolute -left-16 top-8 h-72 w-72 rounded-full bg-brand-200/50 blur-3xl" />
      <div className="demo-drift-b absolute right-0 top-24 h-64 w-64 rounded-full bg-gold/25 blur-3xl" />
      <div className="demo-glow absolute bottom-0 left-1/3 h-56 w-56 rounded-full bg-blue/30 blur-3xl" />
    </div>
  );
}

export function Marquee({ items }: { items: string[] }) {
  const track = [...items, ...items];
  return (
    <div className="relative overflow-hidden border-y border-border/60 bg-surface/80 py-3">
      <div className="demo-marquee-track flex w-max gap-8 whitespace-nowrap px-4">
        {track.map((item, i) => (
          <span
            key={`${item}-${i}`}
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-forest/70"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-sage" />
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

export function useTilt() {
  const reduced = usePrefersReducedMotion();
  const onMove = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      if (reduced) return;
      const el = e.currentTarget;
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      el.style.transform = `perspective(900px) rotateX(${-y * 8}deg) rotateY(${x * 8}deg) translateY(-4px)`;
    },
    [reduced],
  );
  const onLeave = useCallback((e: React.MouseEvent<HTMLElement>) => {
    e.currentTarget.style.transform = "";
  }, []);
  return { onMove, onLeave };
}

export function staggerStyle(index: number, base = 80): CSSProperties {
  return { animationDelay: `${index * base}ms` };
}
