'use client';

import Link from 'next/link';
import { GoalDailyPlanData } from '@/types';
import { BookOpen, CheckCircle, Circle, Info } from 'lucide-react';
import { useState } from 'react';

interface DailyPlanCardProps {
  plan: GoalDailyPlanData;
}

export function DailyPlanCard({ plan }: DailyPlanCardProps) {
  const [showRationale, setShowRationale] = useState(false);

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-primary-600 dark:text-primary-400" />
          <h3 className="font-semibold text-gray-900 dark:text-white">Day {plan.dayNumber} Plan</h3>
        </div>
        <button
          onClick={() => setShowRationale(!showRationale)}
          className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          title="Why these lessons?"
        >
          <Info className="w-4 h-4" />
        </button>
      </div>

      {showRationale && (
        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-sm text-blue-700 dark:text-blue-300">
          {plan.rationale}
        </div>
      )}

      <div className="space-y-3">
        {plan.lessons.map((lesson) => (
          <Link
            key={lesson.id}
            href={`/lessons/${lesson.id}`}
            className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            {lesson.completed ? (
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
            ) : (
              <Circle className="w-5 h-5 text-gray-300 dark:text-gray-600 flex-shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{lesson.title}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {lesson.type} &middot; {lesson.estimatedMinutes} min
              </p>
            </div>
          </Link>
        ))}
      </div>

      {plan.isCompleted && (
        <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-xl text-sm text-green-700 dark:text-green-300 text-center font-medium">
          All done for today!
        </div>
      )}
    </div>
  );
}
