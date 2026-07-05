/** Natural-language time hints in freeform log notes → concrete Date. */

import { isValidTimezone, DEFAULT_TIMEZONE } from "@/lib/timezone/config";

type ClockMatch = { h: number; min: number; meridiem?: string; score: number };

const DURATION_AFTER =
  /^\s*(minutes|minute|mins|min\b|hours|hour|hrs|hr\b|seconds|second|secs|sec\b|秒|分钟|小时|分)/i;

/** UTC instant for a wall-clock time in an IANA timezone. */
export function zonedTimeToUtc(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  timeZone: string,
): Date {
  const tz = isValidTimezone(timeZone) ? timeZone : DEFAULT_TIMEZONE;
  let utc = Date.UTC(year, month - 1, day, hour, minute, 0);
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const want = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;

  for (let i = 0; i < 3; i++) {
    const parts = Object.fromEntries(fmt.formatToParts(new Date(utc)).map((p) => [p.type, p.value]));
    const got = `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`;
    if (got === want) return new Date(utc);
    utc += ((hour - Number(parts.hour)) * 60 + (minute - Number(parts.minute))) * 60_000;
  }
  return new Date(utc);
}

function calendarDayInZone(d: Date, timeZone: string): [number, number, number] {
  const s = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
  const [y, mo, day] = s.split("-").map(Number);
  return [y, mo, day];
}

function shiftCalendarDay(
  y: number,
  mo: number,
  d: number,
  delta: number,
  timeZone: string,
): [number, number, number] {
  const anchor = zonedTimeToUtc(y, mo, d, 12, 0, timeZone);
  return calendarDayInZone(new Date(anchor.getTime() + delta * 86400000), timeZone);
}

function parse12h(h: number, min: number, meridiem?: string, refHour = 12): { hours: number; minutes: number } {
  let hours = h;
  const minutes = min;
  const m = meridiem?.toLowerCase().replace(/\./g, "");
  if (m === "pm" || m === "p") {
    if (hours < 12) hours += 12;
  } else if (m === "am" || m === "a") {
    if (hours === 12) hours = 0;
  } else if (hours <= 12) {
    if (hours === 12) hours = refHour >= 12 ? 12 : 0;
    else if (refHour >= 12 && hours < 12) hours += 12;
  }
  return { hours, minutes };
}

/** Pick the best clock-time mention; ignores durations like "20 minutes". */
export function extractClockTime(text: string): ClockMatch | null {
  const candidates: ClockMatch[] = [];

  for (const m of text.matchAll(/\bat\s+(\d{1,2})(?::(\d{2}))?\s*(a\.?m\.?|p\.?m\.?)\b/gi)) {
    candidates.push({ h: +m[1], min: m[2] ? +m[2] : 0, meridiem: m[3], score: 100 });
  }

  for (const m of text.matchAll(/\b(\d{1,2}):(\d{2})\s*(a\.?m\.?|p\.?m\.?)?\b/gi)) {
    const idx = m.index ?? 0;
    const before = text.slice(Math.max(0, idx - 8), idx);
    if (/\d\s*$/.test(before)) continue; // skip HH:MM inside dates
    candidates.push({ h: +m[1], min: +m[2], meridiem: m[3], score: m[3] ? 90 : 70 });
  }

  for (const m of text.matchAll(/\b(\d{1,2})\s*(a\.?m\.?|p\.?m\.?)\b/gi)) {
    candidates.push({ h: +m[1], min: 0, meridiem: m[2], score: 85 });
  }

  for (const m of text.matchAll(/\b(\d{1,2})(?::(\d{2}))?\s*(a\.?m\.?|p\.?m\.?)\b/gi)) {
    const tail = text.slice((m.index ?? 0) + m[0].length);
    if (DURATION_AFTER.test(tail)) continue;
    if (!m[3] && +m[1] > 12) continue; // bare 13–24 without am/pm → likely not a time
    candidates.push({
      h: +m[1],
      min: m[2] ? +m[2] : 0,
      meridiem: m[3],
      score: m[3] ? 80 : 40,
    });
  }

  if (!candidates.length) return null;
  candidates.sort((a, b) => b.score - a.score);
  return candidates[0];
}

const ZH_TIME_RE = /(\d{1,2})\s*点(?:\s*(半|(\d{1,2})\s*分))?/;

/**
 * Parse a time-of-day or relative date phrase from note text in the user's timezone.
 * Returns null when no time hint is found.
 */
export function parseNaturalLogTime(
  text: string,
  ref: Date = new Date(),
  timeZone: string = DEFAULT_TIMEZONE,
): Date | null {
  const t = text.trim();
  if (!t) return null;

  const tz = isValidTimezone(timeZone) ? timeZone : DEFAULT_TIMEZONE;
  let [y, mo, d] = calendarDayInZone(ref, tz);

  if (/\byesterday\b/i.test(t) || /昨天/.test(t)) {
    [y, mo, d] = shiftCalendarDay(y, mo, d, -1, tz);
  }

  const refParts = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    hour: "numeric",
    hour12: false,
  }).formatToParts(ref);
  const refHour = Number(refParts.find((p) => p.type === "hour")?.value ?? 12);

  const fuzzy =
    /\bthis morning\b/i.test(t) || /今早|今晨|早上/.test(t)
      ? { h: 8, m: 0 }
      : /\b(this afternoon|at noon)\b/i.test(t) || /下午|中午/.test(t)
        ? { h: 14, m: 0 }
        : /\b(this evening|tonight)\b/i.test(t) || /晚上|今晚/.test(t)
          ? { h: 19, m: 0 }
          : null;

  const en = extractClockTime(t);
  if (en) {
    const { hours, minutes } = parse12h(en.h, en.min, en.meridiem, refHour);
    return zonedTimeToUtc(y, mo, d, hours, minutes, tz);
  }

  const zh = t.match(ZH_TIME_RE);
  if (zh) {
    let h = parseInt(zh[1], 10);
    const min = zh[2] === "半" ? 30 : zh[3] ? parseInt(zh[3], 10) : 0;
    if (/下午|晚上|今晚/.test(t) && h <= 12 && h !== 12) h += 12;
    if (/早上|上午|今早/.test(t) && h === 12) h = 0;
    return zonedTimeToUtc(y, mo, d, h, min, tz);
  }

  if (fuzzy) return zonedTimeToUtc(y, mo, d, fuzzy.h, fuzzy.m, tz);

  if (/\byesterday\b/i.test(t) || /昨天/.test(t)) {
    const refMin = Number(
      new Intl.DateTimeFormat("en-US", { timeZone: tz, minute: "numeric" }).format(ref),
    );
    return zonedTimeToUtc(y, mo, d, refHour, refMin, tz);
  }

  return null;
}

/** Parse `<input type="datetime-local">` value as wall time in the user's timezone. */
export function parseDatetimeLocalValue(raw: string, timeZone: string): Date | null {
  const v = raw.trim();
  const m = v.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
  if (!m) return null;
  return zonedTimeToUtc(+m[1], +m[2], +m[3], +m[4], +m[5], timeZone);
}

/** Value for `<input type="datetime-local">` in local browser time. */
export function toDatetimeLocalValue(d: Date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// ponytail: dev-only sanity check — fails if duration minutes steal the clock parse
if (process.env.NODE_ENV !== "production") {
  const probe = parseNaturalLogTime(
    "Walked 20 minutes at 11 am",
    new Date("2026-07-05T06:00:00.000Z"),
    "Asia/Shanghai",
  );
  const h = probe
    ? Number(
        new Intl.DateTimeFormat("en-US", {
          timeZone: "Asia/Shanghai",
          hour: "numeric",
          hour12: false,
        }).format(probe),
      )
    : -1;
  if (h !== 11) {
    console.warn("[log-time] expected 11am for 'Walked 20 minutes at 11 am', got hour", h);
  }
}
