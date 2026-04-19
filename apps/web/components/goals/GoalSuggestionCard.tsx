'use client';

import { GoalCycleData } from '@/types';
import { useAcceptGoal, useSkipGoal, useGenerateGoal } from '@/hooks/useGoals';
import { Target, Clock, Zap, RefreshCw } from 'lucide-react';

interface GoalSuggestionCardProps {
  goal: GoalCycleData | null;
}

export function GoalSuggestionCard({ goal }: GoalSuggestionCardProps) {
  const acceptGoal = useAcceptGoal();
  const skipGoal = useSkipGoal();
  const generateGoal = useGenerateGoal();

  if (!goal) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center">
            <Target className="w-5 h-5 text-primary-600 dark:text-primary-400" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Set a Learning Goal</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Get an AI-powered goal suggestion</p>
          </div>
        </div>
        <button
          onClick={() => generateGoal.mutate()}
          disabled={generateGoal.isPending}
          className="w-full py-2.5 px-4 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50"
        >
          {generateGoal.isPending ? 'Generating...' : 'Generate Goal'}
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center">
          <Target className="w-5 h-5 text-primary-600 dark:text-primary-400" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white">Suggested Goal</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">AI-powered recommendation</p>
        </div>
      </div>

      <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{goal.title}</h4>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{goal.description}</p>

      <div className="flex flex-wrap gap-2 mb-4">
        {goal.skillFocus.map((skill) => (
          <span
            key={skill}
            className="px-2.5 py-1 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 text-xs font-medium rounded-full"
          >
            {skill}
          </span>
        ))}
      </div>

      <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
        <span className="flex items-center gap-1">
          <Clock className="w-4 h-4" />
          {goal.durationDays} days
        </span>
        <span className="flex items-center gap-1">
          <Zap className="w-4 h-4" />
          {goal.xpMultiplier}x XP bonus
        </span>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => acceptGoal.mutate(goal.id)}
          disabled={acceptGoal.isPending}
          className="flex-1 py-2.5 px-4 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50"
        >
          {acceptGoal.isPending ? 'Starting...' : 'Accept Goal'}
        </button>
        <button
          onClick={() => skipGoal.mutate(goal.id)}
          disabled={skipGoal.isPending}
          className="py-2.5 px-4 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 rounded-xl font-medium transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50"
        >
          Skip
        </button>
        <button
          onClick={() => generateGoal.mutate()}
          disabled={generateGoal.isPending}
          className="py-2.5 px-3 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 rounded-xl transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50"
          title="Get new suggestion"
        >
          <RefreshCw className={`w-4 h-4 ${generateGoal.isPending ? 'animate-spin' : ''}`} />
        </button>
      </div>
    </div>
  );
}
