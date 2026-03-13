import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const challenge = await db.dailyChallenge.findFirst({
    where: { date: { gte: today } },
  });

  if (!challenge) return NextResponse.json(null);

  const completed = await db.userDailyChallenge.findUnique({
    where: {
      userId_challengeId: { userId: session.user.id, challengeId: challenge.id },
    },
  });

  return NextResponse.json({
    ...challenge,
    completed: !!completed,
    score: completed?.score ?? null,
  });
}
