import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userId = session.user.id;

  const [user, completedLessons, flashcardsReviewed, speakingSessions, writingEntries, userAchievements, achievements] =
    await Promise.all([
      db.user.findUnique({ where: { id: userId }, select: { xpTotal: true, streakCurrent: true } }),
      db.userLessonProgress.count({ where: { userId, status: 'COMPLETED' } }),
      db.userFlashcard.count({ where: { userId, repetitions: { gt: 0 } } }),
      db.aIConversation.count({ where: { userId } }),
      db.writingEntry.count({ where: { userId } }),
      db.userAchievement.findMany({ where: { userId }, select: { achievementId: true } }),
      db.achievement.findMany(),
    ]);

  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const unlockedIds = new Set(userAchievements.map((ua) => ua.achievementId));
  const newlyUnlocked: typeof achievements = [];

  for (const achievement of achievements) {
    if (unlockedIds.has(achievement.id)) continue;

    const condition = JSON.parse(achievement.condition as string) as Record<string, string | number>;
    let shouldUnlock = false;

    const n = (key: string) => Number(condition[key] ?? 0);
    switch (condition.type) {
      case 'lessons_completed':
        shouldUnlock = completedLessons >= n('count');
        break;
      case 'streak':
        shouldUnlock = (user.streakCurrent ?? 0) >= n('days');
        break;
      case 'xp':
        shouldUnlock = (user.xpTotal ?? 0) >= n('amount');
        break;
      case 'flashcards_reviewed':
        shouldUnlock = flashcardsReviewed >= n('count');
        break;
      case 'speaking_sessions':
        shouldUnlock = speakingSessions >= n('count');
        break;
      case 'writing_entries':
        shouldUnlock = writingEntries >= n('count');
        break;
    }

    if (shouldUnlock) {
      newlyUnlocked.push(achievement);
    }
  }

  if (newlyUnlocked.length > 0) {
    await db.$transaction(async (tx) => {
      for (const achievement of newlyUnlocked) {
        await tx.userAchievement.create({
          data: { userId, achievementId: achievement.id },
        });
        await tx.user.update({
          where: { id: userId },
          data: { xpTotal: { increment: achievement.xpReward } },
        });
      }
    });
  }

  return NextResponse.json({ newlyUnlocked });
}
