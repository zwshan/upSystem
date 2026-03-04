const DAY_MS = 24 * 60 * 60 * 1000;
const BASE_INTERVAL_BY_SCORE = [1, 1, 3, 6, 12, 25];

export function computeNextIntervalDays(score: number, reviewCount: number): number {
  const boundedScore = Math.min(5, Math.max(0, Math.trunc(score)));
  const safeReviewCount = Math.max(1, Math.trunc(reviewCount));
  const baseInterval = BASE_INTERVAL_BY_SCORE[boundedScore] ?? 1;

  if (safeReviewCount <= 1) {
    return baseInterval;
  }

  const growthFactor = 1 + (safeReviewCount - 1) * 0.12;
  return Math.max(1, Math.round(baseInterval * growthFactor));
}

export function computeNextDueAt(score: number, reviewCount: number, from = new Date()): Date {
  const intervalDays = computeNextIntervalDays(score, reviewCount);
  return new Date(from.getTime() + intervalDays * DAY_MS);
}
