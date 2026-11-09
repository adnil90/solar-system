import { describe, expect, it } from "vitest";
import { INITIAL_SPEED_STEPS_PER_S } from "../config/index";
import { JD_MAX, JD_MIN, jdFromDate } from "../core/time";
import { createClock } from "./clock";

const J2000 = 2451545.0;
const TOLERANCE_DAYS = 1e-9;

function expectWithin(actual: number, expected: number, tolerance: number) {
  expect(
    Math.abs(actual - expected),
    `${actual} vs ${expected}`,
  ).toBeLessThanOrEqual(tolerance);
}

function playingAtSpeed(speed: number) {
  const clock = createClock(J2000, speed);
  clock.play();
  return clock;
}

describe("play, pause and steps", () => {
  it("at the initial speed the clock starts Paused and takes 12 steps in half a second of play", () => {
    const clock = createClock(J2000, INITIAL_SPEED_STEPS_PER_S);
    expect(clock.state).toBe("Paused");
    clock.play();
    expect(clock.update(0.5)).toBe(12);
    expect(clock.n).toBe(12);
  });

  it("update takes no steps while Paused", () => {
    const clock = createClock(J2000, 24);
    expect(clock.update(1)).toBe(0);
    expect(clock.n).toBe(0);
    clock.play();
    clock.pause();
    expect(clock.state).toBe("Paused");
    expect(clock.update(1)).toBe(0);
    expect(clock.n).toBe(0);
    expect(clock.remainder).toBe(0);
  });

  it("truncates the whole steps toward zero and counts n down at a negative speed", () => {
    const forward = playingAtSpeed(1);
    expect([
      forward.update(0.4),
      forward.update(0.4),
      forward.update(0.4),
    ]).toEqual([0, 0, 1]);
    expectWithin(forward.remainder, 0.2, 1e-9);

    const reverse = playingAtSpeed(-1);
    expect([
      reverse.update(0.4),
      reverse.update(0.4),
      reverse.update(0.4),
    ]).toEqual([0, 0, -1]);
    expect(reverse.n).toBe(-1);
  });

  it("update never returns -0", () => {
    const clock = playingAtSpeed(-1);
    const steps = clock.update(0.4);
    expect(Object.is(steps, 0)).toBe(true);
  });
});

describe("bounds", () => {
  it("whole steps that pass n_max stop the clock at n_max, Paused, with remainder 0", () => {
    const clock = createClock(2470172.375, 24);
    clock.play();
    expect(clock.update(1)).toBe(2);
    expect(clock.n).toBe(2);
    expect(clock.state).toBe("Paused");
    expect(clock.remainder).toBe(0);
  });

  it("whole steps that pass n_min stop the clock at n_min, Paused, with remainder 0", () => {
    const clock = createClock(2378496.5833333333, -24);
    clock.play();
    expect(clock.update(1)).toBe(-2);
    expect(clock.n).toBe(-2);
    expect(clock.state).toBe("Paused");
    expect(clock.remainder).toBe(0);
  });

  it("the bound is the step index n_max, not JD_MAX: a last step one ulp below JD_MAX still stops the clock", () => {
    const clock = createClock(2470172.4166666665, 24);
    clock.play();
    expect(clock.update(1)).toBe(1);
    expect(clock.n).toBe(1);
    expect(clock.state).toBe("Paused");
    expect(clock.jd).toBe(2470172.458333333);
    clock.play();
    expect(clock.state).toBe("Paused");
  });

  it("drops the fraction when the whole steps reach or pass n_max", () => {
    const reaching = createClock(2470172.375, 20);
    reaching.play();
    expect(reaching.update(0.125)).toBe(2);
    expect(reaching.n).toBe(2);
    expect(reaching.state).toBe("Paused");
    expect(reaching.remainder).toBe(0);

    const passing = createClock(2470172.375, 24);
    passing.play();
    expect(passing.update(0.1875)).toBe(2);
    expect(passing.n).toBe(2);
    expect(passing.state).toBe("Paused");
    expect(passing.remainder).toBe(0);
  });

  it("whole steps that reach n_max exactly pause the clock", () => {
    const clock = createClock(2470172.4166666665, 1);
    clock.play();
    expect(clock.update(1)).toBe(1);
    expect(clock.n).toBe(1);
    expect(clock.state).toBe("Paused");
    expect(clock.remainder).toBe(0);
  });

  it("whole steps that reach n_min exactly pause the clock", () => {
    const clock = createClock(2378496.5416666667, -1);
    clock.play();
    expect(clock.update(1)).toBe(-1);
    expect(clock.n).toBe(-1);
    expect(clock.state).toBe("Paused");
    expect(clock.remainder).toBe(0);
  });

  it("play at a bound with the speed pointing back into the range runs the clock", () => {
    const atMax = createClock(2470172.4583333333, -1);
    atMax.play();
    expect(atMax.update(0.5)).toBe(0);
    expect(atMax.state).toBe("Playing");
    expect(atMax.update(0.5)).toBe(-1);
    expect(atMax.n).toBe(-1);

    const atMin = createClock(2378496.5, 1);
    atMin.play();
    expect(atMin.update(0.5)).toBe(0);
    expect(atMin.state).toBe("Playing");
    expect(atMin.update(0.5)).toBe(1);
    expect(atMin.n).toBe(1);
  });

  it("play at a bound with the speed pointing out leaves the clock Paused", () => {
    for (const [startJd, speed] of [
      [2470172.4583333333, 1],
      [2378496.5, -1],
    ]) {
      const clock = createClock(startJd, speed);
      clock.play();
      expect(clock.state).toBe("Paused");
      expect(clock.update(1)).toBe(0);
      expect(clock.n).toBe(0);
      expect(clock.state).toBe("Paused");
      expect(clock.remainder).toBe(0);
    }
  });

  it("a Playing clock jumped onto a bound pauses at its next whole step outward", () => {
    const atMax = playingAtSpeed(1);
    atMax.jump(JD_MAX);
    expect(atMax.state).toBe("Playing");
    expect(atMax.update(1)).toBe(0);
    expect(atMax.n).toBe(0);
    expect(atMax.state).toBe("Paused");
    expect(atMax.remainder).toBe(0);

    const atMin = playingAtSpeed(-1);
    atMin.jump(JD_MIN);
    expect(atMin.state).toBe("Playing");
    expect(atMin.update(1)).toBe(0);
    expect(atMin.n).toBe(0);
    expect(atMin.state).toBe("Paused");
    expect(atMin.remainder).toBe(0);
  });
});

describe("start, jump and rounding", () => {
  it("jump rounds to the nearest whole hour, a half hour rounding up", () => {
    const at1429 = playingAtSpeed(1);
    at1429.jump(jdFromDate(new Date(Date.UTC(2026, 9, 27, 14, 29))));
    expectWithin(at1429.jd, 2461341.0833333333, TOLERANCE_DAYS);

    const at1430 = playingAtSpeed(1);
    at1430.jump(jdFromDate(new Date(Date.UTC(2026, 9, 27, 14, 30))));
    expectWithin(at1430.jd, 2461341.125, TOLERANCE_DAYS);
  });

  it("jump sets the start, resets n to 0 and keeps Playing or Paused", () => {
    const playing = playingAtSpeed(1);
    expect(playing.update(2)).toBe(2);
    playing.jump(2461341.0833333333);
    expectWithin(playing.jd, 2461341.0833333333, TOLERANCE_DAYS);
    expect(playing.n).toBe(0);
    expect(playing.state).toBe("Playing");

    const paused = createClock(J2000, 1);
    paused.jump(2461341.0833333333);
    expect(paused.state).toBe("Paused");
  });

  it("createClock rounds and clamps its start as jump does", () => {
    const belowRange = createClock(JD_MIN - 1, 24);
    expectWithin(belowRange.jd, 2378496.5, TOLERANCE_DAYS);
    expect(belowRange.n).toBe(0);
    expectWithin(
      createClock(2461341.0833333333 + 0.01, 24).jd,
      2461341.0833333333,
      TOLERANCE_DAYS,
    );
    expectWithin(
      createClock(2461341.0833333333 + 0.03, 24).jd,
      2461341.125,
      TOLERANCE_DAYS,
    );
  });

  it("jump clamps to JD_MIN..JD_MAX and keeps the state", () => {
    const clock = playingAtSpeed(1);
    clock.jump(JD_MAX + 5);
    expectWithin(clock.jd, 2470172.4583333333, TOLERANCE_DAYS);
    expect(clock.n).toBe(0);
    expect(clock.state).toBe("Playing");

    clock.jump(JD_MIN - 5);
    expectWithin(clock.jd, 2378496.5, TOLERANCE_DAYS);
    expect(clock.n).toBe(0);
    expect(clock.state).toBe("Playing");
  });
});

describe("remainder reset", () => {
  it("pause resets the remainder", () => {
    const clock = playingAtSpeed(1);
    expect(clock.update(0.6)).toBe(0);
    clock.pause();
    clock.play();
    expect(clock.update(0.6)).toBe(0);
  });

  it("jump resets the remainder", () => {
    const clock = playingAtSpeed(1);
    expect(clock.update(0.6)).toBe(0);
    clock.jump(2451545.0);
    expect(clock.update(0.6)).toBe(0);
  });

  it("setSpeed resets the remainder", () => {
    const reversed = playingAtSpeed(1);
    expect(reversed.update(0.6)).toBe(0);
    reversed.setSpeed(-1);
    expect(reversed.update(1.2)).toBe(-1);

    const doubled = playingAtSpeed(1);
    expect(doubled.update(0.6)).toBe(0);
    doubled.setSpeed(2);
    expect(doubled.update(0.4)).toBe(0);
    expectWithin(doubled.remainder, 0.8, 1e-9);
  });
});

describe("speed 0 and invalid input", () => {
  it("play at speed 0 leaves the clock Paused and speed 0 takes no steps", () => {
    const stopped = createClock(J2000, 0);
    stopped.play();
    expect(stopped.state).toBe("Paused");

    const slowed = playingAtSpeed(1);
    slowed.setSpeed(0);
    expect(slowed.update(2.5)).toBe(0);
  });

  it("update given NaN, an infinite or a negative elapsed time returns 0 and changes nothing", () => {
    const clock = playingAtSpeed(1);
    clock.update(0.5);
    const { n, jd, state } = clock;
    for (const elapsed of [NaN, Infinity, -Infinity, -1]) {
      expect(clock.update(elapsed)).toBe(0);
      expect(clock.n).toBe(n);
      expect(clock.jd).toBe(jd);
      expect(clock.state).toBe(state);
      expect(clock.remainder).toBe(0.5);
    }
  });

  it("setSpeed and jump given NaN or an infinite number change nothing", () => {
    const clock = playingAtSpeed(1);
    clock.update(0.5);
    const { speedStepsPerSecond, jd, n } = clock;
    for (const value of [NaN, Infinity, -Infinity]) {
      clock.setSpeed(value);
      clock.jump(value);
      expect(clock.speedStepsPerSecond).toBe(speedStepsPerSecond);
      expect(clock.jd).toBe(jd);
      expect(clock.n).toBe(n);
      expect(clock.remainder).toBe(0.5);
    }
  });

  it("createClock throws a RangeError for a non-finite start or speed", () => {
    expect(() => createClock(NaN, 1)).toThrow(RangeError);
    expect(() => createClock(Infinity, 1)).toThrow(RangeError);
    expect(() => createClock(J2000, NaN)).toThrow(RangeError);
    expect(() => createClock(J2000, -Infinity)).toThrow(RangeError);
  });
});
