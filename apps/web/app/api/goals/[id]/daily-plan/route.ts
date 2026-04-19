import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { openai, checkRateLimit } from '@/lib/openai';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const goal = await db.goalCycle.findFirst({
    where: { id: params.id, userId: session.user.id, status: 'ACTIVE' },
  });

  if (!goal) return NextResponse.json({ error: 'Active goal not found' }, { status: 404 });

  const now = new Date();
  const startedAt = goal.startedAt ? new Date(goal.startedAt) : now;
  const dayNumber = Math.max(1, Math.floor((now.getTime() - startedAt.getTime()) / (1000 * 60 * 60 * 24)) + 1);

  const plan = await db.goalDailyPlan.findFirst({
    where: { goalId: goal.id, dayNumber },
  });

  if (!plan) {
    return NextResponse.json({ noPlan: true, dayNumber });
  }

  const lessonIds: string[] = JSON.parse(plan.lessonIds);
  const lessons = await db.lesson.findMany({
    where: { id: { in: lessonIds } },
    select: { id: true, title: true, type: true, estimatedMinutes: true },
  });

  const goalLessons = await db.goalLesson.findMany({
    where: { goalId: goal.id, lessonId: { in: lessonIds } },
    select: { lessonId: true, completedAt: true },
  });

  const completionMap = new Map(goalLessons.map((gl) => [gl.lessonId, gl.completedAt !== null]));

  return NextResponse.json({
    id: plan.id,
    dayNumber: plan.dayNumber,
    date: plan.date.toISOString(),
    lessons: lessons.map((l) => ({
      id: l.id,
      title: l.title,
      type: l.type,
      estimatedMinutes: l.estimatedMinutes,
      completed: completionMap.get(l.id) ?? false,
    })),
    rationale: plan.rationale,
    isCompleted: plan.isCompleted,
  });
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  if (!checkRateLimit(session.user.id, 5, 60000)) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
  }

  const userId = session.user.id;

  const goal = await db.goalCycle.findFirst({
    where: { id: params.id, userId, status: 'ACTIVE' },
    include: { assignedLessons: true },
  });

  if (!goal) return NextResponse.json({ error: 'Active goal not found' }, { status: 404 });

  // Check if all goal lessons are completed
  const allDone = goal.assignedLessons.length > 0 && goal.assignedLessons.every((l) => l.completedAt !== null);
  if (allDone) {
    return NextResponse.json({ readyForTest: true, goalId: goal.id });
  }

  const now = new Date();
  const startedAt = goal.startedAt ? new Date(goal.startedAt) : now;
  const dayNumber = Math.max(1, Math.floor((now.getTime() - startedAt.getTime()) / (1000 * 60 * 60 * 24)) + 1);

  // Check if plan already exists
  const existing = await db.goalDailyPlan.findFirst({
    where: { goalId: goal.id, dayNumber },
  });

  if (existing) {
    return NextResponse.json({ alreadyExists: true, planId: existing.id });
  }

  // Get completed lessons for this goal so far
  const completedGoalLessons = await db.goalLesson.findMany({
    where: { goalId: goal.id, completedAt: { not: null } },
    include: { lesson: { select: { id: true, type: true } } },
  });

  const completedLessonIds = new Set(completedGoalLessons.map((gl) => gl.lessonId));

  // Get user's completed lesson scores
  const userProgress = await db.userLessonProgress.findMany({
    where: { userId, status: 'COMPLETED' },
    select: { lessonId: true, score: true },
  });

  const scoreMap = new Map(userProgress.map((p) => [p.lessonId, p.score]));

  // Get available lessons matching goal level/type
  const skillFocus: string[] = JSON.parse(goal.skillFocus);
  const availableLessons = await db.lesson.findMany({
    where: {
      level: goal.cefrLevel,
      type: { in: skillFocus },
    },
    select: { id: true, title: true, type: true, level: true, estimatedMinutes: true },
  });

  // Filter out already assigned
  const assignedIds = new Set(goal.assignedLessons.map((gl) => gl.lessonId));
  const candidateLessons = availableLessons.filter((l) => !assignedIds.has(l.id) || !completedLessonIds.has(l.id));

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { dailyGoalMinutes: true },
  });

  const context = {
    goal: { topic: goal.topic, skillFocus, durationDays: goal.durationDays, dayNumber },
    completedLessons: Array.from(completedLessonIds).map((id) => ({
      id,
      type: completedGoalLessons.find((gl) => gl.lessonId === id)?.lesson.type ?? 'VOCABULARY',
      score: scoreMap.get(id) ?? 0,
    })),
    availableLessons: candidateLessons.map((l) => ({
      id: l.id,
      title: l.title,
      type: l.type,
      level: l.level,
      estimatedMinutes: l.estimatedMinutes,
    })),
    userDailyGoalMinutes: user?.dailyGoalMinutes ?? 10,
  };

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are a learning path optimizer.

Context (JSON): goal {topic, skillFocus, durationDays, dayNumber},
completedLessons [{id, type, score}], availableLessons [{id, title, type, level, estimatedMinutes}],
userDailyGoalMinutes

Instructions:
1. Select 2-4 lessons within daily time budget
2. Prioritize: lowest-scored skills -> variety -> progressive difficulty
3. Later in cycle: focus areas scored below 70%
4. Return JSON: { "lessonIds": string[], "rationale": string, "estimatedMinutes": number }`,
        },
        {
          role: 'user',
          content: JSON.stringify(context),
        },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 300,
      temperature: 0.3,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) throw new Error('No response from AI');

    const planData = JSON.parse(content);
    const selectedIds: string[] = planData.lessonIds ?? [];

    // Create plan and goal lessons in a transaction
    const plan = await db.$transaction(async (tx) => {
      const dailyPlan = await tx.goalDailyPlan.create({
        data: {
          goalId: goal.id,
          dayNumber,
          date: now,
          lessonIds: JSON.stringify(selectedIds),
          rationale: planData.rationale ?? '',
        },
      });

      // Create GoalLesson records for newly assigned lessons
      for (const lessonId of selectedIds) {
        const existingGL = await tx.goalLesson.findUnique({
          where: { goalId_lessonId: { goalId: goal.id, lessonId } },
        });
        if (!existingGL) {
          await tx.goalLesson.create({
            data: {
              goalId: goal.id,
              lessonId,
              dayNumber,
            },
          });
        }
      }

      return dailyPlan;
    });

    // Fetch lessons for response
    const lessons = await db.lesson.findMany({
      where: { id: { in: selectedIds } },
      select: { id: true, title: true, type: true, estimatedMinutes: true },
    });

    return NextResponse.json({
      id: plan.id,
      dayNumber: plan.dayNumber,
      date: plan.date.toISOString(),
      lessons: lessons.map((l) => ({
        id: l.id,
        title: l.title,
        type: l.type,
        estimatedMinutes: l.estimatedMinutes,
        completed: false,
      })),
      rationale: planData.rationale ?? '',
      isCompleted: false,
    });
  } catch (error) {
    console.error('Daily plan generation error:', error);
    return NextResponse.json({ error: 'Failed to generate daily plan' }, { status: 500 });
  }
}
