'use client';

import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  xpReward: number;
  unlocked: boolean;
  unlockedAt?: Date | null;
}

interface AchievementGridProps {
  achievements: Achievement[];
  showLocked?: boolean;
}

export function AchievementGrid({ achievements, showLocked = true }: AchievementGridProps) {
  const filtered = showLocked ? achievements : achievements.filter((a) => a.unlocked);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
      {filtered.map((achievement, i) => (
        <motion.div
          key={achievement.id}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.05 }}
          className={cn(
            'relative p-4 rounded-2xl border text-center transition-all',
            achievement.unlocked
              ? 'bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 border-yellow-200 dark:border-yellow-800 hover:shadow-md'
              : 'bg-gray-50 dark:bg-gray-800 border-gray-100 dark:border-gray-700 opacity-50'
          )}
        >
          <div className={cn('text-3xl mb-2', !achievement.unlocked && 'grayscale')}>
            {achievement.unlocked ? achievement.icon : '🔒'}
          </div>
          <div className="font-semibold text-xs text-gray-900 dark:text-white leading-tight">{achievement.title}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-tight">{achievement.description}</div>
          <div className="text-xs font-bold text-primary-500 mt-1">+{achievement.xpReward} XP</div>
          {achievement.unlocked && achievement.unlockedAt && (
            <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              {format(new Date(achievement.unlockedAt), 'MMM d')}
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
}
