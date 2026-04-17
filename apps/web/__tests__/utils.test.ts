import { describe, it, expect } from 'vitest';
import {
  cn,
  formatDate,
  formatRelativeDate,
  formatDuration,
  getInitials,
  shuffleArray,
  truncate,
  capitalize,
  getWeekStart,
  calculateStreak,
} from '../lib/utils';

describe('cn (class merging)', () => {
  it('merges class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  it('handles conditional classes', () => {
    expect(cn('foo', false && 'bar', 'baz')).toBe('foo baz');
  });

  it('deduplicates tailwind classes', () => {
    // tailwind-merge deduplicates conflicting utility classes
    expect(cn('p-2', 'p-4')).toBe('p-4');
  });
});

describe('formatDate', () => {
  it('returns "Today" for today', () => {
    expect(formatDate(new Date())).toBe('Today');
  });

  it('returns "Yesterday" for yesterday', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    expect(formatDate(yesterday)).toBe('Yesterday');
  });

  it('formats older dates as "MMM d, yyyy"', () => {
    const date = new Date('2024-01-15');
    const result = formatDate(date);
    expect(result).toMatch(/Jan 15, 2024/);
  });
});

describe('formatRelativeDate', () => {
  it('returns a relative time string', () => {
    const recent = new Date(Date.now() - 60000); // 1 minute ago
    const result = formatRelativeDate(recent);
    expect(result).toContain('ago');
  });
});

describe('formatDuration', () => {
  it('formats minutes under an hour', () => {
    expect(formatDuration(45)).toBe('45m');
  });

  it('formats exact hours', () => {
    expect(formatDuration(60)).toBe('1h');
    expect(formatDuration(120)).toBe('2h');
  });

  it('formats hours and minutes', () => {
    expect(formatDuration(90)).toBe('1h 30m');
  });
});

describe('getInitials', () => {
  it('returns initials from a name', () => {
    expect(getInitials('John Doe')).toBe('JD');
  });

  it('returns single initial for single name', () => {
    // Single word name: only one letter available
    expect(getInitials('Alice')).toBe('A');
  });

  it('limits to 2 characters', () => {
    expect(getInitials('Alice Bob Charlie')).toBe('AB');
  });

  it('returns uppercase initials', () => {
    expect(getInitials('john doe')).toBe('JD');
  });
});

describe('shuffleArray', () => {
  it('returns an array of the same length', () => {
    const arr = [1, 2, 3, 4, 5];
    const result = shuffleArray(arr);
    expect(result).toHaveLength(arr.length);
  });

  it('does not mutate the original array', () => {
    const arr = [1, 2, 3];
    const copy = [...arr];
    shuffleArray(arr);
    expect(arr).toEqual(copy);
  });

  it('contains the same elements', () => {
    const arr = [1, 2, 3, 4, 5];
    const result = shuffleArray(arr);
    expect(result.sort()).toEqual(arr.sort());
  });
});

describe('truncate', () => {
  it('returns the string unchanged if within length', () => {
    expect(truncate('hello', 10)).toBe('hello');
  });

  it('truncates and adds ellipsis', () => {
    expect(truncate('hello world', 8)).toBe('hello...');
  });

  it('returns exact length string unchanged', () => {
    expect(truncate('hello', 5)).toBe('hello');
  });
});

describe('capitalize', () => {
  it('capitalizes the first letter and lowercases the rest', () => {
    expect(capitalize('hello')).toBe('Hello');
    expect(capitalize('WORLD')).toBe('World');
    expect(capitalize('hELLO')).toBe('Hello');
  });
});

describe('getWeekStart', () => {
  it('returns a Monday', () => {
    const result = getWeekStart(new Date('2024-07-17')); // Wednesday
    expect(result.getDay()).toBe(1); // Monday
  });

  it('returns midnight', () => {
    const result = getWeekStart();
    expect(result.getHours()).toBe(0);
    expect(result.getMinutes()).toBe(0);
    expect(result.getSeconds()).toBe(0);
  });
});

describe('calculateStreak', () => {
  it('returns false for null', () => {
    expect(calculateStreak(null)).toBe(false);
  });

  it('returns true for recent activity (today)', () => {
    expect(calculateStreak(new Date())).toBe(true);
  });

  it('returns false for activity 2+ days ago', () => {
    const old = new Date();
    old.setDate(old.getDate() - 2);
    expect(calculateStreak(old)).toBe(false);
  });
});
