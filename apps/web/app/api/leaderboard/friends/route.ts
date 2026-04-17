import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { getWeekStart } from '@/lib/utils';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userId = session.user.id;
  const weekStart = getWeekStart();

  // Get all accepted friendships
  const friendships = await db.friendship.findMany({
    where: {
      OR: [
        { userId, status: 'ACCEPTED' },
        { friendId: userId, status: 'ACCEPTED' },
      ],
    },
    select: { userId: true, friendId: true },
  });

  const friendIds = friendships.map((f) => (f.userId === userId ? f.friendId : f.userId));
  // Include the current user
  const participantIds = [userId, ...friendIds];

  const leaderboard = await db.leaderboard.findMany({
    where: { weekStart, userId: { in: participantIds } },
    include: {
      user: {
        select: { id: true, name: true, avatar: true, currentLevel: true },
      },
    },
    orderBy: { xpEarned: 'desc' },
  });

  const response = leaderboard.map((entry, index) => ({
    rank: index + 1,
    userId: entry.user.id,
    name: entry.user.name,
    avatar: entry.user.avatar,
    level: entry.user.currentLevel,
    xpEarned: entry.xpEarned,
    isCurrentUser: entry.user.id === userId,
  }));

  return NextResponse.json(response);
}
