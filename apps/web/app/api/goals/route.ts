import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { openai, checkRateLimit } from '@/lib/openai';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userId = session.user.id;

  const [activeGoal, suggestedGoal, completedGoals] = await Promise.all([
    db.goalCycle.findFirst({
      where: { userId, status: 'ACTIVE' },
      include: { assignedLessons: true },
    }),
    db.goalCycle.findFirst({
      where: { userId, status: 'SUGGESTED' },
      orderBy: { createdAt: 'desc' },
    }),
    db.goalCycle.findMany({
      where: { userId, status: 'COMPLETED' },
      orderBy: { completedAt: 'desc' },
      take: 5,
    }),
  ]);

  const formatGoal = (goal: NonNullable<typeof activeGoal>) => {
    const lessons = 'assignedLessons' in goal ? (goal as typeof activeGoal)!.assignedLessons : [];
    const totalLessons = lessons.length;
    const completedLessons = lessons.filter((l) => l.completedAt !== null).length;
    const now = new Date();
    const startedAt = goal.startedAt ? new Date(goal.startedAt) : now;
    const deadlineAt = goal.deadlineAt ? new Date(goal.deadlineAt) : now;
    const daysElapsed = Math.max(0, Math.floor((now.getTime() - startedAt.getTime()) / (1000 * 60 * 60 * 24)));
    const daysRemaining = Math.max(0, Math.floor((deadlineAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
    const percentComplete = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

    return {
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
      progress: { totalLessons, completedLessons, daysElapsed, daysRemaining, percentComplete },
    };
  };

  return NextResponse.json({
    activeGoal: activeGoal ? formatGoal(activeGoal) : null,
    suggestedGoal: suggestedGoal
      ? {
          id: suggestedGoal.id,
          title: suggestedGoal.title,
          description: suggestedGoal.description,
          topic: suggestedGoal.topic,
          cefrLevel: suggestedGoal.cefrLevel,
          skillFocus: JSON.parse(suggestedGoal.skillFocus),
          status: suggestedGoal.status,
          durationDays: suggestedGoal.durationDays,
          xpMultiplier: suggestedGoal.xpMultiplier,
          passThreshold: suggestedGoal.passThreshold,
          sequenceNumber: suggestedGoal.sequenceNumber,
          startedAt: null,
          deadlineAt: null,
          completedAt: null,
          progress: { totalLessons: 0, completedLessons: 0, daysElapsed: 0, daysRemaining: 0, percentComplete: 0 },
        }
      : null,
    completedGoals: completedGoals.map((g) => ({
      id: g.id,
      title: g.title,
      status: g.status,
      completedAt: g.completedAt?.toISOString() ?? null,
    })),
  });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  if (!checkRateLimit(session.user.id, 5, 60000)) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
  }

  const userId = session.user.id;

  // Gather user context
  const [user, lessonProgress, previousGoals] = await Promise.all([
    db.user.findUnique({
      where: { id: userId },
      select: { currentLevel: true, targetLanguage: true, nativeLanguage: true },
    }),
    db.userLessonProgress.findMany({
      where: { userId, status: 'COMPLETED' },
      include: { lesson: { select: { id: true, type: true, title: true } } },
    }),
    db.goalCycle.findMany({
      where: { userId, status: { in: ['COMPLETED', 'ACTIVE'] } },
      select: { topic: true, title: true },
      orderBy: { createdAt: 'desc' },
      take: 10,
    }),
  ]);

  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  // Calculate skill scores
  const typeCounts: Record<string, { total: number; scoreSum: number }> = {};
  const completedLessonIds: string[] = [];
  for (const p of lessonProgress) {
    const type = p.lesson.type.toLowerCase();
    if (!typeCounts[type]) typeCounts[type] = { total: 0, scoreSum: 0 };
    typeCounts[type].total += 1;
    typeCounts[type].scoreSum += p.score;
    completedLessonIds.push(p.lessonId);
  }

  const skillScores: Record<string, number> = {};
  for (const [type, data] of Object.entries(typeCounts)) {
    skillScores[type] = Math.round(data.scoreSum / data.total);
  }

  // Get available lesson topics
  const availableLessons = await db.lesson.findMany({
    where: { level: user.currentLevel },
    select: { id: true, title: true, type: true },
    take: 50,
  });

  const availableLessonTopics = Array.from(new Set(availableLessons.map((l) => l.title.split(':')[0]?.trim() ?? l.title)));

  const context = {
    cefrLevel: user.currentLevel,
    targetLanguage: user.targetLanguage,
    nativeLanguage: user.nativeLanguage,
    skillScores,
    recentlyCompletedTopics: completedLessonIds.slice(0, 20),
    previousGoals: previousGoals.map((g) => g.topic),
    availableLessonTopics,
  };

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are a language learning curriculum designer.

Context (JSON): cefrLevel, targetLanguage, nativeLanguage, skillScores {vocab,grammar,...},
recentlyCompletedTopics[], previousGoals[], availableLessonTopics[]

Instructions:
1. Identify weakest skill area(s)
2. Choose specific, engaging topic targeting those weaknesses
3. Determine duration (7-14 days)
4. Return JSON: { "title": string, "description": string, "topic": string, "skillFocus": string[], "durationDays": number, "rationale": string }`,
        },
        {
          role: 'user',
          content: JSON.stringify(context),
        },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 400,
      temperature: 0.7,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) throw new Error('No response from AI');

    const goalData = JSON.parse(content);

    // Get the latest sequence number
    const lastCompleted = await db.goalCycle.findFirst({
      where: { userId, status: 'COMPLETED' },
      orderBy: { completedAt: 'desc' },
      select: { sequenceNumber: true },
    });

    const goal = await db.goalCycle.create({
      data: {
        userId,
        title: goalData.title,
        description: goalData.description,
        topic: goalData.topic,
        cefrLevel: user.currentLevel,
        skillFocus: JSON.stringify(goalData.skillFocus),
        durationDays: goalData.durationDays,
        sequenceNumber: (lastCompleted?.sequenceNumber ?? 0),
        aiContext: JSON.stringify(context),
      },
    });

    return NextResponse.json({
      id: goal.id,
      title: goal.title,
      description: goal.description,
      topic: goal.topic,
      cefrLevel: goal.cefrLevel,
      skillFocus: goalData.skillFocus,
      status: goal.status,
      durationDays: goal.durationDays,
      xpMultiplier: goal.xpMultiplier,
      passThreshold: goal.passThreshold,
      sequenceNumber: goal.sequenceNumber,
      rationale: goalData.rationale,
      startedAt: null,
      deadlineAt: null,
      completedAt: null,
      progress: { totalLessons: 0, completedLessons: 0, daysElapsed: 0, daysRemaining: 0, percentComplete: 0 },
    });
  } catch (error) {
    console.error('Goal generation error:', error);
    return NextResponse.json({ error: 'Failed to generate goal' }, { status: 500 });
  }
}
