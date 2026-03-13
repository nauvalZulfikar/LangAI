'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { WritingPromptExercise } from '@/types';

interface WritingPromptProps {
  exercise: WritingPromptExercise;
  onAnswer: (isCorrect: boolean) => void;
}

export function WritingPrompt({ exercise, onAnswer }: WritingPromptProps) {
  const [text, setText] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [feedback, setFeedback] = useState<{ score: number; comment: string } | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [showSample, setShowSample] = useState(false);

  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;

  const handleSubmit = async () => {
    if (!text.trim() || submitted) return;
    setSubmitted(true);
    setIsEvaluating(true);
    try {
      const res = await fetch('/api/ai/writing/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, prompt: exercise.prompt }),
      });
      if (res.ok) {
        const data = await res.json();
        setFeedback({ score: data.overallScore, comment: data.suggestions?.[0] ?? 'Good effort!' });
      }
    } catch {
      setFeedback({ score: 70, comment: 'Answer submitted successfully.' });
    } finally {
      setIsEvaluating(false);
      setTimeout(() => onAnswer(true), 3000);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Writing Exercise</h3>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Write in Spanish</p>
      </div>

      <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-100 dark:border-primary-800 rounded-xl p-4">
        <p className="text-gray-800 dark:text-gray-200 font-medium">{exercise.prompt}</p>
      </div>

      <div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={submitted}
          placeholder="Escribe tu respuesta aquí... (Write your answer here in Spanish)"
          rows={5}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none transition disabled:opacity-60"
        />
        <div className="flex justify-between mt-1 text-xs text-gray-400">
          <span>{wordCount} words</span>
          <span>Aim for at least 30 words</span>
        </div>
      </div>

      {!submitted ? (
        <button
          onClick={handleSubmit}
          disabled={wordCount < 5}
          className="w-full gradient-primary text-white py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity disabled:opacity-40"
        >
          Submit for AI Feedback
        </button>
      ) : isEvaluating ? (
        <div className="text-center py-4">
          <div className="inline-flex items-center gap-2 text-primary-500">
            <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm font-medium">AI is evaluating your writing...</span>
          </div>
        </div>
      ) : feedback ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 p-4 space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="font-semibold text-gray-900 dark:text-white">AI Feedback</span>
            <div className={`text-lg font-bold ${feedback.score >= 70 ? 'text-success-DEFAULT' : 'text-warning-DEFAULT'}`}>
              {feedback.score}/100
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">{feedback.comment}</p>
        </motion.div>
      ) : null}

      <div className="border-t border-gray-100 dark:border-gray-700 pt-3">
        <button
          onClick={() => setShowSample(!showSample)}
          className="text-sm text-gray-400 hover:text-primary-500 transition-colors"
        >
          {showSample ? 'Hide sample answer' : 'Show sample answer'}
        </button>
        {showSample && (
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 italic bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
            {exercise.sampleAnswer}
          </p>
        )}
      </div>
    </div>
  );
}
