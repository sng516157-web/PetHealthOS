"use client";

import { useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogIn, UserPlus, Smartphone, Store } from "lucide-react";
import { signIn, register, requestPhoneOtp, verifyPhoneOtp } from "@/app/actions";
import { useI18n } from "@/lib/i18n/client";
import type { Dictionary } from "@/lib/i18n/en";
import { FieldError } from "@/components/FieldError";
import { PhoneInput } from "@/components/PhoneInput";
import {
  validateEmail,
  validatePassword,
  validateRequiredName,
  validatePhone,
  validateOtpCode,
  validationMessage,
  VErr,
} from "@/lib/validation";
import { trackSignUp, type AccountSegment } from "@/lib/analytics";
import { LegalAcceptField, isLegalAccepted } from "@/components/LegalAcceptField";

function vmsg(t: Dictionary, code: string | null | undefined): string {
  return validationMessage(
    t.validation as unknown as Record<string, string>,
    code,
    code ?? undefined,
  );
}

const inputCls =
  "w-full rounded-xl border border-border bg-white px-3 py-2.5 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100";
const labelCls = "mb-1 block text-xs font-medium text-slate-600";

// Phone / SMS-OTP sign-in is parked until we have an SMS provider (Twilio for
// HK/intl, or Aliyun/Tencent for mainland — see docs/CONTEXT.md). Flip this to
// `true` to re-enable the Phone tab once a provider is configured.
const PHONE_AUTH_ENABLED: boolean = false;

type Tab = "signin" | "register" | "phone";
type AccountType = "owner" | "shop" | "facility";

function dest(type?: string, needsVerification?: boolean) {
  if (needsVerification) return "/verify-email";
  return type === "shop" || type === "facility" ? "/app" : "/me";
}

export function AuthCard({
  accountType = "owner",
  defaultTab = "signin",
}: {
  accountType?: AccountType;
  defaultTab?: Tab;
}) {
  const { t } = useI18n();
  // Never land on the parked Phone tab while it's disabled.
  const initialTab: Tab =
    !PHONE_AUTH_ENABLED && defaultTab === "phone" ? "signin" : defaultTab;
  const [tab, setTab] = useState<Tab>(initialTab);

  const tabs: { id: Tab; label: string; icon: React.ReactNode; disabled?: boolean }[] = [
    { id: "signin", label: t.auth.tabSignIn, icon: <LogIn size={14} /> },
    { id: "register", label: t.auth.tabRegister, icon: <UserPlus size={14} /> },
    {
      id: "phone",
      label: t.auth.tabPhone,
      icon: <Smartphone size={14} />,
      disabled: !PHONE_AUTH_ENABLED,
    },
  ];

  return (
    <div className="rounded-2xl border border-border bg-surface p-6 shadow-soft">
      <div className="mb-5 grid grid-cols-3 gap-1 rounded-xl bg-slate-100 p-1">
        {tabs.map((tb) => {
          if (tb.disabled) {
            return (
              <span
                key={tb.id}
                aria-disabled="true"
                title={t.auth.phoneSoon}
                className="inline-flex cursor-not-allowed items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-medium text-slate-300"
              >
                {tb.icon} {tb.label}
              </span>
            );
          }
          return (
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
          );
        })}
      </div>

      {tab === "signin" && <SignInTab t={t} />}
      {tab === "register" && (
        <RegisterTab t={t} accountType={accountType} />
      )}
      {PHONE_AUTH_ENABLED && tab === "phone" && (
        <PhoneTab t={t} accountType={accountType} />
      )}
    </div>
  );
}

function SignInTab({ t }: { t: Dictionary }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [fieldErr, setFieldErr] = useState<{ email?: string | null; password?: string | null }>({});
  const [conflict, setConflict] = useState(false);
  const lastData = useRef<FormData | null>(null);

  function run(formData: FormData) {
    start(async () => {
      const res = await signIn(formData);
      if (res && "conflict" in res && res.conflict) {
        lastData.current = formData;
        setConflict(true);
        return;
      }
      if (res?.error) setError(vmsg(t, res.error));
      else router.push(dest(res?.accountType, res && "needsVerification" in res && res.needsVerification));
    });
  }

  function submit(formData: FormData) {
    setError(null);
    setConflict(false);
    const email = String(formData.get("email") || "");
    const password = String(formData.get("password") || "");
    const fe = {
      email: validateEmail(email),
      password: password ? null : VErr.PASSWORD_REQUIRED,
    };
    setFieldErr(fe);
    if (fe.email || fe.password) return;
    run(formData);
  }

  function kickAndContinue() {
    const fd = lastData.current;
    if (!fd) return;
    fd.set("force", "1");
    setConflict(false);
    run(fd);
  }

  return (
    <form action={submit} noValidate className="space-y-3">
      <div>
        <label className={labelCls}>{t.auth.email}</label>
        <input name="email" type="email" autoComplete="email" className={inputCls} placeholder={t.auth.emailPlaceholder} />
        <FieldError code={fieldErr.email} />
      </div>
      <div>
        <label className={labelCls}>{t.auth.password}</label>
        <input name="password" type="password" autoComplete="current-password" className={inputCls} />
        <FieldError code={fieldErr.password} />
        <Link
          href="/forgot-password"
          className="mt-1.5 inline-block text-xs text-brand-700 underline hover:text-brand-800"
        >
          {t.auth.forgotPassword}
        </Link>
      </div>
      {error && <p className="text-xs text-rose-600">{error}</p>}
      {conflict && (
        <DeviceConflict
          t={t}
          pending={pending}
          onKick={kickAndContinue}
          onCancel={() => setConflict(false)}
        />
      )}
      <button type="submit" disabled={pending} className={primaryBtn}>
        <LogIn size={15} /> {pending ? t.auth.signingIn : t.auth.signIn}
      </button>
    </form>
  );
}

function RegisterTab({
  t,
  accountType,
}: {
  t: Dictionary;
  accountType: AccountType;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [fieldErr, setFieldErr] = useState<{
    orgName?: string | null;
    name?: string | null;
    email?: string | null;
    password?: string | null;
    legal?: string | null;
  }>({});
  const isShop = accountType === "shop";
  const isFacility = accountType === "facility";
  const isOrg = isShop || isFacility;

  function submit(formData: FormData) {
    setError(null);
    const orgName = String(formData.get("orgName") || "");
    const name = String(formData.get("name") || "");
    const email = String(formData.get("email") || "");
    const password = String(formData.get("password") || "");
    const fe = {
      orgName: isOrg
        ? validateRequiredName(orgName, VErr.ORG_NAME_REQUIRED, 120, VErr.ORG_NAME_TOO_LONG)
        : null,
      name: validateRequiredName(name),
      email: validateEmail(email),
      password: validatePassword(password),
      legal: isLegalAccepted(formData) ? null : VErr.LEGAL_ACCEPT_REQUIRED,
    };
    setFieldErr(fe);
    if (fe.orgName || fe.name || fe.email || fe.password || fe.legal) return;
    start(async () => {
      const res = await register(formData);
      if (res?.error) {
        // Surface duplicate-email under the email field; others as a banner.
        if (res.error === VErr.EMAIL_TAKEN || res.error === VErr.EMAIL_INVALID) {
          setFieldErr((p) => ({ ...p, email: res.error }));
        } else if (res.error === VErr.LEGAL_ACCEPT_REQUIRED) {
          setFieldErr((p) => ({ ...p, legal: res.error }));
        } else {
          setError(vmsg(t, res.error));
        }
      } else {
        if (res.devVerifyLink) {
          console.log("[email:dev] Verification link:", res.devVerifyLink);
        }
        if (res.verifyError) {
          setError(
            t.verifyEmail.errors[res.verifyError as keyof typeof t.verifyEmail.errors] ??
              t.verifyEmail.errors.SEND_FAILED,
          );
        }
        const segment: AccountSegment =
          accountType === "facility"
            ? "facility"
            : accountType === "shop"
              ? "shop"
              : "owner";
        trackSignUp(segment);
        const q = res.verifyError ? `?error=${encodeURIComponent(res.verifyError)}` : "";
        router.push(`${dest(res?.accountType, res?.needsVerification)}${q}`);
      }
    });
  }

  return (
    <form action={submit} noValidate className="space-y-3">
      <input type="hidden" name="accountType" value={accountType} />
      {isShop && (
        <>
          <div>
            <label className={labelCls}>{t.auth.shopName}</label>
            <input name="orgName" className={inputCls} placeholder={t.auth.shopNamePlaceholder} />
            <FieldError code={fieldErr.orgName} />
          </div>
          <div>
            <label className={labelCls}>{t.auth.shopKind}</label>
            <select name="orgKind" defaultValue="BREEDER" className={inputCls}>
              <option value="BREEDER">{t.auth.kindBreeder}</option>
              <option value="SHOP">{t.auth.kindShop}</option>
              <option value="SHELTER">{t.auth.kindShelter}</option>
            </select>
          </div>
        </>
      )}
      {isFacility && (
        <>
          <div>
            <label className={labelCls}>{t.auth.facilityName}</label>
            <input name="orgName" className={inputCls} placeholder={t.auth.facilityNamePlaceholder} />
            <FieldError code={fieldErr.orgName} />
          </div>
          <div>
            <label className={labelCls}>{t.landing.facility.kindLabel}</label>
            <select name="orgKind" defaultValue="HOSPITAL" className={inputCls}>
              <option value="HOSPITAL">{t.landing.facility.kindHospital}</option>
              <option value="BOARDING">{t.landing.facility.kindBoarding}</option>
            </select>
          </div>
        </>
      )}
      <div>
        <label className={labelCls}>{isOrg ? t.auth.contactName : t.auth.name}</label>
        <input name="name" className={inputCls} placeholder={t.auth.namePlaceholder} />
        <FieldError code={fieldErr.name} />
      </div>
      <div>
        <label className={labelCls}>{t.auth.email}</label>
        <input name="email" type="email" autoComplete="email" className={inputCls} placeholder={t.auth.emailPlaceholder} />
        <FieldError code={fieldErr.email} />
      </div>
      <div>
        <label className={labelCls}>{t.auth.password}</label>
        <input name="password" type="password" autoComplete="new-password" className={inputCls} placeholder={t.auth.createPasswordPlaceholder} />
        <FieldError code={fieldErr.password} />
      </div>
      {error && <p className="text-xs text-rose-600">{error}</p>}
      <LegalAcceptField t={t} error={fieldErr.legal} />
      <button type="submit" disabled={pending} className={primaryBtn}>
        {isOrg ? <Store size={15} /> : <UserPlus size={15} />}{" "}
        {pending
          ? t.auth.registering
          : isFacility
            ? t.auth.createFacility
            : isShop
              ? t.auth.createShop
              : t.auth.register}
      </button>
    </form>
  );
}

function PhoneTab({ t, accountType }: { t: Dictionary; accountType: AccountType }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<"enter" | "code">("enter");
  const [phone, setPhone] = useState("");
  const [phoneInput, setPhoneInput] = useState("");
  const [phoneErr, setPhoneErr] = useState<string | null>(null);
  const [codeErr, setCodeErr] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [orgName, setOrgName] = useState("");
  const [devCode, setDevCode] = useState<string | null>(null);
  const [conflict, setConflict] = useState(false);
  const lastData = useRef<FormData | null>(null);
  const isShop = accountType === "shop";

  function smsError(code: string): string {
    return (t.auth.smsErr as Record<string, string>)[code] ?? code;
  }

  function sendCode(formData: FormData) {
    setError(null);
    setDevCode(null);
    const pe = validatePhone(phoneInput);
    setPhoneErr(pe);
    if (pe) return;
    start(async () => {
      const res = await requestPhoneOtp(formData);
      if ("error" in res) {
        setError(smsError(res.error));
        return;
      }
      setPhone(String(formData.get("phone") || ""));
      setName(String(formData.get("name") || ""));
      setOrgName(String(formData.get("orgName") || ""));
      if (res.devCode) setDevCode(res.devCode);
      setStep("code");
    });
  }

  function runVerify(formData: FormData) {
    start(async () => {
      const res = await verifyPhoneOtp(formData);
      if ("conflict" in res && res.conflict) {
        lastData.current = formData;
        setConflict(true);
        return;
      }
      if ("error" in res) setError(smsError(res.error));
      else router.push(dest(res.accountType));
    });
  }

  function verify(formData: FormData) {
    setError(null);
    setConflict(false);
    const ce = validateOtpCode(String(formData.get("code") || ""));
    setCodeErr(ce);
    if (ce) return;
    formData.set("phone", phone);
    formData.set("name", name);
    formData.set("accountType", accountType);
    if (orgName) formData.set("orgName", orgName);
    runVerify(formData);
  }

  function kickAndContinue() {
    const fd = lastData.current;
    if (!fd) return;
    fd.set("force", "1");
    setConflict(false);
    runVerify(fd);
  }

  if (step === "enter") {
    return (
      <form action={sendCode} className="space-y-3">
        {isShop && (
          <div>
            <label className={labelCls}>{t.auth.shopName}</label>
            <input name="orgName" className={inputCls} placeholder={t.auth.shopNamePlaceholder} />
          </div>
        )}
        <div>
          <label className={labelCls}>
            {t.auth.name} <span className="font-normal text-muted">({t.common.optional})</span>
          </label>
          <input name="name" className={inputCls} placeholder={t.auth.namePlaceholder} />
        </div>
        <div>
          <label className={labelCls}>{t.auth.phone}</label>
          <PhoneInput
            name="phone"
            value={phoneInput}
            onChange={setPhoneInput}
            className={inputCls}
            placeholder={t.auth.phonePlaceholder}
          />
          <FieldError code={phoneErr} />
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
          className={`${inputCls} tracking-[0.4em]`}
          placeholder={t.auth.codePlaceholder}
        />
        <FieldError code={codeErr} />
      </div>
      {error && <p className="text-xs text-rose-600">{error}</p>}
      {conflict && (
        <DeviceConflict
          t={t}
          pending={pending}
          onKick={kickAndContinue}
          onCancel={() => setConflict(false)}
        />
      )}
      <button type="submit" disabled={pending} className={primaryBtn}>
        {pending ? t.auth.verifying : t.auth.verify}
      </button>
      <button
        type="button"
        onClick={() => {
          setStep("enter");
          setError(null);
          setConflict(false);
        }}
        className="w-full text-center text-xs text-muted hover:text-slate-700"
      >
        {t.auth.changeNumber}
      </button>
    </form>
  );
}

function DeviceConflict({
  t,
  pending,
  onKick,
  onCancel,
}: {
  t: Dictionary;
  pending: boolean;
  onKick: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="space-y-2 rounded-xl border border-amber-200 bg-amber-50 p-3">
      <p className="text-sm font-semibold text-amber-900">
        {t.auth.deviceConflictTitle}
      </p>
      <p className="text-xs leading-relaxed text-amber-800">
        {t.auth.deviceConflictDesc}
      </p>
      <div className="flex flex-col gap-2 pt-1 sm:flex-row">
        <button
          type="button"
          onClick={onKick}
          disabled={pending}
          className="inline-flex flex-1 items-center justify-center rounded-lg bg-amber-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-amber-700 disabled:opacity-60"
        >
          {pending ? t.auth.signingIn : t.auth.kickAndContinue}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={pending}
          className="inline-flex flex-1 items-center justify-center rounded-lg border border-amber-300 bg-white px-3 py-2 text-xs font-semibold text-amber-800 transition hover:bg-amber-100 disabled:opacity-60"
        >
          {t.auth.cancelLogin}
        </button>
      </div>
    </div>
  );
}

const primaryBtn =
  "inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 disabled:opacity-60";
