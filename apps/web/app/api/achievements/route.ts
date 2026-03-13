import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const [achievements, userAchievements] = await Promise.all([
    db.achievement.findMany({ orderBy: { xpReward: 'asc' } }),
    db.userAchievement.findMany({
      where: { userId: session.user.id },
      include: { achievement: true },
    }),
  ]);

  const unlockedIds = new Set(userAchievements.map((ua) => ua.achievementId));

  const result = achievements.map((a) => ({
    ...a,
    unlocked: unlockedIds.has(a.id),
    unlockedAt: userAchievements.find((ua) => ua.achievementId === a.id)?.unlockedAt ?? null,
  }));

  return NextResponse.json(result);
}
