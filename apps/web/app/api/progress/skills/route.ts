import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const lessonProgress = await db.userLessonProgress.findMany({
    where: { userId: session.user.id, status: 'COMPLETED' },
    include: { lesson: { select: { type: true } } },
  });

  const skillScores = {
    VOCABULARY: { total: 0, scoreSum: 0 },
    GRAMMAR: { total: 0, scoreSum: 0 },
    LISTENING: { total: 0, scoreSum: 0 },
    SPEAKING: { total: 0, scoreSum: 0 },
    READING: { total: 0, scoreSum: 0 },
    WRITING: { total: 0, scoreSum: 0 },
  };

  for (const p of lessonProgress) {
    const type = p.lesson.type as keyof typeof skillScores;
    if (skillScores[type]) {
      skillScores[type].total += 1;
      skillScores[type].scoreSum += p.score;
    }
  }

  const result = Object.fromEntries(
    Object.entries(skillScores).map(([type, data]) => [
      type,
      data.total > 0 ? Math.round(data.scoreSum / data.total) : 0,
    ])
  );

  return NextResponse.json(result);
}
