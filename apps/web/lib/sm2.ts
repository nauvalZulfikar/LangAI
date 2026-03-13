import { addDays } from 'date-fns';

export interface SM2Card {
  interval: number;
  easeFactor: number;
  repetitions: number;
  dueDate: Date;
  lastReviewed: Date | null;
  correctStreak?: number;
}

export type Quality = 0 | 1 | 2 | 3 | 4 | 5;

/**
 * SM-2 Spaced Repetition Algorithm
 * Quality scale:
 *   0 - Complete blackout
 *   1 - Incorrect response; the correct one remembered
 *   2 - Incorrect response; but upon seeing correct answer it seemed easy
 *   3 - Correct response recalled with serious difficulty
 *   4 - Correct response after hesitation
 *   5 - Perfect response
 */
export function sm2(card: SM2Card, quality: Quality): SM2Card {
  let { interval, easeFactor, repetitions } = card;

  if (quality < 3) {
    repetitions = 0;
    interval = 1;
  } else {
    if (repetitions === 0) interval = 1;
    else if (repetitions === 1) interval = 6;
    else interval = Math.round(interval * easeFactor);
    repetitions += 1;
  }

  easeFactor = Math.max(
    1.3,
    easeFactor + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)
  );

  return {
    ...card,
    interval,
    easeFactor,
    repetitions,
    dueDate: addDays(new Date(), interval),
    lastReviewed: new Date(),
    correctStreak: quality >= 3 ? (card.correctStreak ?? 0) + 1 : 0,
  };
}

export function getDueCards<T extends SM2Card>(cards: T[]): T[] {
  const now = new Date();
  return cards.filter((card) => new Date(card.dueDate) <= now);
}

export function getNextReviewDate(card: SM2Card): Date {
  return new Date(card.dueDate);
}

export function formatInterval(days: number): string {
  if (days === 1) return '1 day';
  if (days < 7) return `${days} days`;
  if (days < 30) return `${Math.round(days / 7)} week${Math.round(days / 7) > 1 ? 's' : ''}`;
  return `${Math.round(days / 30)} month${Math.round(days / 30) > 1 ? 's' : ''}`;
}
