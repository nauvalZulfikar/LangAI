'use client';

import { motion } from 'framer-motion';
import { Flame } from 'lucide-react';

interface DailyStreakBannerProps {
  streak: number;
  longestStreak: number;
}

export function DailyStreakBanner({ streak, longestStreak }: DailyStreakBannerProps) {
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const today = new Date().getDay();
  const mondayStart = today === 0 ? 6 : today - 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-orange-400 to-red-400 rounded-2xl p-5 text-white shadow-lg"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Flame className="w-6 h-6 animate-pulse" />
          <div>
            <h3 className="font-bold text-lg">{streak}-day streak!</h3>
            <p className="text-orange-100 text-sm">Best: {longestStreak} days</p>
          </div>
        </div>
        <div className="text-4xl font-extrabold">{streak}</div>
      </div>

      <div className="flex items-center gap-2">
        {days.map((day, i) => {
          const isActive = i <= mondayStart;
          return (
            <div key={i} className="flex flex-col items-center gap-1 flex-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  isActive
                    ? 'bg-white text-orange-500'
                    : 'bg-orange-300/50 text-orange-100'
                }`}
              >
                {isActive ? '🔥' : day}
              </div>
              <span className="text-orange-100 text-xs">{day}</span>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
