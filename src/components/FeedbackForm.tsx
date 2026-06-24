"use client";

import { useState, useTransition, useRef } from "react";
import { MessageSquare, Send } from "lucide-react";
import { submitFeedback } from "@/app/actions";
import { useI18n } from "@/lib/i18n/client";
import { FieldError } from "@/components/FieldError";
import { validateEmail } from "@/lib/validation";

const inputCls =
  "w-full rounded-xl border border-border bg-white px-3 py-2.5 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100";
const labelCls = "mb-1 block text-xs font-medium text-slate-600";
const primaryBtn =
  "inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60";

type Props = {
  initialEmail?: string;
  initialName?: string;
};

export function FeedbackForm({ initialEmail = "", initialName = "" }: Props) {
  const { t } = useI18n();
  const f = t.feedback;
  const [pending, start] = useTransition();
  const [emailErr, setEmailErr] = useState<string | null>(null);
  const [messageErr, setMessageErr] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sentId, setSentId] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  function mapError(code: string): string {
    const map: Record<string, string> = {
      EMAIL_REQUIRED: t.validation.EMAIL_REQUIRED,
      EMAIL_INVALID: t.validation.EMAIL_INVALID,
      MESSAGE_REQUIRED: f.errors.MESSAGE_REQUIRED,
      MESSAGE_TOO_SHORT: f.errors.MESSAGE_TOO_SHORT,
      FEEDBACK_NOT_CONFIGURED: f.errors.NOT_CONFIGURED,
      SEND_FAILED: f.errors.SEND_FAILED,
    };
    return map[code] ?? code;
  }

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSentId(null);
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") || "");
    const message = String(fd.get("message") || "");
    const emailError = validateEmail(email);
    setEmailErr(emailError);
    setMessageErr(null);
    if (emailError) return;
    if (!message.trim()) {
      setMessageErr(f.errors.MESSAGE_REQUIRED);
      return;
    }
    if (message.trim().length < 10) {
      setMessageErr(f.errors.MESSAGE_TOO_SHORT);
      return;
    }

    start(async () => {
      const res = await submitFeedback(fd);
      if (res?.error) {
        setError(mapError(res.error));
        return;
      }
      if (res?.id) {
        setSentId(res.id);
        formRef.current?.reset();
      }
    });
  }

  if (sentId) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-6 text-sm text-emerald-900">
        <p className="font-semibold">{f.successTitle}</p>
        <p className="mt-2 leading-relaxed">{f.successBody}</p>
        <p className="mt-4 rounded-xl bg-white/70 px-3 py-2 font-mono text-xs text-emerald-800">
          {f.referenceLabel}: {sentId}
        </p>
        <button
          type="button"
          onClick={() => setSentId(null)}
          className="mt-4 text-xs font-semibold text-brand-700 hover:underline"
        >
          {f.sendAnother}
        </button>
      </div>
    );
  }

  return (
    <form ref={formRef} onSubmit={submit} className="space-y-4">
      <div>
        <label htmlFor="feedback-email" className={labelCls}>
          {f.emailLabel}
        </label>
        <input
          id="feedback-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          defaultValue={initialEmail}
          placeholder={f.emailPlaceholder}
          className={inputCls}
        />
        <FieldError code={emailErr} />
      </div>

      <div>
        <label htmlFor="feedback-name" className={labelCls}>
          {f.nameLabel}{" "}
          <span className="font-normal text-muted">({t.common.optional})</span>
        </label>
        <input
          id="feedback-name"
          name="name"
          type="text"
          autoComplete="name"
          defaultValue={initialName}
          placeholder={f.namePlaceholder}
          className={inputCls}
        />
      </div>

      <div>
        <label htmlFor="feedback-message" className={labelCls}>
          {f.messageLabel}
        </label>
        <textarea
          id="feedback-message"
          name="message"
          required
          rows={6}
          placeholder={f.messagePlaceholder}
          className={`${inputCls} resize-y min-h-[140px]`}
        />
        {messageErr && (
          <p className="mt-1 text-xs text-alert">{messageErr}</p>
        )}
      </div>

      {error && (
        <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>
      )}

      <button type="submit" disabled={pending} className={primaryBtn}>
        {pending ? "…" : (
          <>
            <Send size={15} /> {f.submit}
          </>
        )}
      </button>

      <p className="flex items-start gap-2 text-xs leading-relaxed text-muted">
        <MessageSquare size={14} className="mt-0.5 shrink-0" />
        {f.privacyNote}
      </p>
    </form>
  );
}
