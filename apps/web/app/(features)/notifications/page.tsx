'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, Check, Flame, Trophy, Zap, Star } from 'lucide-react';
import { formatRelativeDate } from '@/lib/utils';

interface Notification {
  id: string;
  type: 'achievement' | 'streak' | 'reminder' | 'challenge' | 'level_up';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

const notificationIcons = {
  achievement: Trophy,
  streak: Flame,
  reminder: Bell,
  challenge: Star,
  level_up: Zap,
};

const notificationColors = {
  achievement: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800',
  streak: 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800',
  reminder: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
  challenge: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800',
  level_up: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
};

// Demo notifications for the UI
const DEMO_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    type: 'streak',
    title: '🔥 7-Day Streak!',
    message: 'Congratulations! You\'ve maintained a 7-day learning streak. Keep it up!',
    read: false,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: '2',
    type: 'achievement',
    title: '🏆 Achievement Unlocked',
    message: 'You\'ve unlocked "First Step" — Complete your first lesson.',
    read: false,
    createdAt: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: '3',
    type: 'challenge',
    title: '🎯 Daily Challenge Available',
    message: 'Today\'s vocabulary challenge is ready. Complete it to earn 60 XP!',
    read: true,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: '4',
    type: 'level_up',
    title: '⚡ Level Up!',
    message: 'You\'ve reached Level 2 — Explorer. Keep learning to unlock more levels!',
    read: true,
    createdAt: new Date(Date.now() - 172800000).toISOString(),
  },
  {
    id: '5',
    type: 'reminder',
    title: '📚 Time to Practice',
    message: "Don't forget your daily Spanish practice. Your streak is at stake!",
    read: true,
    createdAt: new Date(Date.now() - 259200000).toISOString(),
  },
];

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>(DEMO_NOTIFICATIONS);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const markRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Notifications</h1>
          {unreadCount > 0 && (
            <p className="text-sm text-primary-500 font-medium mt-0.5">{unreadCount} unread</p>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary-500 transition-colors font-medium"
          >
            <Check className="w-4 h-4" /> Mark all read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-16">
          <Bell className="w-12 h-12 text-gray-200 dark:text-gray-700 mx-auto mb-3" />
          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">All caught up!</h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm">No notifications at the moment.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification, i) => {
            const Icon = notificationIcons[notification.type];
            const colorClass = notificationColors[notification.type];

            return (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => markRead(notification.id)}
                className={`relative flex items-start gap-4 p-4 rounded-2xl border cursor-pointer transition-all hover:shadow-sm ${
                  notification.read
                    ? 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700'
                    : colorClass
                }`}
              >
                {!notification.read && (
                  <div className="absolute top-4 right-4 w-2 h-2 bg-primary-500 rounded-full" />
                )}

                <div className={`p-2 rounded-xl flex-shrink-0 ${notification.read ? 'bg-gray-100 dark:bg-gray-700' : 'bg-white dark:bg-gray-800'}`}>
                  <Icon className="w-5 h-5 text-primary-500" />
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{notification.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">{notification.message}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{formatRelativeDate(notification.createdAt)}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
