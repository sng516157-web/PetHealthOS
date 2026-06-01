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

const MONTHS_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

// Deterministic, locale/timezone-independent date format (e.g. "Jun 2, 2026").
// Avoids toLocaleDateString, which renders differently on the server vs. the
// client and causes React hydration mismatches.
export function formatDate(d: Date | string): string {
  const date = typeof d === "string" ? new Date(d) : d;
  return `${MONTHS_SHORT[date.getUTCMonth()]} ${date.getUTCDate()}, ${date.getUTCFullYear()}`;
}

// Deterministic date + time (UTC) to keep server/client output identical.
export function formatDateTime(d: Date | string): string {
  const date = typeof d === "string" ? new Date(d) : d;
  const h24 = date.getUTCHours();
  const period = h24 >= 12 ? "PM" : "AM";
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  const min = String(date.getUTCMinutes()).padStart(2, "0");
  return `${MONTHS_SHORT[date.getUTCMonth()]} ${date.getUTCDate()}, ${h12}:${min} ${period}`;
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
