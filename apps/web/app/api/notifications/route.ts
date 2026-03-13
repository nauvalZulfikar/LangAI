import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userId = session.user.id;

  // Build notifications from DB data
  const notifications = [];

  const recentAchievements = await db.userAchievement.findMany({
    where: { userId },
    include: { achievement: true },
    orderBy: { unlockedAt: 'desc' },
    take: 5,
  });

  for (const ua of recentAchievements) {
    notifications.push({
      id: `achievement-${ua.id}`,
      type: 'achievement',
      title: `🏆 Achievement Unlocked`,
      message: `You've unlocked "${ua.achievement.title}" — ${ua.achievement.description}`,
      read: false,
      createdAt: ua.unlockedAt,
    });
  }

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { streakCurrent: true },
  });

  if ((user?.streakCurrent ?? 0) > 0 && (user?.streakCurrent ?? 0) % 7 === 0) {
    notifications.push({
      id: `streak-${user?.streakCurrent}`,
      type: 'streak',
      title: `🔥 ${user?.streakCurrent}-Day Streak!`,
      message: `Incredible! You've maintained a ${user?.streakCurrent}-day learning streak!`,
      read: false,
      createdAt: new Date(),
    });
  }

  return NextResponse.json(notifications.slice(0, 20));
}
