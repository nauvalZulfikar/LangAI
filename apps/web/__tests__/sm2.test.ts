import { describe, it, expect, beforeEach } from 'vitest';
import { sm2 } from '../lib/sm2';
import type { SM2Card } from '../lib/sm2';

function makeCard(overrides: Partial<SM2Card> = {}): SM2Card {
  return {
    interval: 1,
    easeFactor: 2.5,
    repetitions: 0,
    dueDate: new Date(),
    lastReviewed: null,
    correctStreak: 0,
    ...overrides,
  };
}

describe('SM-2 Algorithm', () => {
  it('quality 0 (fail) resets interval to 1 and repetitions to 0', () => {
    const card = makeCard({ interval: 10, repetitions: 3 });
    const result = sm2(card, 0);
    expect(result.interval).toBe(1);
    expect(result.repetitions).toBe(0);
  });

  it('quality 1 (fail) resets interval to 1 and repetitions to 0', () => {
    const card = makeCard({ interval: 6, repetitions: 2 });
    const result = sm2(card, 1);
    expect(result.interval).toBe(1);
    expect(result.repetitions).toBe(0);
  });

  it('quality 3 (good) after 0 reps sets interval to 1', () => {
    const card = makeCard({ repetitions: 0 });
    const result = sm2(card, 3);
    expect(result.interval).toBe(1);
    expect(result.repetitions).toBe(1);
  });

  it('quality 3 after 1 rep sets interval to 6', () => {
    const card = makeCard({ repetitions: 1, interval: 1 });
    const result = sm2(card, 3);
    expect(result.interval).toBe(6);
    expect(result.repetitions).toBe(2);
  });

  it('quality 5 (perfect) increases easeFactor', () => {
    const card = makeCard({ easeFactor: 2.5 });
    const result = sm2(card, 5);
    expect(result.easeFactor).toBeGreaterThan(2.5);
  });

  it('easeFactor never goes below 1.3', () => {
    let card = makeCard({ easeFactor: 1.3 });
    // Apply several bad ratings
    for (let i = 0; i < 5; i++) {
      card = sm2(card, 0);
    }
    expect(card.easeFactor).toBeGreaterThanOrEqual(1.3);
  });

  it('dueDate is in the future after a good quality review', () => {
    const card = makeCard({ repetitions: 0 });
    const before = new Date();
    const result = sm2(card, 4);
    expect(result.dueDate.getTime()).toBeGreaterThanOrEqual(before.getTime());
  });

  it('correctStreak increments on quality >= 3', () => {
    const card = makeCard({ correctStreak: 2 });
    const result = sm2(card, 4);
    expect(result.correctStreak).toBe(3);
  });

  it('correctStreak resets to 0 on quality < 3', () => {
    const card = makeCard({ correctStreak: 5 });
    const result = sm2(card, 2);
    expect(result.correctStreak).toBe(0);
  });

  it('quality 3 after 2+ reps uses interval * easeFactor', () => {
    const card = makeCard({ repetitions: 2, interval: 6, easeFactor: 2.5 });
    const result = sm2(card, 3);
    expect(result.interval).toBe(Math.round(6 * 2.5));
  });
});
