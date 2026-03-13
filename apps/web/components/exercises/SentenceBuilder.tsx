'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, RotateCcw } from 'lucide-react';
import { SentenceBuilderExercise } from '@/types';
import { shuffleArray } from '@/lib/utils';

interface SentenceBuilderProps {
  exercise: SentenceBuilderExercise;
  onAnswer: (isCorrect: boolean) => void;
}

export function SentenceBuilder({ exercise, onAnswer }: SentenceBuilderProps) {
  const [availableWords, setAvailableWords] = useState(() =>
    shuffleArray(exercise.words.map((w, i) => ({ id: i, word: w })))
  );
  const [builtSentence, setBuiltSentence] = useState<Array<{ id: number; word: string }>>([]);
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const addWord = (wordObj: { id: number; word: string }) => {
    if (submitted) return;
    setBuiltSentence((prev) => [...prev, wordObj]);
    setAvailableWords((prev) => prev.filter((w) => w.id !== wordObj.id));
  };

  const removeWord = (wordObj: { id: number; word: string }) => {
    if (submitted) return;
    setBuiltSentence((prev) => prev.filter((w) => w.id !== wordObj.id));
    setAvailableWords((prev) => [...prev, wordObj]);
  };

  const reset = () => {
    setAvailableWords(shuffleArray(exercise.words.map((w, i) => ({ id: i, word: w }))));
    setBuiltSentence([]);
    setSubmitted(false);
  };

  const handleSubmit = () => {
    const built = builtSentence.map((w) => w.word).join(' ');
    const correct = built === exercise.answer;
    setIsCorrect(correct);
    setSubmitted(true);
    setTimeout(() => onAnswer(correct), 1500);
  };

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Build the sentence</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Translation: <em>{exercise.translation}</em></p>
      </div>

      {/* Drop zone */}
      <div className="min-h-14 bg-gray-50 dark:bg-gray-700 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-600 p-3 flex flex-wrap gap-2 items-center">
        <AnimatePresence>
          {builtSentence.length === 0 ? (
            <p className="text-gray-400 dark:text-gray-500 text-sm w-full text-center">Tap words to build the sentence</p>
          ) : (
            builtSentence.map((wordObj) => (
              <motion.button
                key={wordObj.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={() => removeWord(wordObj)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  submitted
                    ? isCorrect
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                      : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                    : 'gradient-primary text-white hover:opacity-90'
                }`}
              >
                {wordObj.word}
              </motion.button>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Available words */}
      <div className="flex flex-wrap gap-2">
        <AnimatePresence>
          {availableWords.map((wordObj) => (
            <motion.button
              key={wordObj.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={() => addWord(wordObj)}
              className="px-3 py-1.5 rounded-lg text-sm font-medium bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all"
            >
              {wordObj.word}
            </motion.button>
          ))}
        </AnimatePresence>
      </div>

      {submitted && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className={`flex items-start gap-3 rounded-xl p-4 ${
            isCorrect
              ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
              : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
          }`}
        >
          {isCorrect ? (
            <CheckCircle2 className="w-5 h-5 text-success-DEFAULT flex-shrink-0" />
          ) : (
            <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          )}
          <div>
            <p className={`text-sm font-semibold ${isCorrect ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>
              {isCorrect ? 'Perfect!' : 'Not quite right'}
            </p>
            {!isCorrect && (
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                Correct: <strong>{exercise.answer}</strong>
              </p>
            )}
          </div>
        </motion.div>
      )}

      {!submitted && (
        <div className="flex items-center gap-3">
          <button
            onClick={reset}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          >
            <RotateCcw className="w-4 h-4" /> Reset
          </button>
          <button
            onClick={handleSubmit}
            disabled={builtSentence.length === 0}
            className="ml-auto gradient-primary text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:opacity-90 disabled:opacity-40 transition-opacity"
          >
            Check
          </button>
        </div>
      )}
    </div>
  );
}
