'use client';

import Link from 'next/link';

interface LeaderboardPreviewProps {
  entries: Array<{
    rank: number;
    name: string | null;
    avatar: string | null;
    xpEarned: number;
    isCurrentUser: boolean;
  }>;
}

export function LeaderboardPreview({ entries }: LeaderboardPreviewProps) {
  const rankEmoji = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900 dark:text-white">Leaderboard</h3>
        <Link href="/leaderboard" className="text-sm text-primary-500 hover:text-primary-600 font-medium">
          See all
        </Link>
      </div>

      {entries.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 text-sm text-center py-4">No rankings yet this week.</p>
      ) : (
        <div className="space-y-2">
          {entries.slice(0, 5).map((entry) => (
            <div
              key={entry.rank}
              className={`flex items-center gap-3 p-2.5 rounded-xl ${
                entry.isCurrentUser
                  ? 'bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <div className="w-8 text-center font-bold text-sm text-gray-500 dark:text-gray-400">
                {rankEmoji(entry.rank)}
              </div>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                {entry.avatar ? (
                  <img src={entry.avatar} alt="" className="w-8 h-8 rounded-full object-cover" />
                ) : (
                  (entry.name?.[0] ?? '?').toUpperCase()
                )}
              </div>
              <span className={`flex-1 text-sm font-medium ${entry.isCurrentUser ? 'text-primary-600 dark:text-primary-400' : 'text-gray-700 dark:text-gray-300'}`}>
                {entry.name ?? 'Anonymous'} {entry.isCurrentUser && '(You)'}
              </span>
              <span className="text-sm font-bold text-gray-900 dark:text-white">{entry.xpEarned.toLocaleString()} XP</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
