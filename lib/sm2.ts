/**
 * SM-2 Spaced Repetition Algorithm
 * Based on the SuperMemo 2 algorithm by Piotr Wozniak
 */

export interface SM2Result {
  easeFactor: number;
  interval: number;
  repetitions: number;
  nextReviewDate: Date;
}

export type Rating = "forgot" | "hard" | "easy";

const RATING_TO_QUALITY: Record<Rating, number> = {
  forgot: 0,
  hard: 3,
  easy: 5,
};

/**
 * Calculate the next review parameters based on SM-2 algorithm.
 * @param quality - Quality of response (0-5): 0=complete blackout, 5=perfect
 * @param repetitions - Number of consecutive correct responses
 * @param easeFactor - Current ease factor (>= 1.3)
 * @param interval - Current interval in days
 */
export function sm2(
  quality: number,
  repetitions: number,
  easeFactor: number,
  interval: number
): SM2Result {
  let newEaseFactor = easeFactor;
  let newInterval: number;
  let newRepetitions: number;

  if (quality >= 3) {
    // Correct response
    if (repetitions === 0) {
      newInterval = 1;
    } else if (repetitions === 1) {
      newInterval = 6;
    } else {
      newInterval = Math.round(interval * easeFactor);
    }
    newRepetitions = repetitions + 1;
  } else {
    // Incorrect response — reset
    newRepetitions = 0;
    newInterval = 1;
  }

  // Update ease factor
  newEaseFactor =
    easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));

  if (newEaseFactor < 1.3) {
    newEaseFactor = 1.3;
  }

  const nextReviewDate = new Date();
  nextReviewDate.setDate(nextReviewDate.getDate() + newInterval);

  return {
    easeFactor: newEaseFactor,
    interval: newInterval,
    repetitions: newRepetitions,
    nextReviewDate,
  };
}

/**
 * Higher-level wrapper that accepts string ratings.
 * Calculates SM-2 result and also returns a preview interval for UI display.
 */
export function calculateSM2(
  currentEaseFactor: number,
  currentInterval: number,
  currentRepetitions: number,
  rating: Rating
): SM2Result {
  const quality = RATING_TO_QUALITY[rating];
  return sm2(quality, currentRepetitions, currentEaseFactor, currentInterval);
}

/**
 * Preview what the interval would be for each rating, without mutating state.
 * Used to show "Review in X days" on rating buttons.
 */
export function previewIntervals(
  easeFactor: number,
  interval: number,
  repetitions: number
): Record<Rating, number> {
  return {
    forgot: calculateSM2(easeFactor, interval, repetitions, "forgot").interval,
    hard: calculateSM2(easeFactor, interval, repetitions, "hard").interval,
    easy: calculateSM2(easeFactor, interval, repetitions, "easy").interval,
  };
}
