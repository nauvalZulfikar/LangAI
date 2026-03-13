'use client';

import { cn } from '@/lib/utils';
import { CEFRLevel } from '@/types';

interface CEFRLevelBadgeProps {
  level: CEFRLevel;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const levelColors: Record<CEFRLevel, string> = {
  A1: 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800',
  A2: 'bg-teal-100 text-teal-700 border-teal-200 dark:bg-teal-900/30 dark:text-teal-400 dark:border-teal-800',
  B1: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800',
  B2: 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800',
  C1: 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800',
  C2: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',
};

const levelDescriptions: Record<CEFRLevel, string> = {
  A1: 'Beginner',
  A2: 'Elementary',
  B1: 'Intermediate',
  B2: 'Upper Intermediate',
  C1: 'Advanced',
  C2: 'Mastery',
};

const sizeClasses = {
  sm: 'text-xs px-1.5 py-0.5',
  md: 'text-sm px-2.5 py-1',
  lg: 'text-base px-3 py-1.5',
};

export function CEFRLevelBadge({ level, size = 'md', className }: CEFRLevelBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border font-bold',
        levelColors[level],
        sizeClasses[size],
        className
      )}
      title={levelDescriptions[level]}
    >
      {level}
    </span>
  );
}

export function CEFRLevelCard({ level }: { level: CEFRLevel }) {
  return (
    <div className={cn('rounded-2xl p-4 border', levelColors[level])}>
      <div className="text-2xl font-extrabold">{level}</div>
      <div className="font-semibold">{levelDescriptions[level]}</div>
    </div>
  );
}
