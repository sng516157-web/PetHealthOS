/** Natural-language time hints in freeform log notes → concrete Date. */

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function setClock(d: Date, hours: number, minutes: number): Date {
  const x = new Date(d);
  x.setHours(hours, minutes, 0, 0);
  return x;
}

function parse12h(h: number, min: number, meridiem?: string): { hours: number; minutes: number } {
  let hours = h;
  const minutes = min;
  const m = meridiem?.toLowerCase().replace(/\./g, "");
  if (m === "pm" || m === "p") {
    if (hours < 12) hours += 12;
  } else if (m === "am" || m === "a") {
    if (hours === 12) hours = 0;
  } else if (hours <= 12 && !meridiem) {
    // ponytail: ambiguous bare hour (e.g. "at 11") → assume same half-day as now
    const nowH = new Date().getHours();
    if (hours === 12) hours = nowH >= 12 ? 12 : 0;
    else if (nowH >= 12 && hours < 12) hours += 12;
  }
  return { hours, minutes };
}

const TIME_RE =
  /\b(?:at\s+)?(\d{1,2})(?::(\d{2}))?\s*(a\.?m\.?|p\.?m\.?|am|pm)?\b/i;
const ZH_TIME_RE = /(\d{1,2})\s*点(?:\s*(半|(\d{1,2})\s*分))?/;

/**
 * Parse a time-of-day or relative date phrase from note text.
 * Returns null when no time hint is found.
 */
export function parseNaturalLogTime(
  text: string,
  ref: Date = new Date(),
): Date | null {
  const t = text.trim();
  if (!t) return null;

  let day = startOfDay(ref);

  if (/\byesterday\b/i.test(t) || /昨天/.test(t)) {
    day = startOfDay(new Date(ref.getTime() - 86400000));
  } else if (/\b(today|this morning|this afternoon|this evening|tonight)\b/i.test(t) || /今天|今早|今晨|今晚|今下午/.test(t)) {
    day = startOfDay(ref);
  }

  // Fuzzy dayparts (only when no explicit clock time)
  const fuzzy =
    /\bthis morning\b/i.test(t) || /今早|今晨|早上/.test(t)
      ? { h: 8, m: 0 }
      : /\b(this afternoon|at noon)\b/i.test(t) || /下午|中午/.test(t)
        ? { h: 14, m: 0 }
        : /\b(this evening|tonight)\b/i.test(t) || /晚上|今晚/.test(t)
          ? { h: 19, m: 0 }
          : null;

  const en = t.match(TIME_RE);
  if (en) {
    const h = parseInt(en[1], 10);
    const min = en[2] ? parseInt(en[2], 10) : 0;
    const { hours, minutes } = parse12h(h, min, en[3]);
    return setClock(day, hours, minutes);
  }

  const zh = t.match(ZH_TIME_RE);
  if (zh) {
    let h = parseInt(zh[1], 10);
    const min = zh[2] === "半" ? 30 : zh[3] ? parseInt(zh[3], 10) : 0;
    if (/下午|晚上|今晚/.test(t) && h <= 12 && h !== 12) h += 12;
    if (/早上|上午|今早/.test(t) && h === 12) h = 0;
    return setClock(day, h, min);
  }

  if (fuzzy) return setClock(day, fuzzy.h, fuzzy.m);

  // Date-only hints (yesterday/today without clock) → keep ref time on that day
  if (/\byesterday\b/i.test(t) || /昨天/.test(t)) {
    return setClock(day, ref.getHours(), ref.getMinutes());
  }

  return null;
}

/** Value for `<input type="datetime-local">` in local browser time. */
export function toDatetimeLocalValue(d: Date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
