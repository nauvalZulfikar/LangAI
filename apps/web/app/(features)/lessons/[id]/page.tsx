'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, Star, Zap } from 'lucide-react';
import { MultipleChoice } from '@/components/exercises/MultipleChoice';
import { FillInBlank } from '@/components/exercises/FillInBlank';
import { WordMatch } from '@/components/exercises/WordMatch';
import { SentenceBuilder } from '@/components/exercises/SentenceBuilder';
import { SpeakingPrompt } from '@/components/exercises/SpeakingPrompt';
import { ReadingPassage } from '@/components/exercises/ReadingPassage';
import { WritingPrompt } from '@/components/exercises/WritingPrompt';
import { ListeningComprehension } from '@/components/exercises/ListeningComprehension';
import { Exercise, LessonWithProgress } from '@/types';
import { getStarRating } from '@/lib/xp';

export default function LessonPlayerPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [lesson, setLesson] = useState<LessonWithProgress | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [totalAnswers, setTotalAnswers] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [earnedXP, setEarnedXP] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`/api/lessons/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setLesson(data);
        setIsLoading(false);
      })
      .catch(() => {
        setError('Failed to load lesson');
        setIsLoading(false);
      });
  }, [id]);

  const handleAnswer = (isCorrect: boolean) => {
    const newCorrect = correctAnswers + (isCorrect ? 1 : 0);
    const newTotal = totalAnswers + 1;
    setCorrectAnswers(newCorrect);
    setTotalAnswers(newTotal);

    const exercises = lesson?.content.exercises ?? [];
    if (currentIndex >= exercises.length - 1) {
      const score = Math.round((newCorrect / exercises.length) * 100);
      completelesson(score, newCorrect, exercises.length);
    } else {
      setTimeout(() => setCurrentIndex((i) => i + 1), 500);
    }
  };

  const completelesson = async (score: number, correct: number, total: number) => {
    try {
      const res = await fetch(`/api/lessons/${id}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ score, correct, total }),
      });
      const data = await res.json();
      setEarnedXP(data.xpEarned ?? 0);
    } catch {
      setEarnedXP(lesson?.xpReward ?? 0);
    }
    setIsCompleted(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  if (error || !lesson) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-gray-500 dark:text-gray-400">{error || 'Lesson not found'}</p>
        <button onClick={() => router.push('/lessons')} className="gradient-primary text-white px-6 py-2.5 rounded-xl font-semibold">
          Back to Lessons
        </button>
      </div>
    );
  }

  const exercises = lesson.content.exercises;
  const progress = exercises.length > 0 ? ((currentIndex) / exercises.length) * 100 : 0;
  const score = totalAnswers > 0 ? Math.round((correctAnswers / totalAnswers) * 100) : 0;
  const stars = getStarRating(score);

  if (isCompleted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 p-8 text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
            className="text-6xl mb-4"
          >
            {score >= 90 ? '🏆' : score >= 70 ? '🎉' : '💪'}
          </motion.div>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Lesson Complete!</h2>

          <div className="flex items-center justify-center gap-1 mb-4">
            {[1, 2, 3].map((star) => (
              <Star
                key={star}
                className={`w-8 h-8 ${star <= stars ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 dark:text-gray-600'}`}
              />
            ))}
          </div>

          <div className="grid grid-cols-3 gap-4 bg-gray-50 dark:bg-gray-700 rounded-2xl p-4 mb-6">
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{score}%</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Score</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{correctAnswers}/{exercises.length}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Correct</div>
            </div>
            <div>
              <div className="flex items-center justify-center gap-1 text-2xl font-bold text-primary-500">
                <Zap className="w-5 h-5" />
                {earnedXP}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">XP Earned</div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => router.push('/lessons')}
              className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-3 rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              All Lessons
            </button>
            <button
              onClick={() => {
                setCurrentIndex(0);
                setCorrectAnswers(0);
                setTotalAnswers(0);
                setIsCompleted(false);
              }}
              className="flex-1 gradient-primary text-white py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity"
            >
              Try Again
            </button>
          </div>

          <button
            onClick={() => router.push('/dashboard')}
            className="mt-3 flex items-center justify-center gap-1 text-sm text-gray-400 hover:text-primary-500 transition-colors w-full"
          >
            Back to Dashboard <ChevronRight className="w-4 h-4" />
          </button>
        </motion.div>
      </div>
    );
  }

  const exercise = exercises[currentIndex];

  const renderExercise = (ex: Exercise) => {
    switch (ex.type) {
      case 'multiple_choice':
        return <MultipleChoice key={currentIndex} exercise={ex} onAnswer={handleAnswer} />;
      case 'fill_blank':
        return <FillInBlank key={currentIndex} exercise={ex} onAnswer={handleAnswer} />;
      case 'word_match':
        return <WordMatch key={currentIndex} exercise={ex} onAnswer={handleAnswer} />;
      case 'sentence_builder':
        return <SentenceBuilder key={currentIndex} exercise={ex} onAnswer={handleAnswer} />;
      case 'speaking_prompt':
        return <SpeakingPrompt key={currentIndex} exercise={ex} onAnswer={handleAnswer} />;
      case 'reading_passage':
        return <ReadingPassage key={currentIndex} exercise={ex} onAnswer={handleAnswer} />;
      case 'writing_prompt':
        return <WritingPrompt key={currentIndex} exercise={ex} onAnswer={handleAnswer} />;
      case 'listening_comprehension':
        return <ListeningComprehension key={currentIndex} exercise={ex} onAnswer={handleAnswer} />;
      default:
        return (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">Unknown exercise type</p>
            <button onClick={() => handleAnswer(true)} className="mt-4 gradient-primary text-white px-6 py-2.5 rounded-xl">
              Skip
            </button>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          <button
            onClick={() => router.push('/lessons')}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>

          <div className="flex-1">
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
              <span>{lesson.title}</span>
              <span>{currentIndex + 1}/{exercises.length}</span>
            </div>
            <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2">
              <motion.div
                className="gradient-primary h-2 rounded-full"
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          <div className="flex items-center gap-1 text-sm font-bold text-primary-500">
            <Zap className="w-4 h-4" />
            {lesson.xpReward}
          </div>
        </div>
      </div>

      {/* Exercise */}
      <div className="flex-1 flex items-start justify-center px-4 py-8">
        <div className="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 md:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.25 }}
            >
              {renderExercise(exercise)}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
