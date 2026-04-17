'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';

interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string | null;
  avatar: string | null;
  level: string;
  xpEarned: number;
  isCurrentUser: boolean;
}

const rankEmoji = (rank: number): string | null => {
  if (rank === 1) return '🥇';
  if (rank === 2) return '🥈';
  if (rank === 3) return '🥉';
  return null;
};

function LeaderboardList({ entries, currentUserId }: { entries: LeaderboardEntry[]; currentUserId: string }) {
  const userEntry = entries.find((e) => e.isCurrentUser);
  const userRank = userEntry?.rank ?? null;

  if (entries.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-5xl mb-4">🏆</div>
        <h3 className="font-bold text-gray-900 dark:text-white mb-2">No rankings yet</h3>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          Complete lessons this week to appear on the leaderboard!
        </p>
      </div>
    );
  }

  return (
    <>
      {userRank && userEntry && (
        <div className="bg-gradient-to-r from-primary-500 to-purple-500 rounded-2xl p-5 text-white mb-6">
          <p className="text-white/70 text-sm mb-1">Your ranking this week</p>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-4xl font-extrabold">#{userRank}</div>
              <div className="text-white/80 text-sm">{userEntry.xpEarned} XP this week</div>
            </div>
            <div className="text-right">
              <div className="text-2xl">🏆</div>
              <div className="text-sm text-white/70">Keep it up!</div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="divide-y divide-gray-50 dark:divide-gray-700">
          {entries.map((entry) => {
            const emoji = rankEmoji(entry.rank);
            return (
              <div
                key={entry.userId}
                className={`flex items-center gap-4 p-4 ${
                  entry.isCurrentUser ? 'bg-primary-50 dark:bg-primary-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <div className="w-10 flex-shrink-0 text-center">
                  {emoji ? (
                    <span className="text-2xl">{emoji}</span>
                  ) : (
                    <span className="text-gray-400 dark:text-gray-500 font-bold text-sm">#{entry.rank}</span>
                  )}
                </div>

                <div className="w-10 h-10 rounded-full flex-shrink-0 overflow-hidden">
                  {entry.avatar ? (
                    <img src={entry.avatar} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full gradient-primary flex items-center justify-center text-white font-bold text-sm">
                      {entry.name?.[0]?.toUpperCase() ?? '?'}
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className={`font-semibold text-sm truncate ${entry.isCurrentUser ? 'text-primary-600 dark:text-primary-400' : 'text-gray-900 dark:text-white'}`}>
                    {entry.name ?? 'Anonymous'} {entry.isCurrentUser && '(You)'}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    Level {entry.level}
                  </p>
                </div>

                <div className="text-right flex-shrink-0">
                  <div className="font-bold text-gray-900 dark:text-white">{entry.xpEarned.toLocaleString()}</div>
                  <div className="text-xs text-gray-400 dark:text-gray-500">XP this week</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

export default function LeaderboardPage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<'global' | 'friends'>('global');
  const [globalEntries, setGlobalEntries] = useState<LeaderboardEntry[]>([]);
  const [friendEntries, setFriendEntries] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const currentUserId = session?.user?.id ?? '';

  useEffect(() => {
    const fetchGlobal = fetch('/api/leaderboard/global').then((r) => r.json() as Promise<LeaderboardEntry[]>);
    const fetchFriends = fetch('/api/leaderboard/friends').then((r) => r.json() as Promise<LeaderboardEntry[]>);

    Promise.all([fetchGlobal, fetchFriends])
      .then(([global, friends]) => {
        setGlobalEntries(Array.isArray(global) ? global : []);
        setFriendEntries(Array.isArray(friends) ? friends : []);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const tabs = [
    { id: 'global' as const, label: 'Global' },
    { id: 'friends' as const, label: 'Friends' },
  ];

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Leaderboard</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Weekly XP rankings — resets every Monday</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-semibold transition-all ${
              activeTab === tab.id
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary-500 border-t-transparent" />
        </div>
      ) : (
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'global' ? (
            <LeaderboardList entries={globalEntries} currentUserId={currentUserId} />
          ) : (
            <>
              {friendEntries.length <= 1 ? (
                <div className="text-center py-16">
                  <div className="text-5xl mb-4">👥</div>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-2">No friends yet</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    Add friends to see how you compare this week!
                  </p>
                </div>
              ) : (
                <LeaderboardList entries={friendEntries} currentUserId={currentUserId} />
              )}
            </>
          )}
        </motion.div>
      )}
    </div>
  );
}
