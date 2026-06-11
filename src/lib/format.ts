import type { Locale } from "./i18n/config";

export function petAge(birthDate?: Date | string | null): string | null {
  if (!birthDate) return null;
  const d = typeof birthDate === "string" ? new Date(birthDate) : birthDate;
  const now = new Date();
  let months =
    (now.getFullYear() - d.getFullYear()) * 12 +
    (now.getMonth() - d.getMonth());
  if (now.getDate() < d.getDate()) months -= 1;
  if (months < 0) return null;
  const years = Math.floor(months / 12);
  const rem = months % 12;
  if (years === 0) return `${rem} mo`;
  if (rem === 0) return `${years} yr`;
  return `${years} yr ${rem} mo`;
}

export type FormatOpts = {
  /** IANA timezone from browser cookie (e.g. Asia/Shanghai). */
  timeZone?: string;
  locale?: Locale;
};

function intlLocale(locale?: Locale): string {
  return locale === "zh" ? "zh-CN" : "en-US";
}

/** Locale- and timezone-aware calendar date. */
export function formatDate(d: Date | string, opts: FormatOpts = {}): string {
  const date = typeof d === "string" ? new Date(d) : d;
  const timeZone = opts.timeZone ?? "UTC";
  return new Intl.DateTimeFormat(intlLocale(opts.locale), {
    timeZone,
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

/** Locale- and timezone-aware date + time. */
export function formatDateTime(d: Date | string, opts: FormatOpts = {}): string {
  const date = typeof d === "string" ? new Date(d) : d;
  const timeZone = opts.timeZone ?? "UTC";
  return new Intl.DateTimeFormat(intlLocale(opts.locale), {
    timeZone,
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: opts.locale !== "zh",
  }).format(date);
}

export function relativeTime(d: Date | string): string {
  const date = typeof d === "string" ? new Date(d) : d;
  const diff = date.getTime() - Date.now();
  const abs = Math.abs(diff);
  const day = 86400000;
  const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });
  if (abs < 3600000) return rtf.format(Math.round(diff / 60000), "minute");
  if (abs < day) return rtf.format(Math.round(diff / 3600000), "hour");
  if (abs < day * 30) return rtf.format(Math.round(diff / day), "day");
  return rtf.format(Math.round(diff / (day * 30)), "month");
}
