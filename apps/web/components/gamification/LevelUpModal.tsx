'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useUserStore } from '@/stores/userStore';
import { getLevelFromXP } from '@/lib/xp';
import { Zap, Star } from 'lucide-react';

export function LevelUpModal() {
  const { showLevelUp, setShowLevelUp, xpTotal } = useUserStore();
  const levelInfo = getLevelFromXP(xpTotal);

  return (
    <AnimatePresence>
      {showLevelUp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />
          <motion.div
            initial={{ scale: 0.3, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 250, damping: 20 }}
            className="relative bg-gradient-to-br from-primary-500 to-purple-600 rounded-3xl p-8 shadow-2xl text-center text-white max-w-sm w-full mx-4"
          >
            {/* Stars */}
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: [0, 1, 0], scale: [0, 1, 0] }}
                transition={{ delay: i * 0.1, duration: 1.5, repeat: 2 }}
                className="absolute"
                style={{
                  top: `${Math.random() * 80}%`,
                  left: `${Math.random() * 90}%`,
                }}
              >
                <Star className="w-4 h-4 text-yellow-300 fill-yellow-300" />
              </motion.div>
            ))}

            <motion.div
              animate={{ rotate: [0, -5, 5, 0] }}
              transition={{ repeat: 3, duration: 0.5, delay: 0.3 }}
              className="text-7xl mb-4"
            >
              🏆
            </motion.div>

            <div className="text-yellow-300 font-bold text-sm uppercase tracking-widest mb-2">Level Up!</div>
            <h2 className="text-3xl font-extrabold mb-1">Level {levelInfo.level}</h2>
            <h3 className="text-xl font-bold text-white/80 mb-4">{levelInfo.title}</h3>

            <div className="bg-white/20 rounded-2xl p-4 mb-6">
              <p className="text-white/90 text-sm">
                Congratulations! You&apos;ve reached a new milestone in your language learning journey!
              </p>
            </div>

            <button
              onClick={() => setShowLevelUp(false)}
              className="w-full bg-white text-primary-600 py-3 rounded-xl font-bold hover:bg-white/90 transition-colors"
            >
              Continue Learning! 🚀
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
