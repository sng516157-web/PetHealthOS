// Shared, isomorphic field validation used by BOTH client components (for
// inline UX: live email checks, phone auto-formatting) and server actions (the
// security source of truth). No server-only imports here so it can run in the
// browser bundle. Validators return stable string CODES; the UI maps a code to
// a localized message via `t.validation[code]` (see `validationMessage`).

import {
  parsePhoneNumberFromString,
  AsYouType,
  type CountryCode,
} from "libphonenumber-js";

// The app is China-first, so unprefixed numbers are parsed as Chinese; a
// leading "+" lets the user enter any international number.
export const DEFAULT_PHONE_REGION: CountryCode = "CN";

// Field length ceilings (defense against absurd input / abuse).
export const NAME_MAX = 80;
export const ORG_NAME_MAX = 120;
export const EMAIL_MAX = 254;
export const PASSWORD_MIN = 6;
export const PASSWORD_MAX = 200;
export const NOTE_MAX = 2000;
export const TITLE_MAX = 120;
export const WEIGHT_MAX_KG = 200;
export const GUARANTEE_DAYS_MAX = 3650; // 10 years
export const MICROCHIP_MAX = 40;

// Stable error codes. Keep in sync with the `validation` namespace in
// `src/lib/i18n/en.ts` / `zh.ts`.
export const VErr = {
  REQUIRED: "REQUIRED",
  NAME_REQUIRED: "NAME_REQUIRED",
  NAME_TOO_LONG: "NAME_TOO_LONG",
  ORG_NAME_REQUIRED: "ORG_NAME_REQUIRED",
  ORG_NAME_TOO_LONG: "ORG_NAME_TOO_LONG",
  EMAIL_REQUIRED: "EMAIL_REQUIRED",
  EMAIL_INVALID: "EMAIL_INVALID",
  EMAIL_TAKEN: "EMAIL_TAKEN",
  PASSWORD_REQUIRED: "PASSWORD_REQUIRED",
  PASSWORD_SHORT: "PASSWORD_SHORT",
  PHONE_REQUIRED: "PHONE_REQUIRED",
  PHONE_INVALID: "PHONE_INVALID",
  CODE_REQUIRED: "CODE_REQUIRED",
  CODE_FORMAT: "CODE_FORMAT",
  TITLE_REQUIRED: "TITLE_REQUIRED",
  TITLE_TOO_LONG: "TITLE_TOO_LONG",
  DATE_INVALID: "DATE_INVALID",
  DATE_FUTURE: "DATE_FUTURE",
  DATE_REQUIRED: "DATE_REQUIRED",
  WEIGHT_REQUIRED: "WEIGHT_REQUIRED",
  WEIGHT_INVALID: "WEIGHT_INVALID",
  NUMBER_INVALID: "NUMBER_INVALID",
  DAYS_INVALID: "DAYS_INVALID",
  NOTE_TOO_LONG: "NOTE_TOO_LONG",
  TERMS_TOO_LONG: "TERMS_TOO_LONG",
  BREED_REQUIRED: "BREED_REQUIRED",
  COLOR_REQUIRED: "COLOR_REQUIRED",
  SEX_REQUIRED: "SEX_REQUIRED",
  PHOTO_REQUIRED: "PHOTO_REQUIRED",
  PHOTO_TOO_BIG: "PHOTO_TOO_BIG",
  BIRTH_OR_INTAKE_REQUIRED: "BIRTH_OR_INTAKE_REQUIRED",
  LEGAL_ACCEPT_REQUIRED: "LEGAL_ACCEPT_REQUIRED",
  MICROCHIP_TOO_LONG: "MICROCHIP_TOO_LONG",
  MICROCHIP_INVALID: "MICROCHIP_INVALID",
} as const;

export type VErrCode = (typeof VErr)[keyof typeof VErr];

// ---------------------------------------------------------------------------
// Email
// ---------------------------------------------------------------------------

// Pragmatic, RFC-pragmatic email check: one @, no spaces, a dotted domain.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

export function isValidEmail(value: string): boolean {
  const v = value.trim();
  return v.length > 0 && v.length <= EMAIL_MAX && EMAIL_RE.test(v);
}

/** Returns an error code or null. */
export function validateEmail(value: string, required = true): VErrCode | null {
  const v = value.trim();
  if (!v) return required ? VErr.EMAIL_REQUIRED : null;
  return isValidEmail(v) ? null : VErr.EMAIL_INVALID;
}

// ---------------------------------------------------------------------------
// Password
// ---------------------------------------------------------------------------

export function validatePassword(value: string): VErrCode | null {
  if (!value) return VErr.PASSWORD_REQUIRED;
  if (value.length < PASSWORD_MIN) return VErr.PASSWORD_SHORT;
  if (value.length > PASSWORD_MAX) return VErr.PASSWORD_SHORT;
  return null;
}

// ---------------------------------------------------------------------------
// Names / free text
// ---------------------------------------------------------------------------

export function validateRequiredName(
  value: string,
  code: VErrCode = VErr.NAME_REQUIRED,
  max = NAME_MAX,
  tooLong: VErrCode = VErr.NAME_TOO_LONG,
): VErrCode | null {
  const v = value.trim();
  if (!v) return code;
  if (v.length > max) return tooLong;
  return null;
}

export function validateMaxLen(
  value: string,
  max: number,
  code: VErrCode,
): VErrCode | null {
  return value.trim().length > max ? code : null;
}

// ---------------------------------------------------------------------------
// Phone (region-aware via libphonenumber-js)
// ---------------------------------------------------------------------------

function usesIntlPrefix(value: string): boolean {
  return value.trim().startsWith("+");
}

/**
 * Format a phone number as the user types, per the region's grouping rules.
 * A leading "+" switches to international parsing; otherwise the default region
 * (China) is assumed. Safe to call on every keystroke.
 */
export function formatPhoneAsYouType(
  value: string,
  region: CountryCode = DEFAULT_PHONE_REGION,
): string {
  const formatter = new AsYouType(usesIntlPrefix(value) ? undefined : region);
  return formatter.input(value);
}

/** Canonical E.164 (e.g. "+8613800138000") or null when not a valid number. */
export function toE164(
  value: string,
  region: CountryCode = DEFAULT_PHONE_REGION,
): string | null {
  if (!value.trim()) return null;
  const parsed = parsePhoneNumberFromString(
    value,
    usesIntlPrefix(value) ? undefined : region,
  );
  return parsed && parsed.isValid() ? parsed.number : null;
}

export function isValidPhone(
  value: string,
  region: CountryCode = DEFAULT_PHONE_REGION,
): boolean {
  return toE164(value, region) != null;
}

export function validatePhone(
  value: string,
  region: CountryCode = DEFAULT_PHONE_REGION,
  required = true,
): VErrCode | null {
  const v = value.trim();
  if (!v) return required ? VErr.PHONE_REQUIRED : null;
  return isValidPhone(v, region) ? null : VErr.PHONE_INVALID;
}

/** Pretty, human-readable form for display (international grouping). */
export function formatPhoneDisplay(
  value: string,
  region: CountryCode = DEFAULT_PHONE_REGION,
): string {
  const parsed = parsePhoneNumberFromString(
    value,
    usesIntlPrefix(value) ? undefined : region,
  );
  return parsed ? parsed.formatInternational() : value;
}

// ---------------------------------------------------------------------------
// OTP code
// ---------------------------------------------------------------------------

export function validateOtpCode(value: string): VErrCode | null {
  const v = value.trim();
  if (!v) return VErr.CODE_REQUIRED;
  return /^\d{4,8}$/.test(v) ? null : VErr.CODE_FORMAT;
}

// ---------------------------------------------------------------------------
// Numbers
// ---------------------------------------------------------------------------

export function parseWeightKg(value: string): number | null {
  const v = value.trim();
  if (!v) return null;
  const n = Number(v);
  if (!Number.isFinite(n) || n <= 0 || n > WEIGHT_MAX_KG) return null;
  return n;
}

/** Pet sex on create — MALE or FEMALE only (not UNKNOWN). */
export function validatePetSex(value: string): VErrCode | null {
  const v = value.trim();
  if (!v || v === "UNKNOWN" || (v !== "MALE" && v !== "FEMALE")) {
    return VErr.SEX_REQUIRED;
  }
  return null;
}

/** Profile photo on pet create — optional; only size-checked when provided (max 8 MB). */
export function validatePetPhoto(file: File | null | undefined): VErrCode | null {
  if (!file || file.size === 0) return null;
  if (file.size > 8 * 1024 * 1024) return VErr.PHOTO_TOO_BIG;
  return null;
}

/** ISO-style or legacy chip IDs — letters, digits, spaces, hyphens; empty clears. */
export function validateMicrochip(value: string): VErrCode | null {
  const v = value.trim();
  if (!v) return null;
  if (v.length > MICROCHIP_MAX) return VErr.MICROCHIP_TOO_LONG;
  if (!/^[A-Za-z0-9][A-Za-z0-9\s-]*$/.test(v)) return VErr.MICROCHIP_INVALID;
  return null;
}

export function normalizeMicrochip(value: string): string | null {
  const v = value.trim();
  return v || null;
}

export function validateWeightKg(
  value: string,
  required = true,
): VErrCode | null {
  const v = value.trim();
  if (!v) return required ? VErr.WEIGHT_REQUIRED : null;
  return parseWeightKg(v) == null ? VErr.WEIGHT_INVALID : null;
}

export function validatePositiveInt(
  value: string,
  max: number,
  required = true,
): VErrCode | null {
  const v = value.trim();
  if (!v) return required ? VErr.NUMBER_INVALID : null;
  const n = Number(v);
  if (!Number.isFinite(n) || !Number.isInteger(n) || n < 1 || n > max) {
    return VErr.DAYS_INVALID;
  }
  return null;
}

// ---------------------------------------------------------------------------
// Dates
// ---------------------------------------------------------------------------

function endOfToday(): number {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d.getTime();
}

/**
 * Pet create: birth date and/or intake date — at least one required; each provided
 * value must be a valid past-or-today date.
 */
export function validatePetDates(
  birthRaw: string,
  intakeRaw: string,
): { birth?: VErrCode; intake?: VErrCode; dates?: VErrCode } | null {
  const birth = birthRaw.trim();
  const intake = intakeRaw.trim();
  if (!birth && !intake) return { dates: VErr.BIRTH_OR_INTAKE_REQUIRED };
  const out: { birth?: VErrCode; intake?: VErrCode } = {};
  if (birth) {
    const err = validatePastOrToday(birth, false);
    if (err) out.birth = err;
  }
  if (intake) {
    const err = validatePastOrToday(intake, false);
    if (err) out.intake = err;
  }
  return out.birth || out.intake ? out : null;
}

export function resolveLogOccurredAt(
  raw?: string,
): { date: Date } | { error: typeof VErr.DATE_INVALID | typeof VErr.DATE_FUTURE } {
  const v = raw?.trim();
  const date = v ? new Date(v) : new Date();
  if (Number.isNaN(date.getTime())) return { error: VErr.DATE_INVALID };
  if (date.getTime() > endOfToday()) return { error: VErr.DATE_FUTURE };
  return { date };
}

/** A date that must be a real date and not in the future (birthDate, weigh-in). */
export function validatePastOrToday(
  value: string,
  required = false,
): VErrCode | null {
  const v = value.trim();
  if (!v) return required ? VErr.DATE_REQUIRED : null;
  const t = new Date(v).getTime();
  if (Number.isNaN(t)) return VErr.DATE_INVALID;
  if (t > endOfToday()) return VErr.DATE_FUTURE;
  return null;
}

/** A date that must be a real date (any time), e.g. a reminder due date. */
export function validateDate(value: string, required = false): VErrCode | null {
  const v = value.trim();
  if (!v) return required ? VErr.DATE_REQUIRED : null;
  return Number.isNaN(new Date(v).getTime()) ? VErr.DATE_INVALID : null;
}

// ---------------------------------------------------------------------------
// Client helper: resolve a code (or raw server string) to a localized message
// ---------------------------------------------------------------------------

type ValidationDict = Record<string, string>;

/**
 * Map a validation code to a localized message. Falls back to the raw string
 * (so legacy raw-English server errors still render) and finally to a generic
 * message. `dict` is `t.validation`.
 */
export function validationMessage(
  dict: ValidationDict | undefined,
  code: string | null | undefined,
  fallback?: string,
): string {
  if (!code) return fallback ?? "";
  if (dict && code in dict) return dict[code];
  return fallback ?? code;
}
