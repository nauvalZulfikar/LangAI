import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const lesson = await db.lesson.findUnique({ where: { id: params.id } });
  if (!lesson) return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });

  const progress = await db.userLessonProgress.findUnique({
    where: { userId_lessonId: { userId: session.user.id, lessonId: params.id } },
  });

  // Mark as in progress if not started
  if (!progress) {
    await db.userLessonProgress.create({
      data: { userId: session.user.id, lessonId: params.id, status: 'IN_PROGRESS' },
    });
  } else if (progress.status === 'NOT_STARTED') {
    await db.userLessonProgress.update({
      where: { userId_lessonId: { userId: session.user.id, lessonId: params.id } },
      data: { status: 'IN_PROGRESS' },
    });
  }

  return NextResponse.json({
    ...lesson,
    content: JSON.parse(lesson.content as string),
    progress: progress ?? null,
  });
}
