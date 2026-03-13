import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const level = searchParams.get('level');
  const unit = searchParams.get('unit');
  const type = searchParams.get('type');

  const where: Record<string, unknown> = {};
  if (level) where.level = level;
  if (unit) where.unit = parseInt(unit, 10);
  if (type) where.type = type;

  const [lessons, userProgress] = await Promise.all([
    db.lesson.findMany({
      where,
      orderBy: [{ unit: 'asc' }, { order: 'asc' }],
    }),
    db.userLessonProgress.findMany({
      where: { userId: session.user.id },
      select: { lessonId: true, status: true, score: true, completedAt: true, attempts: true },
    }),
  ]);

  const progressMap = Object.fromEntries(userProgress.map((p) => [p.lessonId, p]));

  const lessonsWithProgress = lessons.map((lesson) => ({
    ...lesson,
    content: undefined, // Don't send full content in list view
    progress: progressMap[lesson.id] ?? null,
  }));

  return NextResponse.json(lessonsWithProgress);
}
