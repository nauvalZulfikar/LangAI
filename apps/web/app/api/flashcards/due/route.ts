import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const now = new Date();

  const dueCards = await db.userFlashcard.findMany({
    where: {
      userId: session.user.id,
      dueDate: { lte: now },
    },
    include: { flashcard: true },
    orderBy: { dueDate: 'asc' },
    take: 50,
  });

  const response = dueCards.map((uf) => ({
    id: uf.flashcard.id,
    front: uf.flashcard.front,
    back: uf.flashcard.back,
    audioUrl: uf.flashcard.audioUrl,
    imageUrl: uf.flashcard.imageUrl,
    language: uf.flashcard.language,
    tags: uf.flashcard.tags,
    srs: {
      id: uf.id,
      interval: uf.interval,
      easeFactor: uf.easeFactor,
      dueDate: uf.dueDate,
      repetitions: uf.repetitions,
      lastReviewed: uf.lastReviewed,
      correctStreak: uf.correctStreak,
    },
  }));

  return NextResponse.json(response);
}
