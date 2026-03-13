'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle } from 'lucide-react';
import { MultipleChoiceExercise } from '@/types';

interface MultipleChoiceProps {
  exercise: MultipleChoiceExercise;
  onAnswer: (isCorrect: boolean) => void;
}

export function MultipleChoice({ exercise, onAnswer }: MultipleChoiceProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);

  const handleSelect = (index: number) => {
    if (answered) return;
    setSelected(index);
    setAnswered(true);
    const isCorrect = index === exercise.correctIndex;
    setTimeout(() => onAnswer(isCorrect), 1200);
  };

  const getOptionStyle = (index: number) => {
    if (!answered) {
      return 'border-gray-200 dark:border-gray-600 hover:border-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20';
    }
    if (index === exercise.correctIndex) {
      return 'border-success-DEFAULT bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300';
    }
    if (index === selected && index !== exercise.correctIndex) {
      return 'border-red-400 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300';
    }
    return 'border-gray-200 dark:border-gray-600 opacity-50';
  };

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{exercise.question}</h3>

      <div className="space-y-3">
        {exercise.options.map((option, i) => (
          <motion.button
            key={i}
            whileHover={!answered ? { scale: 1.01 } : {}}
            whileTap={!answered ? { scale: 0.99 } : {}}
            onClick={() => handleSelect(i)}
            className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center justify-between gap-3 ${getOptionStyle(i)}`}
          >
            <div className="flex items-center gap-3">
              <span className="w-7 h-7 rounded-full border-2 border-current flex items-center justify-center text-xs font-bold flex-shrink-0">
                {String.fromCharCode(65 + i)}
              </span>
              <span className="font-medium">{option}</span>
            </div>
            {answered && i === exercise.correctIndex && (
              <CheckCircle2 className="w-5 h-5 text-success-DEFAULT flex-shrink-0" />
            )}
            {answered && i === selected && i !== exercise.correctIndex && (
              <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            )}
          </motion.button>
        ))}
      </div>

      {answered && exercise.explanation && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4"
        >
          <p className="text-sm text-blue-700 dark:text-blue-300">
            <span className="font-bold">💡 Explanation: </span>
            {exercise.explanation}
          </p>
        </motion.div>
      )}
    </div>
  );
}
