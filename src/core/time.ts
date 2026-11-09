const MS_PER_DAY = 86400000;
const JD_UNIX_EPOCH = 2440587.5;
const STEPS_PER_DAY = 24;

export function jdFromDate(date: Date): number {
  return date.getTime() / MS_PER_DAY + JD_UNIX_EPOCH;
}

export function jdAtStep(startJd: number, n: number): number {
  return startJd + n / STEPS_PER_DAY;
}

export const JD_MIN = jdFromDate(new Date(Date.UTC(1800, 0, 1, 0)));
export const JD_MAX = jdFromDate(new Date(Date.UTC(2050, 11, 31, 23)));
