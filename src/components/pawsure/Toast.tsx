"use client";

import * as React from "react";
import { CheckCircle2, Info, AlertTriangle, XCircle, X } from "lucide-react";
import { cn } from "@/lib/cn";

type ToastTone = "success" | "info" | "warn" | "alert";
type ToastItem = { id: number; title: string; description?: string; tone: ToastTone };

type ToastContextValue = {
  toast: (t: { title: string; description?: string; tone?: ToastTone }) => void;
};

const ToastContext = React.createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = React.useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within <ToastProvider>");
  return ctx;
}

const ICONS: Record<ToastTone, React.ReactNode> = {
  success: <CheckCircle2 size={18} className="text-brand-600" />,
  info: <Info size={18} className="text-blue" />,
  warn: <AlertTriangle size={18} className="text-gold" />,
  alert: <XCircle size={18} className="text-alert" />,
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = React.useState<ToastItem[]>([]);

  const remove = React.useCallback((id: number) => {
    setItems((cur) => cur.filter((t) => t.id !== id));
  }, []);

  const toast = React.useCallback<ToastContextValue["toast"]>(
    ({ title, description, tone = "success" }) => {
      const id = Date.now() + Math.random();
      setItems((cur) => [...cur, { id, title, description, tone }]);
      setTimeout(() => remove(id), 4200);
    },
    [remove],
  );

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 top-4 z-[60] flex flex-col items-center gap-2 px-4 sm:bottom-6 sm:right-6 sm:left-auto sm:top-auto sm:items-end">
        {items.map((t) => (
          <div
            key={t.id}
            className="pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl border border-border bg-surface p-3.5 shadow-[0_16px_40px_rgba(36,89,76,0.18)] animate-fade-in"
          >
            <span className="mt-0.5 shrink-0">{ICONS[t.tone]}</span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-forest">{t.title}</p>
              {t.description && (
                <p className="mt-0.5 text-xs text-muted">{t.description}</p>
              )}
            </div>
            <button
              onClick={() => remove(t.id)}
              aria-label="Dismiss"
              className={cn(
                "shrink-0 rounded-full p-1 text-muted transition hover:bg-brand-50 hover:text-forest",
              )}
            >
              <X size={15} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
