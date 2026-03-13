'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { shuffleArray } from '@/lib/utils';
import { WordMatchExercise } from '@/types';

interface WordMatchProps {
  exercise: WordMatchExercise;
  onAnswer: (isCorrect: boolean) => void;
}

export function WordMatch({ exercise, onAnswer }: WordMatchProps) {
  const [leftItems] = useState(() => exercise.pairs.map((p) => p.left));
  const [rightItems] = useState(() => shuffleArray(exercise.pairs.map((p) => p.right)));
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [selectedRight, setSelectedRight] = useState<string | null>(null);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [incorrect, setIncorrect] = useState<string | null>(null);

  const pairMap = Object.fromEntries(exercise.pairs.map((p) => [p.left, p.right]));

  const handleLeftClick = (item: string) => {
    if (matched.has(item)) return;
    setSelectedLeft(item);
    if (selectedRight) checkMatch(item, selectedRight);
  };

  const handleRightClick = (item: string) => {
    if (matched.has(item)) return;
    setSelectedRight(item);
    if (selectedLeft) checkMatch(selectedLeft, item);
  };

  const checkMatch = (left: string, right: string) => {
    if (pairMap[left] === right) {
      const newMatched = new Set(Array.from(matched).concat([left, right]));
      setMatched(newMatched);
      setSelectedLeft(null);
      setSelectedRight(null);
      if (newMatched.size === exercise.pairs.length * 2) {
        setTimeout(() => onAnswer(true), 500);
      }
    } else {
      setIncorrect(left);
      setTimeout(() => {
        setSelectedLeft(null);
        setSelectedRight(null);
        setIncorrect(null);
      }, 800);
    }
  };

  const getLeftStyle = (item: string) => {
    if (matched.has(item)) return 'bg-green-100 dark:bg-green-900/30 border-success-DEFAULT text-green-700 dark:text-green-300 opacity-60';
    if (incorrect === item) return 'bg-red-100 dark:bg-red-900/30 border-red-400 text-red-700 dark:text-red-300 animate-pulse';
    if (selectedLeft === item) return 'bg-primary-50 dark:bg-primary-900/30 border-primary-500 text-primary-700 dark:text-primary-300';
    return 'border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20';
  };

  const getRightStyle = (item: string) => {
    if (matched.has(item)) return 'bg-green-100 dark:bg-green-900/30 border-success-DEFAULT text-green-700 dark:text-green-300 opacity-60';
    if (selectedRight === item) return 'bg-primary-50 dark:bg-primary-900/30 border-primary-500 text-primary-700 dark:text-primary-300';
    return 'border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20';
  };

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Match the pairs</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Matched: {matched.size / 2} / {exercise.pairs.length}
      </p>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          {leftItems.map((item) => (
            <motion.button
              key={item}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleLeftClick(item)}
              className={`w-full text-left p-3 rounded-xl border-2 text-sm font-medium transition-all ${getLeftStyle(item)}`}
            >
              {item}
            </motion.button>
          ))}
        </div>
        <div className="space-y-2">
          {rightItems.map((item) => (
            <motion.button
              key={item}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleRightClick(item)}
              className={`w-full text-left p-3 rounded-xl border-2 text-sm font-medium transition-all ${getRightStyle(item)}`}
            >
              {item}
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}
