import { describe, expect, it } from "vitest";
import { JD_MAX, JD_MIN, jdAtStep, jdFromDate } from "./time";

const TOLERANCE_DAYS = 1e-9;

function expectWithin(actual: number, expected: number, tolerance: number) {
  expect(
    Math.abs(actual - expected),
    `${actual} vs ${expected}`,
  ).toBeLessThanOrEqual(tolerance);
}

describe("time bounds", () => {
  it("JD_MIN is 1800-01-01 00:00 and JD_MAX is 2050-12-31 23:00 as Julian dates", () => {
    expectWithin(JD_MIN, 2378496.5, TOLERANCE_DAYS);
    expectWithin(JD_MAX, 2470172.4583333333, TOLERANCE_DAYS);
    expectWithin(JD_MAX, 59284139 / 24, TOLERANCE_DAYS);
  });
});

describe("jdAtStep", () => {
  it("one step is one hour, 1/24 d", () => {
    expectWithin(
      jdAtStep(2451545.0, 1) - jdAtStep(2451545.0, 0),
      1 / 24,
      TOLERANCE_DAYS,
    );
  });
});

describe("jdFromDate", () => {
  it("maps the Unix epoch to JD 2440587.5", () => {
    expect(jdFromDate(new Date(0))).toBe(2440587.5);
  });

  it("gives the Julian date of the instant whatever the time zone", () => {
    expectWithin(
      jdFromDate(new Date(Date.UTC(2026, 9, 27, 14))),
      2461341.0833333333,
      TOLERANCE_DAYS,
    );
  });
});
