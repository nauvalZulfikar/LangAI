'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap } from 'lucide-react';
import { useUserStore } from '@/stores/userStore';

export function XPPopup() {
  const { pendingXP, showXPPopup, clearPendingXP } = useUserStore();

  useEffect(() => {
    if (showXPPopup) {
      const timer = setTimeout(clearPendingXP, 2000);
      return () => clearTimeout(timer);
    }
  }, [showXPPopup, clearPendingXP]);

  return (
    <AnimatePresence>
      {showXPPopup && pendingXP > 0 && (
        <motion.div
          initial={{ opacity: 1, scale: 0.5, y: 0 }}
          animate={{ opacity: 0, scale: 1.2, y: -60 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          className="fixed bottom-24 right-6 z-50 flex items-center gap-1.5 bg-primary-500 text-white px-4 py-2 rounded-full font-bold shadow-lg pointer-events-none"
        >
          <Zap className="w-4 h-4" />
          +{pendingXP} XP
        </motion.div>
      )}
    </AnimatePresence>
  );
}
