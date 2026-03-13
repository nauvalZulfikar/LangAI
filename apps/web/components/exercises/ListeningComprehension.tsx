'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, Volume2, CheckCircle2, XCircle } from 'lucide-react';
import { ListeningExercise } from '@/types';

interface ListeningComprehensionProps {
  exercise: ListeningExercise;
  onAnswer: (isCorrect: boolean) => void;
}

export function ListeningComprehension({ exercise, onAnswer }: ListeningComprehensionProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasListened, setHasListened] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);

  const playAudio = () => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(exercise.transcript);
      utterance.lang = 'es-ES';
      utterance.rate = 0.85;
      utterance.onstart = () => setIsPlaying(true);
      utterance.onend = () => {
        setIsPlaying(false);
        setHasListened(true);
      };
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleAnswer = (index: number) => {
    if (answered || !hasListened) return;
    setSelected(index);
    setAnswered(true);
    setTimeout(() => onAnswer(index === exercise.correctIndex), 1200);
  };

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Listening Comprehension</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Listen carefully and answer the question</p>
      </div>

      {/* Audio player */}
      <div className="bg-gradient-to-r from-primary-50 to-purple-50 dark:from-primary-900/20 dark:to-purple-900/20 rounded-xl p-5 flex flex-col items-center gap-4">
        <Volume2 className="w-10 h-10 text-primary-400" />
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={playAudio}
          disabled={isPlaying}
          className={`flex items-center gap-3 px-6 py-3 rounded-full text-white font-semibold transition-all ${
            isPlaying ? 'bg-gray-400 cursor-not-allowed' : 'gradient-primary hover:opacity-90'
          }`}
        >
          {isPlaying ? (
            <>
              <Pause className="w-5 h-5" /> Playing...
            </>
          ) : (
            <>
              <Play className="w-5 h-5" /> {hasListened ? 'Play Again' : 'Play Audio'}
            </>
          )}
        </motion.button>
        {!hasListened && (
          <p className="text-xs text-gray-500 dark:text-gray-400">Listen before answering</p>
        )}
      </div>

      {/* Transcript toggle */}
      <button
        onClick={() => setShowTranscript(!showTranscript)}
        className="text-sm text-gray-400 hover:text-primary-500 transition-colors"
      >
        {showTranscript ? 'Hide transcript' : 'Show transcript'}
      </button>
      {showTranscript && (
        <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 text-sm text-gray-700 dark:text-gray-300 italic">
          &ldquo;{exercise.transcript}&rdquo;
        </div>
      )}

      {/* Question */}
      <div>
        <p className="font-semibold text-gray-900 dark:text-white mb-3">{exercise.question}</p>
        <div className="space-y-2">
          {exercise.options.map((opt, i) => {
            let style = 'border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300';
            if (!hasListened) style += ' opacity-50 cursor-not-allowed';
            else style += ' hover:border-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20';
            if (answered) {
              if (i === exercise.correctIndex) style = 'border-success-DEFAULT bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300';
              else if (i === selected) style = 'border-red-400 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300';
              else style = 'border-gray-200 dark:border-gray-600 opacity-40';
            }

            return (
              <motion.button
                key={i}
                whileTap={hasListened && !answered ? { scale: 0.99 } : {}}
                onClick={() => handleAnswer(i)}
                className={`w-full text-left p-3.5 rounded-xl border-2 flex items-center justify-between text-sm font-medium transition-all ${style}`}
              >
                <span>{opt}</span>
                {answered && i === exercise.correctIndex && <CheckCircle2 className="w-4 h-4 text-success-DEFAULT" />}
                {answered && i === selected && i !== exercise.correctIndex && <XCircle className="w-4 h-4 text-red-500" />}
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
