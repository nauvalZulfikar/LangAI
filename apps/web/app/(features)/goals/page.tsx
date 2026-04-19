import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import { GoalSuggestionCard } from '@/components/goals/GoalSuggestionCard';
import { ActiveGoalBanner } from '@/components/goals/ActiveGoalBanner';
import Link from 'next/link';
import { GoalCycleData, GoalStatus, LessonType, CEFRLevel } from '@/types';

export default async function GoalsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  const userId = session.user.id;

  const [activeGoalRaw, suggestedGoalRaw, completedGoals] = await Promise.all([
    db.goalCycle.findFirst({
      where: { userId, status: 'ACTIVE' },
      include: { assignedLessons: true },
    }),
    db.goalCycle.findFirst({
      where: { userId, status: 'SUGGESTED' },
      orderBy: { createdAt: 'desc' },
    }),
    db.goalCycle.findMany({
      where: { userId, status: { in: ['COMPLETED', 'FAILED', 'SKIPPED'] } },
      orderBy: { createdAt: 'desc' },
      take: 20,
    }),
  ]);

  const formatGoal = (goal: NonNullable<typeof activeGoalRaw>): GoalCycleData => {
    const lessons = 'assignedLessons' in goal ? (goal as typeof activeGoalRaw)!.assignedLessons : [];
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
      cefrLevel: goal.cefrLevel as CEFRLevel,
      skillFocus: JSON.parse(goal.skillFocus) as LessonType[],
      status: goal.status as GoalStatus,
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

  const activeGoal = activeGoalRaw ? formatGoal(activeGoalRaw) : null;
  const suggestedGoal = suggestedGoalRaw
    ? {
        id: suggestedGoalRaw.id,
        title: suggestedGoalRaw.title,
        description: suggestedGoalRaw.description,
        topic: suggestedGoalRaw.topic,
        cefrLevel: suggestedGoalRaw.cefrLevel as CEFRLevel,
        skillFocus: JSON.parse(suggestedGoalRaw.skillFocus) as LessonType[],
        status: suggestedGoalRaw.status as GoalStatus,
        durationDays: suggestedGoalRaw.durationDays,
        xpMultiplier: suggestedGoalRaw.xpMultiplier,
        passThreshold: suggestedGoalRaw.passThreshold,
        sequenceNumber: suggestedGoalRaw.sequenceNumber,
        startedAt: null,
        deadlineAt: null,
        completedAt: null,
        progress: { totalLessons: 0, completedLessons: 0, daysElapsed: 0, daysRemaining: 0, percentComplete: 0 },
      }
    : null;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Learning Goals</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
          AI-powered learning cycles with mastery tests
        </p>
      </div>

      <div className="space-y-6">
        {activeGoal && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Active Goal</h2>
            <ActiveGoalBanner goal={activeGoal} />
          </div>
        )}

        {!activeGoal && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              {suggestedGoal ? 'Suggested Goal' : 'Get Started'}
            </h2>
            <GoalSuggestionCard goal={suggestedGoal} />
          </div>
        )}

        {completedGoals.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Goal History</h2>
            <div className="space-y-2">
              {completedGoals.map((goal) => (
                <Link
                  key={goal.id}
                  href={`/goals/${goal.id}`}
                  className="flex items-center justify-between p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 hover:shadow-sm transition-shadow"
                >
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{goal.title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {goal.completedAt
                        ? new Date(goal.completedAt).toLocaleDateString()
                        : new Date(goal.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span
                    className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                      goal.status === 'COMPLETED'
                        ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                        : goal.status === 'FAILED'
                          ? 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {goal.status}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
