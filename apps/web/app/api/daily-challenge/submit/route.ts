import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';

const schema = z.object({
  challengeId: z.string(),
  score: z.number().int().min(0).max(100),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const result = schema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
  }

  const { challengeId, score } = result.data;
  const userId = session.user.id;

  const existing = await db.userDailyChallenge.findUnique({
    where: { userId_challengeId: { userId, challengeId } },
  });

  if (existing) {
    return NextResponse.json({ error: 'Already completed' }, { status: 409 });
  }

  const challenge = await db.dailyChallenge.findUnique({ where: { id: challengeId } });
  if (!challenge) return NextResponse.json({ error: 'Challenge not found' }, { status: 404 });

  try {
    await db.$transaction(async (tx) => {
      await tx.userDailyChallenge.create({
        data: { userId, challengeId, score },
      });
      await tx.user.update({
        where: { id: userId },
        data: { xpTotal: { increment: challenge.xpReward } },
      });
    });

    return NextResponse.json({ success: true, xpEarned: challenge.xpReward });
  } catch (error) {
    console.error('Daily challenge submit error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
