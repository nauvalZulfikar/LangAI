'use client';

import { CheckCircle, XCircle, Zap } from 'lucide-react';
import Link from 'next/link';

interface TestResultCardProps {
  score: number;
  passed: boolean;
  xpEarned: number;
  goalId: string;
  passThreshold: number;
}

export function TestResultCard({ score, passed, xpEarned, goalId, passThreshold }: TestResultCardProps) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 border border-gray-100 dark:border-gray-800 text-center">
      <div
        className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
          passed ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'
        }`}
      >
        {passed ? (
          <CheckCircle className="w-8 h-8 text-green-500" />
        ) : (
          <XCircle className="w-8 h-8 text-red-500" />
        )}
      </div>

      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
        {passed ? 'You Passed!' : 'Not Quite...'}
      </h2>

      <div className="text-4xl font-bold mb-2">
        <span className={passed ? 'text-green-500' : 'text-red-500'}>{score}%</span>
      </div>

      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        {passed
          ? 'Great job mastering this material!'
          : `You needed ${passThreshold}% to pass. Review the weak areas and try again.`}
      </p>

      {passed && xpEarned > 0 && (
        <div className="bg-primary-50 dark:bg-primary-900/20 rounded-xl p-4 mb-6">
          <div className="flex items-center justify-center gap-2">
            <Zap className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            <span className="text-xl font-bold text-primary-600 dark:text-primary-400">+{xpEarned} XP</span>
          </div>
        </div>
      )}

      <div className="flex gap-3 justify-center">
        {passed ? (
          <Link
            href="/goals"
            className="py-2.5 px-6 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-medium transition-colors"
          >
            Start Next Goal
          </Link>
        ) : (
          <>
            <Link
              href={`/goals/${goalId}`}
              className="py-2.5 px-6 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-medium transition-colors"
            >
              Review & Retry
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
