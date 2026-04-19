import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const goal = await db.goalCycle.findFirst({
    where: { id: params.id, userId: session.user.id },
    include: {
      assignedLessons: {
        include: {
          lesson: { select: { id: true, title: true, type: true, estimatedMinutes: true } },
        },
      },
      dailyPlans: { orderBy: { dayNumber: 'asc' } },
    },
  });

  if (!goal) return NextResponse.json({ error: 'Goal not found' }, { status: 404 });

  const totalLessons = goal.assignedLessons.length;
  const completedLessons = goal.assignedLessons.filter((l) => l.completedAt !== null).length;
  const now = new Date();
  const startedAt = goal.startedAt ? new Date(goal.startedAt) : now;
  const deadlineAt = goal.deadlineAt ? new Date(goal.deadlineAt) : now;
  const daysElapsed = Math.max(0, Math.floor((now.getTime() - startedAt.getTime()) / (1000 * 60 * 60 * 24)));
  const daysRemaining = Math.max(0, Math.floor((deadlineAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
  const percentComplete = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  // On track if completion rate is at least proportional to time elapsed
  const expectedProgress = goal.durationDays > 0 ? (daysElapsed / goal.durationDays) * 100 : 0;
  const onTrack = percentComplete >= expectedProgress - 10;

  return NextResponse.json({
    goalId: goal.id,
    status: goal.status,
    totalLessons,
    completedLessons,
    daysElapsed,
    daysRemaining,
    percentComplete,
    onTrack,
    allLessonsDone: totalLessons > 0 && completedLessons >= totalLessons,
    lessons: goal.assignedLessons.map((gl) => ({
      id: gl.lesson.id,
      title: gl.lesson.title,
      type: gl.lesson.type,
      dayNumber: gl.dayNumber,
      completed: gl.completedAt !== null,
      completedAt: gl.completedAt?.toISOString() ?? null,
    })),
    dailyPlans: goal.dailyPlans.map((p) => ({
      dayNumber: p.dayNumber,
      date: p.date.toISOString(),
      isCompleted: p.isCompleted,
    })),
  });
}
