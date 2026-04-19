'use client';

import Link from 'next/link';
import { GoalCycleData } from '@/types';
import { Target, Clock, ChevronRight } from 'lucide-react';

interface ActiveGoalBannerProps {
  goal: GoalCycleData;
}

export function ActiveGoalBanner({ goal }: ActiveGoalBannerProps) {
  const { progress } = goal;

  return (
    <Link
      href={`/goals/${goal.id}`}
      className="block bg-gradient-to-r from-primary-50 to-purple-50 dark:from-primary-900/20 dark:to-purple-900/20 rounded-2xl p-4 border border-primary-100 dark:border-primary-800 hover:shadow-md transition-shadow"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-primary-600 dark:text-primary-400" />
          <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Active Goal</h3>
        </div>
        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
          <Clock className="w-3.5 h-3.5" />
          {progress.daysRemaining}d left
          <ChevronRight className="w-4 h-4" />
        </div>
      </div>

      <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">{goal.title}</p>

      <div className="flex items-center gap-3">
        <div className="flex-1 bg-white dark:bg-gray-800 rounded-full h-2">
          <div
            className="gradient-primary h-2 rounded-full transition-all duration-500"
            style={{ width: `${progress.percentComplete}%` }}
          />
        </div>
        <span className="text-xs font-medium text-primary-600 dark:text-primary-400">
          {progress.completedLessons}/{progress.totalLessons}
        </span>
      </div>
    </Link>
  );
}
