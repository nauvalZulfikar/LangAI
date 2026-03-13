export const XP_REWARDS = {
  LESSON_3_STARS: 50,
  LESSON_2_STARS: 30,
  LESSON_1_STAR: 10,
  SRS_SESSION_20_PLUS: 25,
  SPEAKING_SESSION_5_MIN: 40,
  WRITING_ENTRY: 30,
  DAILY_CHALLENGE: 60,
  STREAK_BONUS_7_DAYS: 100,
  INVITE_FRIEND: 200,
} as const;

export const LEVELS = [
  { level: 1, minXP: 0, title: 'Seedling' },
  { level: 2, minXP: 500, title: 'Explorer' },
  { level: 3, minXP: 1500, title: 'Adventurer' },
  { level: 4, minXP: 3500, title: 'Scholar' },
  { level: 5, minXP: 7000, title: 'Linguist' },
  { level: 6, minXP: 12000, title: 'Polyglot' },
  { level: 7, minXP: 20000, title: 'Master' },
  { level: 8, minXP: 35000, title: 'Legend' },
] as const;

export type LevelInfo = (typeof LEVELS)[number];

export function getLevelFromXP(xp: number): LevelInfo {
  let currentLevel: LevelInfo = LEVELS[0] as LevelInfo;
  for (const level of LEVELS) {
    if (xp >= level.minXP) {
      currentLevel = level;
    } else {
      break;
    }
  }
  return currentLevel;
}

export function getNextLevel(xp: number): LevelInfo | null {
  const currentLevel = getLevelFromXP(xp);
  const nextLevel = LEVELS.find((l) => l.level === currentLevel.level + 1);
  return nextLevel ?? null;
}

export function getXPProgress(xp: number): { current: number; needed: number; percentage: number } {
  const currentLevel = getLevelFromXP(xp);
  const nextLevel = getNextLevel(xp);

  if (!nextLevel) {
    return { current: xp - currentLevel.minXP, needed: 0, percentage: 100 };
  }

  const current = xp - currentLevel.minXP;
  const needed = nextLevel.minXP - currentLevel.minXP;
  const percentage = Math.min(100, Math.round((current / needed) * 100));

  return { current, needed, percentage };
}

export function calculateLessonXP(score: number, baseXP: number): number {
  if (score >= 90) return baseXP + XP_REWARDS.LESSON_3_STARS;
  if (score >= 70) return baseXP + XP_REWARDS.LESSON_2_STARS;
  return baseXP + XP_REWARDS.LESSON_1_STAR;
}

export function getStarRating(score: number): 1 | 2 | 3 {
  if (score >= 90) return 3;
  if (score >= 70) return 2;
  return 1;
}

export function calculateStreakBonus(streakDays: number): number {
  if (streakDays > 0 && streakDays % 7 === 0) {
    return XP_REWARDS.STREAK_BONUS_7_DAYS;
  }
  return 0;
}
