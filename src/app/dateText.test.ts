import { describe, expect, it } from "vitest";
import { formatDateText, parseDateText } from "./dateText";

const TOLERANCE_DAYS = 1e-9;

function expectWithin(actual: number, expected: number, tolerance: number) {
  expect(
    Math.abs(actual - expected),
    `${actual} vs ${expected}`,
  ).toBeLessThanOrEqual(tolerance);
}

function parsedJd(text: string): number {
  const jd = parseDateText(text);
  expect(jd, text).not.toBeNull();
  return jd as number;
}

describe("date text", () => {
  it("parses YYYY-MM-DD HH:MM as UTC and formats that Julian date back to the same text, without UTC", () => {
    const jd = parsedJd("2026-10-27 14:00");
    expectWithin(jd, 2461341.0833333333, TOLERANCE_DAYS);
    expect(formatDateText(jd)).toBe("2026-10-27 14:00");
  });

  it("formatDateText rounds to the nearest whole hour, so a Julian date just below 01:00 shows 01:00", () => {
    expect(formatDateText(2440587.5416666665)).toBe("1970-01-01 01:00");
  });

  it("parseDateText returns null for text that is not a valid date in the YYYY-MM-DD HH:MM format", () => {
    for (const text of [
      "2026-10-27 14:00 UTC",
      "2026-13-40 99:99",
      "2026-02-30 00:00",
      "2027-02-29 00:00",
      "",
      "2026-10-27T14:00",
      "2026-10-27 14:00:00",
      "12026-10-27 14:00",
    ]) {
      expect(parseDateText(text), text).toBeNull();
    }
    expect(parseDateText("2028-02-29 00:00")).toBeTypeOf("number");
  });

  it("reads a year below 100 as written", () => {
    expect(formatDateText(parsedJd("0050-01-01 00:00"))).toBe(
      "0050-01-01 00:00",
    );
  });
});
