'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

interface Badge {
  id: string;
  title: string;
  icon: string;
  unlockedAt: Date;
}

interface RecentBadgesProps {
  badges: Badge[];
}

export function RecentBadges({ badges }: RecentBadgesProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900 dark:text-white">Recent Badges</h3>
        <Link href="/progress" className="text-sm text-primary-500 hover:text-primary-600 font-medium">
          View all
        </Link>
      </div>

      {badges.length === 0 ? (
        <div className="text-center py-6">
          <div className="text-4xl mb-2">🏅</div>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Complete lessons to earn badges!</p>
        </div>
      ) : (
        <div className="flex gap-3 overflow-x-auto scrollbar-hide">
          {badges.map((badge, i) => (
            <motion.div
              key={badge.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className="flex flex-col items-center gap-1 flex-shrink-0"
            >
              <div className="w-14 h-14 bg-gradient-to-br from-yellow-100 to-amber-100 dark:from-yellow-900/30 dark:to-amber-900/30 rounded-2xl flex items-center justify-center text-2xl shadow-sm border border-yellow-200 dark:border-yellow-800">
                {badge.icon}
              </div>
              <span className="text-xs text-gray-600 dark:text-gray-400 text-center max-w-14 leading-tight font-medium">
                {badge.title}
              </span>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
