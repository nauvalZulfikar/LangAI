import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { getWeekStart } from '@/lib/utils';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const weekStart = getWeekStart();

  const leaderboard = await db.leaderboard.findMany({
    where: { weekStart },
    include: {
      user: {
        select: { id: true, name: true, avatar: true, currentLevel: true },
      },
    },
    orderBy: { xpEarned: 'desc' },
    take: 100,
  });

  const response = leaderboard.map((entry, index) => ({
    rank: index + 1,
    userId: entry.user.id,
    name: entry.user.name,
    avatar: entry.user.avatar,
    level: entry.user.currentLevel,
    xpEarned: entry.xpEarned,
    isCurrentUser: entry.user.id === session.user.id,
  }));

  return NextResponse.json(response);
}
