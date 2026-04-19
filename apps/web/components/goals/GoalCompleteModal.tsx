'use client';

import { useGoalStore } from '@/stores/goalStore';
import { Trophy, Zap, X } from 'lucide-react';
import Link from 'next/link';

interface GoalCompleteModalProps {
  xpEarned: number;
  goalTitle: string;
  score: number;
}

export function GoalCompleteModal({ xpEarned, goalTitle, score }: GoalCompleteModalProps) {
  const { showGoalCompleteModal, setShowGoalCompleteModal } = useGoalStore();

  if (!showGoalCompleteModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 max-w-md w-full text-center relative">
        <button
          onClick={() => setShowGoalCompleteModal(false)}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-16 h-16 mx-auto mb-4 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center">
          <Trophy className="w-8 h-8 text-yellow-500" />
        </div>

        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Goal Complete!</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-2">{goalTitle}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Score: {score}%</p>

        <div className="bg-primary-50 dark:bg-primary-900/20 rounded-xl p-4 mb-6">
          <div className="flex items-center justify-center gap-2">
            <Zap className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">+{xpEarned} XP</span>
          </div>
        </div>

        <div className="flex gap-3">
          <Link
            href="/goals"
            onClick={() => setShowGoalCompleteModal(false)}
            className="flex-1 py-2.5 px-4 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-medium transition-colors text-center"
          >
            Start Next Goal
          </Link>
          <button
            onClick={() => setShowGoalCompleteModal(false)}
            className="py-2.5 px-4 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 rounded-xl font-medium transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
