import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { calculateLessonXP, getStarRating, calculateStreakBonus } from '@/lib/xp';
import { z } from 'zod';

const schema = z.object({
  score: z.number().int().min(0).max(100),
  correct: z.number().int().min(0),
  total: z.number().int().min(1),
});

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const result = schema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
  }

  const { score } = result.data;
  const userId = session.user.id;
  const lessonId = params.id;

  try {
    const lesson = await db.lesson.findUnique({ where: { id: lessonId } });
    if (!lesson) return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });

    const xpEarned = calculateLessonXP(score, lesson.xpReward);
    const stars = getStarRating(score);

    const [updatedProgress, user] = await db.$transaction(async (tx) => {
      const progress = await tx.userLessonProgress.upsert({
        where: { userId_lessonId: { userId, lessonId } },
        update: {
          status: 'COMPLETED',
          score,
          completedAt: new Date(),
          attempts: { increment: 1 },
        },
        create: {
          userId,
          lessonId,
          status: 'COMPLETED',
          score,
          completedAt: new Date(),
          attempts: 1,
        },
      });

      const currentUser = await tx.user.findUnique({
        where: { id: userId },
        select: { streakCurrent: true, lastActivityAt: true },
      });

      // Update streak
      const now = new Date();
      const lastActivity = currentUser?.lastActivityAt;
      let newStreak = currentUser?.streakCurrent ?? 0;
      let streakBonus = 0;

      if (lastActivity) {
        const hoursDiff = (now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60);
        if (hoursDiff > 48) {
          newStreak = 1; // Streak broken
        } else if (hoursDiff > 20) {
          newStreak += 1; // New day
          streakBonus = calculateStreakBonus(newStreak);
        }
      } else {
        newStreak = 1;
      }

      const totalXP = xpEarned + streakBonus;

      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: {
          xpTotal: { increment: totalXP },
          streakCurrent: newStreak,
          streakLongest: { increment: 0 }, // Handled separately
          lastActivityAt: now,
        },
      });

      return [progress, updatedUser];
    });

    // Add flashcards from lesson to user's deck
    const flashcards = await db.flashcard.findMany({ where: { lessonId } });
    for (const fc of flashcards) {
      await db.userFlashcard.upsert({
        where: { userId_flashcardId: { userId, flashcardId: fc.id } },
        update: {},
        create: { userId, flashcardId: fc.id },
      });
    }

    // Check if lesson is part of active goal
    let goalReadyForTest = false;
    let goalId: string | null = null;

    const goalLesson = await db.goalLesson.findFirst({
      where: {
        lessonId,
        goal: { userId, status: 'ACTIVE' },
        completedAt: null,
      },
    });

    if (goalLesson) {
      await db.goalLesson.update({
        where: { id: goalLesson.id },
        data: { completedAt: new Date() },
      });

      // Check if all goal lessons are done
      const remaining = await db.goalLesson.count({
        where: { goalId: goalLesson.goalId, completedAt: null },
      });

      if (remaining === 0) {
        goalReadyForTest = true;
        goalId = goalLesson.goalId;
      }
    }

    return NextResponse.json({
      success: true,
      score,
      stars,
      xpEarned,
      progress: updatedProgress,
      goalReadyForTest,
      goalId,
    });
  } catch (error) {
    console.error('Lesson complete error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
