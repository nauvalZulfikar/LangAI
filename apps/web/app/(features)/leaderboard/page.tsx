import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import { getWeekStart } from '@/lib/utils';

export default async function LeaderboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  const userId = session.user.id;
  const weekStart = getWeekStart();

  const leaderboard = await db.leaderboard.findMany({
    where: { weekStart },
    include: {
      user: {
        select: { id: true, name: true, avatar: true, currentLevel: true, xpTotal: true },
      },
    },
    orderBy: { xpEarned: 'desc' },
    take: 50,
  });

  const userEntry = leaderboard.find((e) => e.user.id === userId);
  const userRank = userEntry ? leaderboard.findIndex((e) => e.user.id === userId) + 1 : null;

  const rankEmoji = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return null;
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Leaderboard</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Weekly XP rankings — resets every Monday</p>
      </div>

      {/* User's rank card */}
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

      {leaderboard.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">🏆</div>
          <h3 className="font-bold text-gray-900 dark:text-white mb-2">No rankings yet</h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Complete lessons this week to appear on the leaderboard!
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="divide-y divide-gray-50 dark:divide-gray-700">
            {leaderboard.map((entry, index) => {
              const rank = index + 1;
              const isCurrentUser = entry.user.id === userId;
              const emoji = rankEmoji(rank);

              return (
                <div
                  key={entry.id}
                  className={`flex items-center gap-4 p-4 ${
                    isCurrentUser ? 'bg-primary-50 dark:bg-primary-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <div className="w-10 flex-shrink-0 text-center">
                    {emoji ? (
                      <span className="text-2xl">{emoji}</span>
                    ) : (
                      <span className="text-gray-400 dark:text-gray-500 font-bold text-sm">#{rank}</span>
                    )}
                  </div>

                  <div className="w-10 h-10 rounded-full flex-shrink-0 overflow-hidden">
                    {entry.user.avatar ? (
                      <img src={entry.user.avatar} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full gradient-primary flex items-center justify-center text-white font-bold text-sm">
                        {entry.user.name?.[0]?.toUpperCase() ?? '?'}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className={`font-semibold text-sm truncate ${isCurrentUser ? 'text-primary-600 dark:text-primary-400' : 'text-gray-900 dark:text-white'}`}>
                      {entry.user.name ?? 'Anonymous'} {isCurrentUser && '(You)'}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      Level {entry.user.currentLevel} · {entry.user.xpTotal.toLocaleString()} total XP
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
      )}
    </div>
  );
}
