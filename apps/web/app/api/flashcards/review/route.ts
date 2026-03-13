import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { sm2, Quality } from '@/lib/sm2';
import { z } from 'zod';

const schema = z.object({
  flashcardId: z.string(),
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

  const { flashcardId, quality } = result.data;
  const userId = session.user.id;

  try {
    const userFlashcard = await db.userFlashcard.findUnique({
      where: { userId_flashcardId: { userId, flashcardId } },
    });

    if (!userFlashcard) {
      return NextResponse.json({ error: 'Flashcard not found' }, { status: 404 });
    }

    const updated = sm2(
      {
        interval: userFlashcard.interval,
        easeFactor: userFlashcard.easeFactor,
        repetitions: userFlashcard.repetitions,
        dueDate: userFlashcard.dueDate,
        lastReviewed: userFlashcard.lastReviewed,
        correctStreak: userFlashcard.correctStreak,
      },
      quality as Quality
    );

    const savedCard = await db.userFlashcard.update({
      where: { userId_flashcardId: { userId, flashcardId } },
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
  } catch (error) {
    console.error('Review error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
