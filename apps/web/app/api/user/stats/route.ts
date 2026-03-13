import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userId = session.user.id;

  const [user, lessonProgress, writingEntries] = await Promise.all([
    db.user.findUnique({
      where: { id: userId },
      select: {
        xpTotal: true,
        streakCurrent: true,
        streakLongest: true,
        currentLevel: true,
        dailyGoalMinutes: true,
      },
    }),
    db.userLessonProgress.findMany({
      where: { userId, status: 'COMPLETED' },
      select: { lessonId: true, score: true, completedAt: true },
      orderBy: { completedAt: 'desc' },
    }),
    db.writingEntry.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
      select: { id: true, content: true, createdAt: true, aiFeedback: true },
    }),
  ]);

  return NextResponse.json({
    ...user,
    completedLessons: lessonProgress.length,
    writingEntries,
  });
}

const writingSchema = z.object({
  content: z.string().min(1),
  aiFeedback: z.record(z.unknown()).optional(),
  language: z.string().default('Spanish'),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const result = writingSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
  }

  try {
    const entry = await db.writingEntry.create({
      data: {
        userId: session.user.id,
        content: result.data.content,
        language: result.data.language,
        aiFeedback: result.data.aiFeedback ? JSON.stringify(result.data.aiFeedback) : null,
      },
    });

    // Award XP for writing
    await db.user.update({
      where: { id: session.user.id },
      data: { xpTotal: { increment: 30 } },
    });

    return NextResponse.json(entry, { status: 201 });
  } catch (error) {
    console.error('Writing entry error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
