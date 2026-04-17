'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Bell, Check, Flame, Trophy, Zap, Star, BellRing } from 'lucide-react';
import { formatRelativeDate } from '@/lib/utils';
import { usePushNotifications } from '@/hooks/usePushNotifications';

interface Notification {
  id: string;
  type: 'achievement' | 'streak' | 'reminder' | 'challenge' | 'level_up';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

interface SSENotification {
  id: string;
  type: string;
  title: string;
  message: string;
  xp?: number;
  createdAt: string | Date;
}

interface SSEInitEvent {
  type: 'init';
  notifications: SSENotification[];
  streak: number;
}

interface SSEPingEvent {
  type: 'ping';
}

type SSEEvent = SSEInitEvent | SSEPingEvent;

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

function normalizeType(type: string): Notification['type'] {
  if (type in notificationIcons) return type as Notification['type'];
  return 'reminder';
}

function sseToNotification(n: SSENotification): Notification {
  return {
    id: n.id,
    type: normalizeType(n.type),
    title: n.title,
    message: n.message,
    read: false,
    createdAt: typeof n.createdAt === 'string' ? n.createdAt : new Date(n.createdAt).toISOString(),
  };
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLive, setIsLive] = useState(false);
  const { requestPermission, isSupported, permission } = usePushNotifications();
  const [isRequestingPermission, setIsRequestingPermission] = useState(false);
  const esRef = useRef<EventSource | null>(null);

  useEffect(() => {
    const connect = () => {
      const es = new EventSource('/api/notifications/stream');
      esRef.current = es;

      es.onopen = () => setIsLive(true);

      es.onmessage = (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data as string) as SSEEvent;
          if (data.type === 'init') {
            const mapped = data.notifications.map(sseToNotification);
            setNotifications(mapped);
            setIsLive(true);
          }
          // ping events are just heartbeats — no UI update needed
        } catch {
          // ignore parse errors
        }
      };

      es.onerror = () => {
        setIsLive(false);
        es.close();
        // Fall back to REST API
        fetch('/api/notifications')
          .then((res) => res.json())
          .then((data: unknown) => {
            if (Array.isArray(data)) {
              const typed = data as Notification[];
              setNotifications(typed);
            }
          })
          .catch(() => {});
      };
    };

    connect();

    return () => {
      esRef.current?.close();
      esRef.current = null;
    };
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const markRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const handleEnablePush = async () => {
    setIsRequestingPermission(true);
    await requestPermission();
    setIsRequestingPermission(false);
  };

  const pushButtonLabel = () => {
    if (!isSupported) return null;
    if (permission === 'granted') return 'Push notifications enabled ✓';
    if (permission === 'denied') return 'Notifications blocked — enable in browser settings';
    return 'Enable Push Notifications';
  };

  const label = pushButtonLabel();

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Notifications</h1>
            {isLive && (
              <span className="flex items-center gap-1 text-xs font-semibold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded-full border border-green-200 dark:border-green-800">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                Live
              </span>
            )}
          </div>
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

      {/* Push notification banner */}
      {isSupported && permission !== 'granted' && permission !== 'denied' && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between gap-4 bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-700 rounded-2xl p-4 mb-6"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-100 dark:bg-primary-900/50 rounded-xl">
              <BellRing className="w-5 h-5 text-primary-500" />
            </div>
            <div>
              <p className="font-semibold text-gray-900 dark:text-white text-sm">Stay on track</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Get push reminders to practice every day</p>
            </div>
          </div>
          <button
            onClick={handleEnablePush}
            disabled={isRequestingPermission}
            className="flex-shrink-0 gradient-primary text-white text-sm font-semibold px-4 py-2 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {isRequestingPermission ? 'Enabling...' : 'Enable'}
          </button>
        </motion.div>
      )}

      {isSupported && label && permission !== 'default' && (
        <p className={`text-sm font-medium mb-4 ${permission === 'granted' ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
          {label}
        </p>
      )}

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
