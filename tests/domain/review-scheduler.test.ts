import { expect, test } from "vitest";

import { computeNextIntervalDays } from "@/server/domain/review/scheduler";

test("score 5 should schedule longer interval than score 2", () => {
  expect(computeNextIntervalDays(5, 1)).toBeGreaterThan(computeNextIntervalDays(2, 1));
});
