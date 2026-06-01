"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { LogIn, UserPlus, Smartphone } from "lucide-react";
import { signIn, register, requestPhoneOtp, verifyPhoneOtp } from "@/app/actions";
import { useI18n } from "@/lib/i18n/client";
import type { Dictionary } from "@/lib/i18n/en";

const inputCls =
  "w-full rounded-xl border border-border bg-white px-3 py-2.5 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100";
const labelCls = "mb-1 block text-xs font-medium text-slate-600";

type Tab = "signin" | "register" | "phone";

export function AuthCard() {
  const { t } = useI18n();
  const [tab, setTab] = useState<Tab>("signin");

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "signin", label: t.auth.tabSignIn, icon: <LogIn size={14} /> },
    { id: "register", label: t.auth.tabRegister, icon: <UserPlus size={14} /> },
    { id: "phone", label: t.auth.tabPhone, icon: <Smartphone size={14} /> },
  ];

  return (
    <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
      <div className="mb-5 grid grid-cols-3 gap-1 rounded-xl bg-slate-100 p-1">
        {tabs.map((tb) => (
          <button
            key={tb.id}
            onClick={() => setTab(tb.id)}
            className={`inline-flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-medium transition ${
              tab === tb.id
                ? "bg-white text-brand-700 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {tb.icon} {tb.label}
          </button>
        ))}
      </div>

      {tab === "signin" && <SignInTab t={t} />}
      {tab === "register" && <RegisterTab t={t} />}
      {tab === "phone" && <PhoneTab t={t} />}
    </div>
  );
}

function SignInTab({ t }: { t: Dictionary }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function submit(formData: FormData) {
    setError(null);
    start(async () => {
      const res = await signIn(formData);
      if (res?.error) setError(res.error);
      else router.push("/me");
    });
  }

  return (
    <form action={submit} className="space-y-3">
      <div>
        <label className={labelCls}>{t.auth.email}</label>
        <input name="email" type="email" required autoComplete="email" className={inputCls} placeholder={t.auth.emailPlaceholder} />
      </div>
      <div>
        <label className={labelCls}>{t.auth.password}</label>
        <input name="password" type="password" required autoComplete="current-password" className={inputCls} />
      </div>
      {error && <p className="text-xs text-rose-600">{error}</p>}
      <button type="submit" disabled={pending} className={primaryBtn}>
        <LogIn size={15} /> {pending ? t.auth.signingIn : t.auth.signIn}
      </button>
    </form>
  );
}

function RegisterTab({ t }: { t: Dictionary }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function submit(formData: FormData) {
    setError(null);
    start(async () => {
      const res = await register(formData);
      if (res?.error) setError(res.error);
      else router.push("/me");
    });
  }

  return (
    <form action={submit} className="space-y-3">
      <div>
        <label className={labelCls}>{t.auth.name}</label>
        <input name="name" required className={inputCls} placeholder={t.auth.namePlaceholder} />
      </div>
      <div>
        <label className={labelCls}>{t.auth.email}</label>
        <input name="email" type="email" required autoComplete="email" className={inputCls} placeholder={t.auth.emailPlaceholder} />
      </div>
      <div>
        <label className={labelCls}>{t.auth.password}</label>
        <input name="password" type="password" required autoComplete="new-password" className={inputCls} placeholder={t.auth.createPasswordPlaceholder} />
      </div>
      {error && <p className="text-xs text-rose-600">{error}</p>}
      <button type="submit" disabled={pending} className={primaryBtn}>
        <UserPlus size={15} /> {pending ? t.auth.registering : t.auth.register}
      </button>
    </form>
  );
}

function PhoneTab({ t }: { t: Dictionary }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<"enter" | "code">("enter");
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [devCode, setDevCode] = useState<string | null>(null);

  function smsError(code: string): string {
    return (t.auth.smsErr as Record<string, string>)[code] ?? code;
  }

  function sendCode(formData: FormData) {
    setError(null);
    setDevCode(null);
    start(async () => {
      const res = await requestPhoneOtp(formData);
      if ("error" in res) {
        setError(smsError(res.error));
        return;
      }
      setPhone(String(formData.get("phone") || ""));
      setName(String(formData.get("name") || ""));
      if (res.devCode) setDevCode(res.devCode);
      setStep("code");
    });
  }

  function verify(formData: FormData) {
    setError(null);
    formData.set("phone", phone);
    formData.set("name", name);
    start(async () => {
      const res = await verifyPhoneOtp(formData);
      if ("error" in res) setError(smsError(res.error));
      else router.push("/me");
    });
  }

  if (step === "enter") {
    return (
      <form action={sendCode} className="space-y-3">
        <div>
          <label className={labelCls}>
            {t.auth.name} <span className="font-normal text-muted">({t.common.optional})</span>
          </label>
          <input name="name" className={inputCls} placeholder={t.auth.namePlaceholder} />
        </div>
        <div>
          <label className={labelCls}>{t.auth.phone}</label>
          <input name="phone" type="tel" required autoComplete="tel" className={inputCls} placeholder={t.auth.phonePlaceholder} />
        </div>
        {error && <p className="text-xs text-rose-600">{error}</p>}
        <button type="submit" disabled={pending} className={primaryBtn}>
          <Smartphone size={15} /> {pending ? t.auth.sending : t.auth.sendCode}
        </button>
      </form>
    );
  }

  return (
    <form action={verify} className="space-y-3">
      <p className="text-xs text-muted">{t.auth.codeSent}</p>
      {devCode && (
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
          {t.auth.devCodeHint(devCode)}
        </p>
      )}
      <div>
        <label className={labelCls}>{t.auth.code}</label>
        <input
          name="code"
          inputMode="numeric"
          autoComplete="one-time-code"
          required
          className={`${inputCls} tracking-[0.4em]`}
          placeholder={t.auth.codePlaceholder}
        />
      </div>
      {error && <p className="text-xs text-rose-600">{error}</p>}
      <button type="submit" disabled={pending} className={primaryBtn}>
        {pending ? t.auth.verifying : t.auth.verify}
      </button>
      <button
        type="button"
        onClick={() => {
          setStep("enter");
          setError(null);
        }}
        className="w-full text-center text-xs text-muted hover:text-slate-700"
      >
        {t.auth.changeNumber}
      </button>
    </form>
  );
}

const primaryBtn =
  "inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 disabled:opacity-60";
