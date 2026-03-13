'use client';

import { motion } from 'framer-motion';
import { Flame } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StreakBadgeProps {
  streak: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function StreakBadge({ streak, size = 'md', className }: StreakBadgeProps) {
  const sizeClasses = {
    sm: 'text-xs px-2 py-1 gap-1',
    md: 'text-sm px-3 py-1.5 gap-1.5',
    lg: 'text-base px-4 py-2 gap-2',
  };

  const iconSizes = { sm: 'w-3 h-3', md: 'w-4 h-4', lg: 'w-5 h-5' };

  if (streak === 0) return null;

  return (
    <motion.div
      animate={streak >= 7 ? { scale: [1, 1.05, 1] } : {}}
      transition={{ repeat: Infinity, duration: 2 }}
      className={cn(
        'inline-flex items-center rounded-full font-bold bg-gradient-to-r from-orange-400 to-red-400 text-white shadow-sm',
        sizeClasses[size],
        className
      )}
    >
      <Flame className={iconSizes[size]} />
      <span>{streak}</span>
    </motion.div>
  );
}
