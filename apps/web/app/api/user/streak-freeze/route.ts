import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

// GET: returns current freeze count
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const settings = await db.userSettings.findUnique({
    where: { userId: session.user.id },
    select: { streakFreezeCount: true },
  });

  return NextResponse.json({ freezeCount: settings?.streakFreezeCount ?? 1 });
}

// POST: use a freeze — decrement count and set streakFrozenUntil to tomorrow
export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userId = session.user.id;

  const settings = await db.userSettings.findUnique({
    where: { userId },
    select: { streakFreezeCount: true },
  });

  const freezeCount = settings?.streakFreezeCount ?? 0;

  if (freezeCount <= 0) {
    return NextResponse.json({ error: 'No streak freezes available' }, { status: 400 });
  }

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(23, 59, 59, 999);

  await db.$transaction([
    db.userSettings.upsert({
      where: { userId },
      update: { streakFreezeCount: { decrement: 1 } },
      create: { userId, streakFreezeCount: Math.max(0, freezeCount - 1) },
    }),
    db.user.update({
      where: { id: userId },
      data: { streakFrozenUntil: tomorrow },
    }),
  ]);

  return NextResponse.json({ success: true, freezeCount: freezeCount - 1, frozenUntil: tomorrow });
}
