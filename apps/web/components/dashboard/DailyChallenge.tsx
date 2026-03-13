'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Zap, ChevronRight, CheckCircle2 } from 'lucide-react';

interface DailyChallengeProps {
  challenge: {
    id: string;
    type: string;
    xpReward: number;
    content: Record<string, unknown>;
    completed: boolean;
  } | null;
}

export function DailyChallenge({ challenge }: DailyChallengeProps) {
  if (!challenge) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Daily Challenge</h3>
        <p className="text-gray-500 dark:text-gray-400 text-sm">No challenge available today. Check back tomorrow!</p>
      </div>
    );
  }

  if (challenge.completed) {
    return (
      <div className="bg-gradient-to-r from-success-DEFAULT/10 to-emerald-100 dark:from-success-DEFAULT/10 dark:to-emerald-900/20 rounded-2xl p-5 border border-success-DEFAULT/30">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="w-8 h-8 text-success-DEFAULT flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Daily Challenge Complete!</h3>
            <p className="text-success-DEFAULT text-sm font-medium">+{challenge.xpReward} XP earned today</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="bg-gradient-to-r from-warning-DEFAULT to-amber-400 rounded-2xl p-5 text-white shadow-lg"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🎯</span>
          <h3 className="font-bold">Daily Challenge</h3>
        </div>
        <div className="flex items-center gap-1 bg-white/20 px-3 py-1 rounded-full text-sm font-bold">
          <Zap className="w-4 h-4" />
          +{challenge.xpReward} XP
        </div>
      </div>

      <p className="text-amber-50 text-sm mb-4">
        {(challenge.content.title as string) ?? 'Complete today\'s vocabulary challenge!'}
      </p>

      <Link
        href={`/daily-challenge`}
        className="inline-flex items-center gap-2 bg-white text-amber-600 px-4 py-2 rounded-xl text-sm font-bold hover:bg-amber-50 transition-colors"
      >
        Start Challenge <ChevronRight className="w-4 h-4" />
      </Link>
    </motion.div>
  );
}
