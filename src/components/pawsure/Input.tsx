"use client";

import * as React from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/cn";

const base =
  "w-full rounded-xl border border-border bg-surface text-foreground placeholder:text-muted/70 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15 disabled:opacity-60";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  hint?: string;
  error?: string;
};

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  function Input({ label, hint, error, className, id, ...props }, ref) {
    const inputId = id ?? React.useId();
    return (
      <div className="space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-semibold text-forest">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            base,
            "h-11 px-3.5 text-sm",
            error && "border-alert focus:border-alert focus:ring-alert/15",
            className,
          )}
          {...props}
        />
        {error ? (
          <p className="text-xs text-alert">{error}</p>
        ) : hint ? (
          <p className="text-xs text-muted">{hint}</p>
        ) : null}
      </div>
    );
  },
);

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string }
>(function Textarea({ label, className, id, ...props }, ref) {
  const taId = id ?? React.useId();
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={taId} className="block text-xs font-semibold text-forest">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        id={taId}
        className={cn(base, "resize-none px-3.5 py-2.5 text-sm", className)}
        {...props}
      />
    </div>
  );
});

export function SearchInput({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className={cn("relative", className)}>
      <Search
        size={17}
        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
      />
      <input
        className={cn(base, "h-11 pl-10 pr-3.5 text-sm")}
        type="search"
        {...props}
      />
    </div>
  );
}
