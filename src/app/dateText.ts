import { jdFromDate } from "../core/time";

const JD_UNIX_EPOCH = 2440587.5;
const HOURS_PER_DAY = 24;
const MS_PER_HOUR = 3600000;
const DATE_TEXT = /^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2})$/;

export function parseDateText(text: string): number | null {
  const match = DATE_TEXT.exec(text);
  if (match === null) {
    return null;
  }
  const [year, month, day, hour, minute] = match.slice(1).map(Number);
  const date = new Date(0);
  // Date.UTC would read years 0-99 as 1900-1999, pinned by 'reads a year below 100 as written' in dateText.test.ts.
  date.setUTCFullYear(year, month - 1, day);
  date.setUTCHours(hour, minute);
  const isValidDate =
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day &&
    date.getUTCHours() === hour &&
    date.getUTCMinutes() === minute;
  return isValidDate ? jdFromDate(date) : null;
}

export function formatDateText(jd: number): string {
  const hours = Math.round((jd - JD_UNIX_EPOCH) * HOURS_PER_DAY);
  return new Date(hours * MS_PER_HOUR)
    .toISOString()
    .slice(0, 16)
    .replace("T", " ");
}
