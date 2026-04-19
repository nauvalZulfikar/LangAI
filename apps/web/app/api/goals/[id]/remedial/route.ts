import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const goal = await db.goalCycle.findFirst({
    where: { id: params.id, userId: session.user.id },
  });

  if (!goal) return NextResponse.json({ error: 'Goal not found' }, { status: 404 });

  // Get the latest failed test with a remedial plan
  const failedTest = await db.goalMasteryTest.findFirst({
    where: {
      goalId: params.id,
      passed: false,
      remedialPlan: { not: null },
    },
    orderBy: { createdAt: 'desc' },
  });

  if (!failedTest || !failedTest.remedialPlan) {
    return NextResponse.json({ noRemedialPlan: true });
  }

  const remedialPlan = JSON.parse(failedTest.remedialPlan);

  // Get goal lessons and their completion status
  const goalLessons = await db.goalLesson.findMany({
    where: { goalId: params.id },
    include: {
      lesson: { select: { id: true, title: true, type: true, estimatedMinutes: true } },
    },
  });

  return NextResponse.json({
    testId: failedTest.id,
    score: failedTest.score,
    attempt: failedTest.attempt,
    remedialPlan,
    lessons: goalLessons.map((gl) => ({
      id: gl.lesson.id,
      title: gl.lesson.title,
      type: gl.lesson.type,
      estimatedMinutes: gl.lesson.estimatedMinutes,
      completed: gl.completedAt !== null,
    })),
  });
}
