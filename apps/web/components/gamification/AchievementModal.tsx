'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useUserStore } from '@/stores/userStore';
import { X, Zap } from 'lucide-react';

export function AchievementModal() {
  const { newAchievement, setNewAchievement } = useUserStore();

  return (
    <AnimatePresence>
      {newAchievement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setNewAchievement(null)}
          />
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="relative bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-2xl text-center max-w-sm w-full mx-4 border border-yellow-200 dark:border-yellow-800"
          >
            <button
              onClick={() => setNewAchievement(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>

            <motion.div
              initial={{ rotate: -20, scale: 0 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="text-6xl mb-4"
            >
              {newAchievement.icon}
            </motion.div>

            <div className="text-xs font-bold text-yellow-500 uppercase tracking-widest mb-2">Achievement Unlocked!</div>
            <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-2">{newAchievement.title}</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6">{newAchievement.description}</p>

            <button
              onClick={() => setNewAchievement(null)}
              className="w-full gradient-primary text-white py-3 rounded-xl font-bold hover:opacity-90 transition-opacity"
            >
              Awesome! 🎉
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
