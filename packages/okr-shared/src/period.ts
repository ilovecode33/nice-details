const DAY_MS = 24 * 60 * 60 * 1000;

interface PeriodFormatters {
  monthDay: Intl.DateTimeFormat;
  monthDayYear: Intl.DateTimeFormat;
}

const formatterCache = new Map<string, PeriodFormatters>();

function periodFormatters(locale: string): PeriodFormatters {
  let formatters = formatterCache.get(locale);
  if (!formatters) {
    formatters = {
      monthDay: new Intl.DateTimeFormat(locale, {
        month: 'short',
        day: 'numeric',
        timeZone: 'UTC',
      }),
      monthDayYear: new Intl.DateTimeFormat(locale, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        timeZone: 'UTC',
      }),
    };
    formatterCache.set(locale, formatters);
  }
  return formatters;
}

/** Two-digit zero padding for date parts. */
function pad2(value: number): string {
  return String(value).padStart(2, '0');
}

/** Parses a YYYY-MM-DD prefix into a UTC timestamp, or null when invalid. */
function parseDate(value: string): number | null {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  const time = Date.UTC(year, month - 1, day);
  return Number.isFinite(time) ? time : null;
}

/** Returns the YYYY-MM-DD part of a date or ISO timestamp. */
export function toDateOnly(value: string | Date): string {
  if (typeof value === 'string') {
    const match = value.match(/^(\d{4}-\d{2}-\d{2})/);
    if (match) return match[1];
  }
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

/** Today's local date as YYYY-MM-DD. */
export function todayIso(): string {
  return toDateOnly(new Date());
}

/** Adds calendar months, clamping to the last valid day of the target month. */
export function addMonths(isoDate: string, months: number): string {
  const match = isoDate.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return isoDate;
  const year = Number(match[1]);
  const month = Number(match[2]) - 1;
  const day = Number(match[3]);
  const target = new Date(Date.UTC(year, month + months, 1));
  const lastDay = new Date(
    Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0),
  ).getUTCDate();
  target.setUTCDate(Math.min(day, lastDay));
  return `${target.getUTCFullYear()}-${pad2(target.getUTCMonth() + 1)}-${pad2(
    target.getUTCDate(),
  )}`;
}

/** Formats a date range with a single year when both dates share it. */
export function formatPeriodLabel(
  startDate: string,
  endDate: string,
  locale = 'en-US',
): string {
  const start = parseDate(startDate);
  const end = parseDate(endDate);
  if (start === null || end === null) return '';
  const startDateObject = new Date(start);
  const endDateObject = new Date(end);
  const { monthDay, monthDayYear } = periodFormatters(locale);
  return startDateObject.getUTCFullYear() === endDateObject.getUTCFullYear()
    ? `${monthDay.format(startDateObject)} – ${monthDayYear.format(endDateObject)}`
    : `${monthDayYear.format(startDateObject)} – ${monthDayYear.format(endDateObject)}`;
}

/** Status of an objective's time window. */
export type PeriodStatus = 'upcoming' | 'active' | 'ended';

/** Countdown data for an objective's time window. */
export interface PeriodProgress {
  status: PeriodStatus;
  /** Days until the start (upcoming) or end (active); 0 when ended. */
  daysLeft: number;
  /** Elapsed percentage of the window, from 0 to 100. */
  percent: number;
}

/**
 * Counts down an objective's start/end window by whole days and elapsed
 * percentage. The end date is inclusive: on the last day the status is active
 * with 0 days left and 100% elapsed.
 */
export function periodProgress(
  startDate?: string,
  endDate?: string,
  now: Date | string = new Date(),
): PeriodProgress {
  if (!startDate || !endDate) {
    return { status: 'ended', daysLeft: 0, percent: 100 };
  }
  const start = parseDate(startDate);
  const end = parseDate(endDate);
  const current = parseDate(toDateOnly(now));
  if (start === null || end === null || current === null || end < start) {
    return { status: 'ended', daysLeft: 0, percent: 100 };
  }
  if (current < start) {
    return {
      status: 'upcoming',
      daysLeft: Math.ceil((start - current) / DAY_MS),
      percent: 0,
    };
  }
  if (current > end) {
    return { status: 'ended', daysLeft: 0, percent: 100 };
  }
  const total = end - start;
  const elapsed = current - start;
  return {
    status: 'active',
    daysLeft: Math.ceil((end - current) / DAY_MS),
    percent:
      total <= 0
        ? 100
        : Math.min(100, Math.max(0, Math.round((elapsed / total) * 100))),
  };
}

/** Derives a quarter range from a "2026 Q4" style label. */
export function quarterRange(
  period: string,
): { startDate: string; endDate: string } | null {
  const match = period.trim().match(/^(\d{4})\s*Q([1-4])$/i);
  if (!match) return null;
  const year = Number(match[1]);
  const quarter = Number(match[2]);
  const startMonth = (quarter - 1) * 3 + 1;
  const endMonth = quarter * 3;
  const lastDay = new Date(Date.UTC(year, endMonth, 0)).getUTCDate();
  return {
    startDate: `${year}-${pad2(startMonth)}-01`,
    endDate: `${year}-${pad2(endMonth)}-${pad2(lastDay)}`,
  };
}
