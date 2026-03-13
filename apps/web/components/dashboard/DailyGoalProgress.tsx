'use client';

import { motion } from 'framer-motion';
import { Target } from 'lucide-react';

interface DailyGoalProgressProps {
  minutesCompleted: number;
  dailyGoalMinutes: number;
}

export function DailyGoalProgress({ minutesCompleted, dailyGoalMinutes }: DailyGoalProgressProps) {
  const percentage = Math.min(100, Math.round((minutesCompleted / dailyGoalMinutes) * 100));
  const isCompleted = percentage >= 100;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Target className={`w-5 h-5 ${isCompleted ? 'text-success-DEFAULT' : 'text-primary-500'}`} />
          <h3 className="font-semibold text-gray-900 dark:text-white">Daily Goal</h3>
        </div>
        <span className={`text-sm font-bold ${isCompleted ? 'text-success-DEFAULT' : 'text-primary-500'}`}>
          {minutesCompleted}/{dailyGoalMinutes} min
        </span>
      </div>

      <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className={`h-3 rounded-full ${isCompleted ? 'bg-success-DEFAULT' : 'gradient-primary'}`}
        />
      </div>

      {isCompleted ? (
        <p className="text-success-DEFAULT text-sm font-medium mt-2">🎉 Daily goal completed!</p>
      ) : (
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
          {dailyGoalMinutes - minutesCompleted} min remaining
        </p>
      )}
    </div>
  );
}
