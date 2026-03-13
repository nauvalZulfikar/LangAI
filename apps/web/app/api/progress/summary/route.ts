import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userId = session.user.id;

  const [user, lessonProgress, totalLessons, userAchievements] = await Promise.all([
    db.user.findUnique({
      where: { id: userId },
      select: {
        xpTotal: true,
        streakCurrent: true,
        streakLongest: true,
        currentLevel: true,
      },
    }),
    db.userLessonProgress.findMany({
      where: { userId },
      include: { lesson: { select: { type: true } } },
    }),
    db.lesson.count(),
    db.userAchievement.count({ where: { userId } }),
  ]);

  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const completedLessons = lessonProgress.filter((p) => p.status === 'COMPLETED');

  const skillScores = {
    vocabulary: 0,
    grammar: 0,
    listening: 0,
    speaking: 0,
    reading: 0,
    writing: 0,
  };

  const typeCounts: Record<string, { total: number; scoreSum: number }> = {};
  for (const p of completedLessons) {
    const type = p.lesson.type.toLowerCase() as keyof typeof skillScores;
    if (!typeCounts[type]) typeCounts[type] = { total: 0, scoreSum: 0 };
    typeCounts[type].total += 1;
    typeCounts[type].scoreSum += p.score;
  }
  for (const [type, data] of Object.entries(typeCounts)) {
    if (type in skillScores) {
      skillScores[type as keyof typeof skillScores] = Math.round(data.scoreSum / data.total);
    }
  }

  return NextResponse.json({
    ...user,
    totalLessons,
    completedLessons: completedLessons.length,
    achievementsUnlocked: userAchievements,
    skillScores,
  });
}
