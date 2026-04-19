import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { Target, Clock, Zap, CheckCircle, Circle, ArrowRight } from 'lucide-react';

export default async function GoalDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  const goal = await db.goalCycle.findFirst({
    where: { id: params.id, userId: session.user.id },
    include: {
      assignedLessons: {
        include: { lesson: { select: { id: true, title: true, type: true, estimatedMinutes: true } } },
        orderBy: { dayNumber: 'asc' },
      },
      dailyPlans: { orderBy: { dayNumber: 'asc' } },
      masteryTests: { orderBy: { createdAt: 'desc' }, take: 1 },
    },
  });

  if (!goal) notFound();

  const totalLessons = goal.assignedLessons.length;
  const completedLessons = goal.assignedLessons.filter((l) => l.completedAt !== null).length;
  const now = new Date();
  const startedAt = goal.startedAt ? new Date(goal.startedAt) : now;
  const deadlineAt = goal.deadlineAt ? new Date(goal.deadlineAt) : now;
  const daysElapsed = Math.max(0, Math.floor((now.getTime() - startedAt.getTime()) / (1000 * 60 * 60 * 24)));
  const daysRemaining = Math.max(0, Math.floor((deadlineAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
  const percentComplete = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
  const allDone = totalLessons > 0 && completedLessons >= totalLessons;
  const latestTest = goal.masteryTests[0] ?? null;
  const skillFocus: string[] = JSON.parse(goal.skillFocus);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Link href="/goals" className="text-sm text-primary-600 dark:text-primary-400 hover:underline mb-2 inline-block">
          &larr; Back to Goals
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{goal.title}</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{goal.description}</p>
      </div>

      {/* Status & Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-100 dark:border-gray-800 text-center">
          <Target className="w-5 h-5 text-primary-600 dark:text-primary-400 mx-auto mb-1" />
          <p className="text-xs text-gray-500 dark:text-gray-400">Status</p>
          <p className="font-semibold text-gray-900 dark:text-white text-sm">{goal.status}</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-100 dark:border-gray-800 text-center">
          <Clock className="w-5 h-5 text-blue-500 mx-auto mb-1" />
          <p className="text-xs text-gray-500 dark:text-gray-400">Days Left</p>
          <p className="font-semibold text-gray-900 dark:text-white text-sm">{daysRemaining}</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-100 dark:border-gray-800 text-center">
          <CheckCircle className="w-5 h-5 text-green-500 mx-auto mb-1" />
          <p className="text-xs text-gray-500 dark:text-gray-400">Progress</p>
          <p className="font-semibold text-gray-900 dark:text-white text-sm">{completedLessons}/{totalLessons}</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-100 dark:border-gray-800 text-center">
          <Zap className="w-5 h-5 text-yellow-500 mx-auto mb-1" />
          <p className="text-xs text-gray-500 dark:text-gray-400">XP Bonus</p>
          <p className="font-semibold text-gray-900 dark:text-white text-sm">{goal.xpMultiplier}x</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-100 dark:border-gray-800 mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Overall Progress</span>
          <span className="text-sm font-bold text-primary-600 dark:text-primary-400">{percentComplete}%</span>
        </div>
        <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-3">
          <div
            className="gradient-primary h-3 rounded-full transition-all duration-500"
            style={{ width: `${percentComplete}%` }}
          />
        </div>
      </div>

      {/* Skill focus */}
      <div className="flex flex-wrap gap-2 mb-6">
        {skillFocus.map((skill: string) => (
          <span
            key={skill}
            className="px-3 py-1.5 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 text-xs font-medium rounded-full"
          >
            {skill}
          </span>
        ))}
      </div>

      {/* Mastery Test CTA */}
      {allDone && goal.status === 'ACTIVE' && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800 mb-6">
          <h3 className="font-semibold text-green-800 dark:text-green-200 mb-2">Ready for Mastery Test!</h3>
          <p className="text-sm text-green-700 dark:text-green-300 mb-4">
            You have completed all lessons. Take the test to prove your mastery and earn bonus XP.
          </p>
          <Link
            href={`/goals/${goal.id}/test`}
            className="inline-flex items-center gap-2 py-2.5 px-6 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition-colors"
          >
            Take Mastery Test
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* Latest test result */}
      {latestTest && latestTest.score !== null && (
        <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-100 dark:border-gray-800 mb-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Latest Test Result</h3>
          <div className="flex items-center gap-4">
            <span className={`text-3xl font-bold ${latestTest.passed ? 'text-green-500' : 'text-red-500'}`}>
              {latestTest.score}%
            </span>
            <span className={`px-3 py-1 text-sm font-medium rounded-full ${
              latestTest.passed
                ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                : 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300'
            }`}>
              {latestTest.passed ? 'Passed' : 'Failed'}
            </span>
          </div>
        </div>
      )}

      {/* Lessons List */}
      {goal.assignedLessons.length > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-100 dark:border-gray-800">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Assigned Lessons</h3>
          <div className="space-y-2">
            {goal.assignedLessons.map((gl) => (
              <Link
                key={gl.id}
                href={`/lessons/${gl.lesson.id}`}
                className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                {gl.completedAt ? (
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                ) : (
                  <Circle className="w-5 h-5 text-gray-300 dark:text-gray-600 flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{gl.lesson.title}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Day {gl.dayNumber} &middot; {gl.lesson.type} &middot; {gl.lesson.estimatedMinutes} min
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Timeline */}
      {goal.dailyPlans.length > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-100 dark:border-gray-800 mt-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Timeline</h3>
          <div className="flex gap-2 flex-wrap">
            {goal.dailyPlans.map((plan) => (
              <div
                key={plan.id}
                className={`w-10 h-10 rounded-lg flex items-center justify-center text-xs font-medium ${
                  plan.isCompleted
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                    : plan.dayNumber <= daysElapsed
                      ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                }`}
              >
                D{plan.dayNumber}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
