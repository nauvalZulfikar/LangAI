import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';
import { addDays } from 'date-fns';

const patchSchema = z.object({
  action: z.enum(['accept', 'skip', 'abandon']),
});

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const goal = await db.goalCycle.findFirst({
    where: { id: params.id, userId: session.user.id },
    include: { assignedLessons: { include: { lesson: { select: { id: true, title: true, type: true, estimatedMinutes: true } } } } },
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

  return NextResponse.json({
    id: goal.id,
    title: goal.title,
    description: goal.description,
    topic: goal.topic,
    cefrLevel: goal.cefrLevel,
    skillFocus: JSON.parse(goal.skillFocus),
    status: goal.status,
    durationDays: goal.durationDays,
    startedAt: goal.startedAt?.toISOString() ?? null,
    deadlineAt: goal.deadlineAt?.toISOString() ?? null,
    completedAt: goal.completedAt?.toISOString() ?? null,
    xpMultiplier: goal.xpMultiplier,
    passThreshold: goal.passThreshold,
    sequenceNumber: goal.sequenceNumber,
    assignedLessons: goal.assignedLessons.map((gl) => ({
      id: gl.lesson.id,
      title: gl.lesson.title,
      type: gl.lesson.type,
      estimatedMinutes: gl.lesson.estimatedMinutes,
      dayNumber: gl.dayNumber,
      completed: gl.completedAt !== null,
    })),
    progress: { totalLessons, completedLessons, daysElapsed, daysRemaining, percentComplete },
  });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const result = patchSchema.safeParse(body);
  if (!result.success) return NextResponse.json({ error: 'Invalid data' }, { status: 400 });

  const { action } = result.data;
  const userId = session.user.id;

  const goal = await db.goalCycle.findFirst({
    where: { id: params.id, userId },
  });

  if (!goal) return NextResponse.json({ error: 'Goal not found' }, { status: 404 });

  if (action === 'accept') {
    if (goal.status !== 'SUGGESTED') {
      return NextResponse.json({ error: 'Goal is not in SUGGESTED status' }, { status: 400 });
    }

    const now = new Date();
    const deadline = addDays(now, goal.durationDays);

    const updated = await db.goalCycle.update({
      where: { id: goal.id },
      data: {
        status: 'ACTIVE',
        startedAt: now,
        deadlineAt: deadline,
      },
    });

    return NextResponse.json({
      id: updated.id,
      status: updated.status,
      startedAt: updated.startedAt?.toISOString() ?? null,
      deadlineAt: updated.deadlineAt?.toISOString() ?? null,
    });
  }

  if (action === 'skip') {
    const updated = await db.goalCycle.update({
      where: { id: goal.id },
      data: { status: 'SKIPPED', sequenceNumber: 0 },
    });
    return NextResponse.json({ id: updated.id, status: updated.status });
  }

  if (action === 'abandon') {
    const updated = await db.goalCycle.update({
      where: { id: goal.id },
      data: { status: 'FAILED', sequenceNumber: 0 },
    });
    return NextResponse.json({ id: updated.id, status: updated.status });
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
}
