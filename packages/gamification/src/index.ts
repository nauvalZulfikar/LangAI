// XP System
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

// Level System
export const LEVELS = [
  { level: 1, minXP: 0, title: 'Seedling', description: 'Just starting your journey' },
  { level: 2, minXP: 500, title: 'Explorer', description: 'Beginning to explore the language' },
  { level: 3, minXP: 1500, title: 'Adventurer', description: 'Taking on new challenges' },
  { level: 4, minXP: 3500, title: 'Scholar', description: 'Deepening your knowledge' },
  { level: 5, minXP: 7000, title: 'Linguist', description: 'Mastering the language' },
  { level: 6, minXP: 12000, title: 'Polyglot', description: 'Speaking with confidence' },
  { level: 7, minXP: 20000, title: 'Master', description: 'Nearly fluent' },
  { level: 8, minXP: 35000, title: 'Legend', description: 'Fully fluent and beyond' },
] as const;

export type LevelInfo = (typeof LEVELS)[number];

export function getLevelFromXP(xp: number): LevelInfo {
  let current = LEVELS[0];
  for (const level of LEVELS) {
    if (xp >= level.minXP) current = level;
    else break;
  }
  return current;
}

export function getNextLevel(xp: number): LevelInfo | null {
  const current = getLevelFromXP(xp);
  return LEVELS.find((l) => l.level === current.level + 1) ?? null;
}

export function getXPProgress(xp: number) {
  const current = getLevelFromXP(xp);
  const next = getNextLevel(xp);
  if (!next) return { current: xp - current.minXP, needed: 0, percentage: 100 };
  const earned = xp - current.minXP;
  const needed = next.minXP - current.minXP;
  return { current: earned, needed, percentage: Math.min(100, Math.round((earned / needed) * 100)) };
}

// Streak System
export function calculateStreakBonus(streakDays: number): number {
  if (streakDays > 0 && streakDays % 7 === 0) return XP_REWARDS.STREAK_BONUS_7_DAYS;
  return 0;
}

export function isStreakActive(lastActivityAt: Date | null): boolean {
  if (!lastActivityAt) return false;
  const diffMs = Date.now() - new Date(lastActivityAt).getTime();
  return diffMs < 48 * 60 * 60 * 1000;
}

// All 30 Achievements
export const ACHIEVEMENTS = [
  // Lesson Achievements
  { id: 'first-lesson', title: 'First Step', description: 'Complete your first lesson', icon: '🎯', xpReward: 50, condition: { type: 'lessons_completed', count: 1 } },
  { id: 'five-lessons', title: 'Getting Started', description: 'Complete 5 lessons', icon: '📚', xpReward: 100, condition: { type: 'lessons_completed', count: 5 } },
  { id: 'ten-lessons', title: 'Dedicated Learner', description: 'Complete 10 lessons', icon: '🏆', xpReward: 200, condition: { type: 'lessons_completed', count: 10 } },
  { id: 'twenty-five-lessons', title: 'Committed Scholar', description: 'Complete 25 lessons', icon: '📖', xpReward: 350, condition: { type: 'lessons_completed', count: 25 } },
  { id: 'fifty-lessons', title: 'Language Champion', description: 'Complete 50 lessons', icon: '👑', xpReward: 500, condition: { type: 'lessons_completed', count: 50 } },
  // Streak Achievements
  { id: 'streak-3', title: 'On a Roll', description: 'Maintain a 3-day streak', icon: '🔥', xpReward: 75, condition: { type: 'streak', days: 3 } },
  { id: 'streak-7', title: 'Week Warrior', description: 'Maintain a 7-day streak', icon: '⚡', xpReward: 150, condition: { type: 'streak', days: 7 } },
  { id: 'streak-14', title: 'Two-Week Champion', description: 'Maintain a 14-day streak', icon: '💪', xpReward: 300, condition: { type: 'streak', days: 14 } },
  { id: 'streak-30', title: 'Monthly Master', description: 'Maintain a 30-day streak', icon: '💎', xpReward: 500, condition: { type: 'streak', days: 30 } },
  { id: 'streak-100', title: 'Century Streak', description: 'Maintain a 100-day streak', icon: '🌟', xpReward: 2000, condition: { type: 'streak', days: 100 } },
  // XP Achievements
  { id: 'xp-500', title: 'Explorer', description: 'Earn 500 XP total', icon: '🗺️', xpReward: 50, condition: { type: 'xp', amount: 500 } },
  { id: 'xp-1500', title: 'Adventurer', description: 'Earn 1500 XP total', icon: '⚔️', xpReward: 100, condition: { type: 'xp', amount: 1500 } },
  { id: 'xp-5000', title: 'Scholar', description: 'Earn 5000 XP total', icon: '🎓', xpReward: 200, condition: { type: 'xp', amount: 5000 } },
  { id: 'xp-10000', title: 'Linguist', description: 'Earn 10000 XP total', icon: '🧠', xpReward: 500, condition: { type: 'xp', amount: 10000 } },
  // Flashcard Achievements
  { id: 'first-flashcard', title: 'Memory Maker', description: 'Review your first flashcard', icon: '🃏', xpReward: 25, condition: { type: 'flashcards_reviewed', count: 1 } },
  { id: 'flashcards-50', title: 'Card Collector', description: 'Review 50 flashcards', icon: '🎴', xpReward: 75, condition: { type: 'flashcards_reviewed', count: 50 } },
  { id: 'flashcards-100', title: 'Card Shark', description: 'Review 100 flashcards', icon: '🃏', xpReward: 150, condition: { type: 'flashcards_reviewed', count: 100 } },
  { id: 'flashcards-500', title: 'Memory Palace', description: 'Review 500 flashcards', icon: '🏛️', xpReward: 300, condition: { type: 'flashcards_reviewed', count: 500 } },
  // Speaking Achievements
  { id: 'first-speaking', title: 'First Words', description: 'Complete your first speaking session', icon: '🗣️', xpReward: 75, condition: { type: 'speaking_sessions', count: 1 } },
  { id: 'speaking-5', title: 'Conversationalist', description: 'Complete 5 speaking sessions', icon: '💬', xpReward: 150, condition: { type: 'speaking_sessions', count: 5 } },
  { id: 'speaking-10', title: 'Fluent Speaker', description: 'Complete 10 speaking sessions', icon: '🎙️', xpReward: 200, condition: { type: 'speaking_sessions', count: 10 } },
  // Writing Achievements
  { id: 'first-writing', title: 'Pensmith', description: 'Write your first journal entry', icon: '✍️', xpReward: 50, condition: { type: 'writing_entries', count: 1 } },
  { id: 'writing-5', title: 'Wordsmith', description: 'Write 5 journal entries', icon: '📝', xpReward: 100, condition: { type: 'writing_entries', count: 5 } },
  { id: 'writing-10', title: 'Storyteller', description: 'Write 10 journal entries', icon: '📖', xpReward: 150, condition: { type: 'writing_entries', count: 10 } },
  // Perfect Score Achievements
  { id: 'perfect-lesson', title: 'Perfectionist', description: 'Get a perfect score on a lesson', icon: '💯', xpReward: 100, condition: { type: 'perfect_lesson', count: 1 } },
  { id: 'perfect-5', title: 'Flawless', description: 'Get perfect scores on 5 lessons', icon: '✨', xpReward: 250, condition: { type: 'perfect_lesson', count: 5 } },
  // Daily Challenge Achievements
  { id: 'daily-challenge', title: 'Daily Grind', description: 'Complete your first daily challenge', icon: '📅', xpReward: 60, condition: { type: 'daily_challenges', count: 1 } },
  { id: 'daily-challenge-7', title: 'Challenge Accepted', description: 'Complete 7 daily challenges', icon: '🎯', xpReward: 200, condition: { type: 'daily_challenges', count: 7 } },
  // Leaderboard Achievements
  { id: 'leaderboard-top10', title: 'Rising Star', description: 'Reach top 10 on the leaderboard', icon: '⭐', xpReward: 300, condition: { type: 'leaderboard_rank', rank: 10 } },
  { id: 'leaderboard-1', title: 'Champion', description: 'Reach #1 on the leaderboard', icon: '🥇', xpReward: 1000, condition: { type: 'leaderboard_rank', rank: 1 } },
  // Goal Achievements
  { id: 'first-goal', title: 'Goal Setter', description: 'Complete your first learning goal', icon: '🎯', xpReward: 150, condition: { type: 'goals_completed', count: 1 } },
  { id: 'goals-3', title: 'Goal Crusher', description: 'Complete 3 learning goals', icon: '🏅', xpReward: 300, condition: { type: 'goals_completed', count: 3 } },
  { id: 'goals-10', title: 'Goal Master', description: 'Complete 10 learning goals', icon: '🏆', xpReward: 750, condition: { type: 'goals_completed', count: 10 } },
  { id: 'goal-streak-3', title: 'Hat Trick', description: 'Complete 3 goals in a row', icon: '🔥', xpReward: 500, condition: { type: 'goal_streak', count: 3 } },
  { id: 'mastery-perfect', title: 'Perfect Mastery', description: 'Score 100% on a mastery test', icon: '💯', xpReward: 400, condition: { type: 'mastery_perfect', count: 1 } },
] as const;

export type AchievementId = (typeof ACHIEVEMENTS)[number]['id'];

export function checkAchievementUnlock(
  achievementId: AchievementId,
  stats: {
    lessonsCompleted: number;
    streakDays: number;
    xpTotal: number;
    flashcardsReviewed: number;
    speakingSessions: number;
    writingEntries: number;
    perfectLessons: number;
    dailyChallenges: number;
    leaderboardRank: number | null;
    goalsCompleted?: number;
    goalStreak?: number;
    masteryPerfect?: number;
  }
): boolean {
  const achievement = ACHIEVEMENTS.find((a) => a.id === achievementId);
  if (!achievement) return false;

  const c = achievement.condition as Record<string, number>;
  switch (c.type) {
    case 'lessons_completed': return stats.lessonsCompleted >= c.count;
    case 'streak': return stats.streakDays >= c.days;
    case 'xp': return stats.xpTotal >= c.amount;
    case 'flashcards_reviewed': return stats.flashcardsReviewed >= c.count;
    case 'speaking_sessions': return stats.speakingSessions >= c.count;
    case 'writing_entries': return stats.writingEntries >= c.count;
    case 'perfect_lesson': return stats.perfectLessons >= c.count;
    case 'daily_challenges': return stats.dailyChallenges >= c.count;
    case 'leaderboard_rank': return stats.leaderboardRank !== null && stats.leaderboardRank <= c.rank;
    case 'goals_completed': return (stats.goalsCompleted ?? 0) >= c.count;
    case 'goal_streak': return (stats.goalStreak ?? 0) >= c.count;
    case 'mastery_perfect': return (stats.masteryPerfect ?? 0) >= c.count;
    default: return false;
  }
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
