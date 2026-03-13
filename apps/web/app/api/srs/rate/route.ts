import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { sm2, Quality } from '@/lib/sm2';
import { z } from 'zod';

const schema = z.object({
  userFlashcardId: z.string(),
  quality: z.number().int().min(0).max(5),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const result = schema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
  }

  const { userFlashcardId, quality } = result.data;

  const card = await db.userFlashcard.findFirst({
    where: { id: userFlashcardId, userId: session.user.id },
  });

  if (!card) return NextResponse.json({ error: 'Card not found' }, { status: 404 });

  const updated = sm2(card, quality as Quality);

  const savedCard = await db.userFlashcard.update({
    where: { id: userFlashcardId },
    data: {
      interval: updated.interval,
      easeFactor: updated.easeFactor,
      repetitions: updated.repetitions,
      dueDate: updated.dueDate,
      lastReviewed: updated.lastReviewed,
      correctStreak: updated.correctStreak ?? 0,
    },
  });

  return NextResponse.json(savedCard);
}
