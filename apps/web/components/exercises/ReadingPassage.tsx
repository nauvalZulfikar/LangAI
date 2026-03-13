'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle } from 'lucide-react';
import { ReadingPassageExercise } from '@/types';

interface ReadingPassageProps {
  exercise: ReadingPassageExercise;
  onAnswer: (isCorrect: boolean) => void;
}

export function ReadingPassage({ exercise, onAnswer }: ReadingPassageProps) {
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [qAnswered, setQAnswered] = useState(false);

  const question = exercise.questions[currentQ];

  const handleAnswer = (index: number) => {
    if (qAnswered) return;
    const newAnswers = { ...answers, [currentQ]: index };
    setAnswers(newAnswers);
    setQAnswered(true);

    if (currentQ >= exercise.questions.length - 1) {
      const correct = Object.entries(newAnswers).filter(
        ([qi, ai]) => exercise.questions[Number(qi)].correctIndex === ai
      ).length;
      setTimeout(() => onAnswer(correct === exercise.questions.length), 1500);
    } else {
      setTimeout(() => {
        setCurrentQ((q) => q + 1);
        setQAnswered(false);
      }, 1200);
    }
  };

  const isCorrect = qAnswered && answers[currentQ] === question.correctIndex;

  return (
    <div className="space-y-5">
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Reading Comprehension</h3>

      {/* Passage */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-5 max-h-48 overflow-y-auto">
        <h4 className="font-bold text-gray-900 dark:text-white mb-3">{exercise.title}</h4>
        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">{exercise.text}</p>
      </div>

      {/* Question */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Question {currentQ + 1} of {exercise.questions.length}
          </span>
        </div>
        <p className="font-semibold text-gray-900 dark:text-white mb-4">{question.question}</p>

        <div className="space-y-2">
          {question.options.map((opt, i) => {
            const isSelected = answers[currentQ] === i;
            const isCorrectOption = i === question.correctIndex;
            let optionStyle = 'border-gray-200 dark:border-gray-600 hover:border-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20';
            if (qAnswered) {
              if (isCorrectOption) optionStyle = 'border-success-DEFAULT bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300';
              else if (isSelected) optionStyle = 'border-red-400 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300';
              else optionStyle = 'border-gray-200 dark:border-gray-600 opacity-50';
            }

            return (
              <motion.button
                key={i}
                whileTap={!qAnswered ? { scale: 0.99 } : {}}
                onClick={() => handleAnswer(i)}
                className={`w-full text-left p-3.5 rounded-xl border-2 flex items-center justify-between gap-2 text-sm font-medium transition-all ${optionStyle}`}
              >
                <span>{opt}</span>
                {qAnswered && isCorrectOption && <CheckCircle2 className="w-4 h-4 text-success-DEFAULT flex-shrink-0" />}
                {qAnswered && isSelected && !isCorrectOption && <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />}
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
