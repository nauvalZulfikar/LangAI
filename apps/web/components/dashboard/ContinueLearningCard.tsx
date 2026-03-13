'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ChevronRight, BookOpen, Clock } from 'lucide-react';
import { CEFRLevel, LessonType } from '@/types';

interface ContinueLearningCardProps {
  lesson: {
    id: string;
    title: string;
    description: string;
    level: CEFRLevel;
    type: LessonType;
    estimatedMinutes: number;
    xpReward: number;
  } | null;
}

const lessonTypeColors: Record<LessonType, string> = {
  VOCABULARY: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
  GRAMMAR: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
  LISTENING: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
  SPEAKING: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
  READING: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400',
  WRITING: 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400',
};

export function ContinueLearningCard({ lesson }: ContinueLearningCardProps) {
  if (!lesson) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Continue Learning</h3>
        <p className="text-gray-500 dark:text-gray-400 text-sm">No lessons in progress. Start a new lesson!</p>
        <Link
          href="/lessons"
          className="inline-flex items-center gap-2 mt-3 text-primary-500 font-medium text-sm hover:text-primary-600"
        >
          Browse lessons <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700"
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-900 dark:text-white">Continue Learning</h3>
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${lessonTypeColors[lesson.type]}`}>
          {lesson.type.charAt(0) + lesson.type.slice(1).toLowerCase()}
        </span>
      </div>

      <div className="mb-4">
        <h4 className="font-bold text-gray-900 dark:text-white text-lg">{lesson.title}</h4>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 line-clamp-2">{lesson.description}</p>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {lesson.estimatedMinutes} min
          </div>
          <div className="flex items-center gap-1">
            <span className="text-yellow-500">⚡</span>
            {lesson.xpReward} XP
          </div>
          <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-full text-xs font-medium">
            {lesson.level}
          </span>
        </div>

        <Link
          href={`/lessons/${lesson.id}`}
          className="flex items-center gap-1 gradient-primary text-white px-4 py-2 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          Continue <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    </motion.div>
  );
}
