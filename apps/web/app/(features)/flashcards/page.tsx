'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, RotateCcw, Check, X, ChevronRight } from 'lucide-react';
import { FlashcardWithSRS } from '@/types';
import { formatInterval } from '@/lib/sm2';

type Quality = 0 | 1 | 2 | 3 | 4 | 5;

export default function FlashcardsPage() {
  const [cards, setCards] = useState<FlashcardWithSRS[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [reviewed, setReviewed] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/flashcards/due')
      .then((r) => r.json())
      .then((data) => {
        setCards(data);
        setIsLoading(false);
      })
      .catch(() => {
        setError('Failed to load flashcards');
        setIsLoading(false);
      });
  }, []);

  const currentCard = cards[currentIndex];

  const speakWord = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-ES';
    utterance.rate = 0.85;
    window.speechSynthesis.speak(utterance);
  };

  const handleRate = async (quality: Quality) => {
    if (!currentCard) return;
    try {
      await fetch('/api/flashcards/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ flashcardId: currentCard.id, quality }),
      });
    } catch {
      // Continue anyway
    }

    setReviewed((r) => r + 1);
    setIsFlipped(false);

    if (currentIndex >= cards.length - 1) {
      setSessionComplete(true);
    } else {
      setTimeout(() => setCurrentIndex((i) => i + 1), 300);
    }
  };

  const restart = () => {
    setCurrentIndex(0);
    setReviewed(0);
    setIsFlipped(false);
    setSessionComplete(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <p className="text-gray-500 dark:text-gray-400">{error}</p>
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="max-w-lg mx-auto text-center py-16">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">All caught up!</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          No flashcards are due for review right now. Great job keeping up with your studies!
        </p>
        <p className="text-sm text-gray-400 dark:text-gray-500">
          Check back later as cards become due based on your performance.
        </p>
      </div>
    );
  }

  if (sessionComplete) {
    return (
      <div className="max-w-lg mx-auto text-center py-16">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-6xl mb-4">
          ✨
        </motion.div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Session Complete!</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          You reviewed <strong>{reviewed}</strong> flashcards in this session.
        </p>
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 mb-6 border border-gray-100 dark:border-gray-700">
          <div className="text-3xl font-bold text-primary-500 mb-1">{reviewed} cards</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">reviewed today</div>
        </div>
        <button
          onClick={restart}
          className="gradient-primary text-white px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity"
        >
          Review Again
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Flashcards</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {currentIndex + 1} of {cards.length} due today
          </p>
        </div>
        <div className="bg-primary-50 dark:bg-primary-900/20 rounded-xl px-3 py-1.5 text-sm font-semibold text-primary-600 dark:text-primary-400">
          {Math.round((currentIndex / cards.length) * 100)}% done
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2 mb-8">
        <motion.div
          className="gradient-primary h-2 rounded-full"
          animate={{ width: `${(currentIndex / cards.length) * 100}%` }}
        />
      </div>

      {/* Flashcard */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -60 }}
          transition={{ duration: 0.25 }}
          className="mb-6"
        >
          <div
            className="relative h-64 cursor-pointer"
            style={{ perspective: '1000px' }}
            onClick={() => setIsFlipped(!isFlipped)}
          >
            <motion.div
              className="relative w-full h-full"
              style={{ transformStyle: 'preserve-3d' }}
              animate={{ rotateY: isFlipped ? 180 : 0 }}
              transition={{ duration: 0.5, type: 'spring', stiffness: 200, damping: 25 }}
            >
              {/* Front */}
              <div
                className="absolute inset-0 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 flex flex-col items-center justify-center p-6"
                style={{ backfaceVisibility: 'hidden' }}
              >
                <div className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-4">
                  {currentCard.language}
                </div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-4">
                  {currentCard.front}
                </div>
                <div className="flex gap-2">
                  {(currentCard.tags ? currentCard.tags.split(',').filter(Boolean) : []).map((tag) => (
                    <span
                      key={tag}
                      className="text-xs bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 px-2 py-0.5 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    speakWord(currentCard.front);
                  }}
                  className="absolute top-3 right-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <Volume2 className="w-4 h-4 text-gray-400" />
                </button>
                <div className="absolute bottom-3 text-xs text-gray-300 dark:text-gray-600">Tap to reveal</div>
              </div>

              {/* Back */}
              <div
                className="absolute inset-0 gradient-primary rounded-2xl shadow-lg flex flex-col items-center justify-center p-6"
                style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
              >
                <div className="text-xs font-medium text-white/70 uppercase tracking-wider mb-4">Translation</div>
                <div className="text-3xl font-bold text-white text-center mb-2">{currentCard.back}</div>
                {currentCard.srs.interval > 0 && (
                  <div className="text-white/70 text-sm mt-2">
                    Next review: {formatInterval(currentCard.srs.interval)}
                  </div>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    speakWord(currentCard.front);
                  }}
                  className="absolute top-3 right-3 p-2 rounded-lg hover:bg-white/20 transition-colors"
                >
                  <Volume2 className="w-4 h-4 text-white/70" />
                </button>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Rating buttons (shown after flip) */}
      <AnimatePresence>
        {isFlipped && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="space-y-3"
          >
            <p className="text-center text-sm font-medium text-gray-500 dark:text-gray-400">How well did you know this?</p>
            <div className="grid grid-cols-4 gap-2">
              <button
                onClick={() => handleRate(1)}
                className="flex flex-col items-center gap-1 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
              >
                <X className="w-5 h-5 text-red-500" />
                <span className="text-xs font-medium text-red-600 dark:text-red-400">Again</span>
              </button>
              <button
                onClick={() => handleRate(2)}
                className="flex flex-col items-center gap-1 p-3 rounded-xl bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 hover:bg-orange-100 transition-colors"
              >
                <RotateCcw className="w-5 h-5 text-orange-500" />
                <span className="text-xs font-medium text-orange-600 dark:text-orange-400">Hard</span>
              </button>
              <button
                onClick={() => handleRate(4)}
                className="flex flex-col items-center gap-1 p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-blue-500" />
                <span className="text-xs font-medium text-blue-600 dark:text-blue-400">Good</span>
              </button>
              <button
                onClick={() => handleRate(5)}
                className="flex flex-col items-center gap-1 p-3 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 hover:bg-green-100 transition-colors"
              >
                <Check className="w-5 h-5 text-success-DEFAULT" />
                <span className="text-xs font-medium text-green-600 dark:text-green-400">Easy</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
