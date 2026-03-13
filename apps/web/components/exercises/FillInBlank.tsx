'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, Lightbulb } from 'lucide-react';
import { FillBlankExercise } from '@/types';

interface FillInBlankProps {
  exercise: FillBlankExercise;
  onAnswer: (isCorrect: boolean) => void;
}

export function FillInBlank({ exercise, onAnswer }: FillInBlankProps) {
  const [input, setInput] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const isCorrect = input.trim().toLowerCase() === exercise.answer.toLowerCase();

  const parts = exercise.sentence.split('_____');

  const handleSubmit = () => {
    if (!input.trim() || submitted) return;
    setSubmitted(true);
    setTimeout(() => onAnswer(isCorrect), 1500);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSubmit();
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Fill in the blank</h3>

      <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6 text-lg text-gray-800 dark:text-gray-200 leading-relaxed text-center">
        {parts[0]}
        {submitted ? (
          <span
            className={`inline-block mx-1 px-3 py-0.5 rounded-lg font-bold border-b-2 ${
              isCorrect
                ? 'text-green-600 dark:text-green-400 border-green-400 bg-green-50 dark:bg-green-900/30'
                : 'text-red-600 dark:text-red-400 border-red-400 bg-red-50 dark:bg-red-900/30'
            }`}
          >
            {input}
          </span>
        ) : (
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
            className="inline-block w-32 mx-1 border-b-2 border-primary-400 bg-transparent text-primary-600 dark:text-primary-400 font-bold text-center focus:outline-none placeholder-gray-300 dark:placeholder-gray-500"
            placeholder="___"
          />
        )}
        {parts[1]}
      </div>

      {submitted && !isCorrect && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4"
        >
          <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-700 dark:text-red-300">Incorrect</p>
            <p className="text-sm text-red-600 dark:text-red-400">
              The correct answer is: <strong>{exercise.answer}</strong>
            </p>
          </div>
        </motion.div>
      )}

      {submitted && isCorrect && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4"
        >
          <CheckCircle2 className="w-5 h-5 text-success-DEFAULT" />
          <p className="text-sm font-semibold text-green-700 dark:text-green-300">Correct! Well done!</p>
        </motion.div>
      )}

      <div className="flex items-center gap-3">
        {exercise.hint && !submitted && (
          <button
            onClick={() => setShowHint(!showHint)}
            className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-primary-500 transition-colors"
          >
            <Lightbulb className="w-4 h-4" /> {showHint ? 'Hide hint' : 'Show hint'}
          </button>
        )}
        {!submitted && (
          <button
            onClick={handleSubmit}
            disabled={!input.trim()}
            className="ml-auto gradient-primary text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-40"
          >
            Check Answer
          </button>
        )}
      </div>

      {showHint && exercise.hint && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-3 text-sm text-yellow-700 dark:text-yellow-300"
        >
          💡 Hint: {exercise.hint}
        </motion.div>
      )}
    </div>
  );
}
