import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return new Response('Unauthorized', { status: 401 });

  const userId = session.user.id;

  const stream = new TransformStream();
  const writer = stream.writable.getWriter();
  const encoder = new TextEncoder();

  const sendEvent = async (data: object) => {
    try {
      await writer.write(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
    } catch {
      // client disconnected
    }
  };

  // Send initial notifications
  const pushInitial = async () => {
    const [achievements, user] = await Promise.all([
      db.userAchievement.findMany({
        where: { userId },
        include: { achievement: true },
        orderBy: { unlockedAt: 'desc' },
        take: 10,
      }),
      db.user.findUnique({
        where: { id: userId },
        select: { streakCurrent: true, xpTotal: true },
      }),
    ]);

    const notifications = achievements.map((ua) => ({
      id: `achievement-${ua.id}`,
      type: 'achievement',
      title: 'Achievement Unlocked',
      message: `"${ua.achievement.title}" — ${ua.achievement.description}`,
      xp: ua.achievement.xpReward,
      createdAt: ua.unlockedAt,
    }));

    await sendEvent({ type: 'init', notifications, streak: user?.streakCurrent ?? 0 });
  };

  pushInitial().catch(() => {});

  // Heartbeat every 30s to keep connection alive
  const heartbeat = setInterval(async () => {
    await sendEvent({ type: 'ping' });
  }, 30000);

  req.signal.addEventListener('abort', () => {
    clearInterval(heartbeat);
    writer.close().catch(() => {});
  });

  return new Response(stream.readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
}
