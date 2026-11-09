import { expect, it } from "vitest";
import { INITIAL_SPEED_STEPS_PER_S } from "./index";

it("INITIAL_SPEED_STEPS_PER_S is 24 steps per second, 1 simulated day per real second", () => {
  expect(INITIAL_SPEED_STEPS_PER_S).toBe(24);
});
