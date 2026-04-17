import { describe, it, expect } from 'vitest';
import {
  getLevelFromXP,
  getStarRating,
  getNextLevel,
  getXPProgress,
  calculateStreakBonus,
  XP_REWARDS,
} from '../lib/xp';

describe('getLevelFromXP', () => {
  it('returns level 1 "Seedling" for 0 XP', () => {
    const result = getLevelFromXP(0);
    expect(result.level).toBe(1);
    expect(result.title).toBe('Seedling');
  });

  it('returns level 2 "Explorer" for 500 XP', () => {
    const result = getLevelFromXP(500);
    expect(result.level).toBe(2);
    expect(result.title).toBe('Explorer');
  });

  it('returns level 2 "Explorer" for 499 XP (just below threshold)', () => {
    const result = getLevelFromXP(499);
    expect(result.level).toBe(1);
  });

  it('returns level 8 "Legend" for 35000 XP', () => {
    const result = getLevelFromXP(35000);
    expect(result.level).toBe(8);
    expect(result.title).toBe('Legend');
  });

  it('returns level 8 "Legend" for very high XP', () => {
    const result = getLevelFromXP(100000);
    expect(result.level).toBe(8);
    expect(result.title).toBe('Legend');
  });

  it('returns correct level for mid-range XP', () => {
    // Level 5 starts at 7000
    const result = getLevelFromXP(7000);
    expect(result.level).toBe(5);
    expect(result.title).toBe('Linguist');
  });
});

describe('getStarRating', () => {
  it('returns 3 stars for score >= 90', () => {
    expect(getStarRating(100)).toBe(3);
    expect(getStarRating(90)).toBe(3);
  });

  it('returns 2 stars for score >= 70 and < 90', () => {
    expect(getStarRating(70)).toBe(2);
    expect(getStarRating(89)).toBe(2);
  });

  it('returns 1 star for score < 70', () => {
    expect(getStarRating(40)).toBe(1);
    expect(getStarRating(69)).toBe(1);
    expect(getStarRating(0)).toBe(1);
  });
});

describe('getNextLevel', () => {
  it('returns null at max level', () => {
    expect(getNextLevel(100000)).toBeNull();
  });

  it('returns level 2 for XP at level 1', () => {
    const next = getNextLevel(0);
    expect(next?.level).toBe(2);
  });
});

describe('getXPProgress', () => {
  it('returns 100% at max level', () => {
    const result = getXPProgress(100000);
    expect(result.percentage).toBe(100);
    expect(result.needed).toBe(0);
  });

  it('returns correct percentage at level 1 with 250 XP', () => {
    // Level 1: 0-500 XP, 250 is halfway
    const result = getXPProgress(250);
    expect(result.percentage).toBe(50);
    expect(result.current).toBe(250);
    expect(result.needed).toBe(500);
  });
});

describe('calculateStreakBonus', () => {
  it('returns bonus for multiples of 7', () => {
    expect(calculateStreakBonus(7)).toBe(XP_REWARDS.STREAK_BONUS_7_DAYS);
    expect(calculateStreakBonus(14)).toBe(XP_REWARDS.STREAK_BONUS_7_DAYS);
  });

  it('returns 0 for non-multiples of 7', () => {
    expect(calculateStreakBonus(6)).toBe(0);
    expect(calculateStreakBonus(8)).toBe(0);
    expect(calculateStreakBonus(0)).toBe(0);
  });
});
