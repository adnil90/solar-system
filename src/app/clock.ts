import { JD_MAX, JD_MIN, jdAtStep } from "../core/time";

const STEPS_PER_DAY = 24;

type ClockState = "Playing" | "Paused";

export interface Clock {
  readonly jd: number;
  readonly n: number;
  readonly speedStepsPerSecond: number;
  readonly remainder: number;
  readonly state: ClockState;
  update(elapsedSeconds: number): number;
  play(): void;
  pause(): void;
  setSpeed(stepsPerSecond: number): void;
  jump(jd: number): void;
}

function wholeHourWithinBounds(jd: number): number {
  // Rounding the hour count since the Unix epoch instead turns 14:30 into 14:00, pinned by 'jump rounds to the nearest whole hour, a half hour rounding up' in clock.test.ts.
  const wholeHour = Math.round(jd * STEPS_PER_DAY) / STEPS_PER_DAY;
  return Math.min(Math.max(wholeHour, JD_MIN), JD_MAX);
}

export function createClock(
  startJd: number,
  speedStepsPerSecond: number,
): Clock {
  if (!Number.isFinite(startJd)) {
    throw new RangeError(`startJd must be finite, got ${startJd}`);
  }
  if (!Number.isFinite(speedStepsPerSecond)) {
    throw new RangeError(
      `speedStepsPerSecond must be finite, got ${speedStepsPerSecond}`,
    );
  }

  let start = wholeHourWithinBounds(startJd);
  let n = 0;
  let speed = speedStepsPerSecond;
  let remainder = 0;
  let state: ClockState = "Paused";

  const nMax = () => Math.round((JD_MAX - start) * STEPS_PER_DAY);
  const nMin = () => Math.round((JD_MIN - start) * STEPS_PER_DAY);

  function stopAt(bound: number): number {
    const applied = bound - n;
    n = bound;
    remainder = 0;
    state = "Paused";
    return applied;
  }

  return {
    get jd() {
      return jdAtStep(start, n);
    },
    get n() {
      return n;
    },
    get speedStepsPerSecond() {
      return speed;
    },
    get remainder() {
      return remainder;
    },
    get state() {
      return state;
    },
    update(elapsedSeconds) {
      if (state === "Paused" || !Number.isFinite(elapsedSeconds)) {
        return 0;
      }
      remainder += speed * Math.max(elapsedSeconds, 0);
      // `+ 0` turns -0 into 0, pinned by 'update never returns -0' in clock.test.ts.
      const steps = Math.trunc(remainder) + 0;
      if (steps > 0 && n + steps >= nMax()) {
        return stopAt(nMax());
      }
      if (steps < 0 && n + steps <= nMin()) {
        return stopAt(nMin());
      }
      n += steps;
      remainder -= steps;
      return steps;
    },
    play() {
      if ((speed > 0 && n < nMax()) || (speed < 0 && n > nMin())) {
        state = "Playing";
      }
    },
    pause() {
      state = "Paused";
      remainder = 0;
    },
    setSpeed(stepsPerSecond) {
      if (!Number.isFinite(stepsPerSecond)) {
        return;
      }
      speed = stepsPerSecond;
      remainder = 0;
    },
    jump(jd) {
      if (!Number.isFinite(jd)) {
        return;
      }
      start = wholeHourWithinBounds(jd);
      n = 0;
      remainder = 0;
    },
  };
}
