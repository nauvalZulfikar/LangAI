import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import { getLevelFromXP, getNextLevel, getXPProgress, LEVELS } from '@/lib/xp';
import { format } from 'date-fns';

export default async function ProgressPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  const userId = session.user.id;

  const [user, lessonProgress, achievements, userAchievements] = await Promise.all([
    db.user.findUnique({
      where: { id: userId },
      select: {
        xpTotal: true,
        streakCurrent: true,
        streakLongest: true,
        currentLevel: true,
        createdAt: true,
        targetLanguage: true,
      },
    }),
    db.userLessonProgress.findMany({
      where: { userId },
      include: { lesson: { select: { type: true, level: true, title: true } } },
    }),
    db.achievement.findMany(),
    db.userAchievement.findMany({
      where: { userId },
      include: { achievement: true },
    }),
  ]);

  if (!user) redirect('/login');

  const xp = user.xpTotal;
  const levelInfo = getLevelFromXP(xp);
  const nextLevel = getNextLevel(xp);
  const { current, needed, percentage } = getXPProgress(xp);

  const completedLessons = lessonProgress.filter((p) => p.status === 'COMPLETED');
  const totalLessons = await db.lesson.count();

  const unlockedAchievementIds = new Set(userAchievements.map((a) => a.achievementId));

  const daysSinceJoined = Math.floor(
    (Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Progress</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
          Learning {user.targetLanguage} · Joined {daysSinceJoined} days ago
        </p>
      </div>

      {/* Level Card */}
      <div className="bg-gradient-to-r from-primary-500 to-purple-500 rounded-2xl p-6 text-white">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-white/70 text-sm font-medium">Current Level</p>
            <h2 className="text-3xl font-extrabold">{levelInfo.title}</h2>
            <p className="text-white/70 text-sm">Level {levelInfo.level}</p>
          </div>
          <div className="text-5xl font-extrabold opacity-20">L{levelInfo.level}</div>
        </div>
        <div>
          <div className="flex justify-between text-sm text-white/80 mb-2">
            <span>{current.toLocaleString()} XP</span>
            <span>{nextLevel ? `${needed.toLocaleString()} XP to Level ${nextLevel.level}` : 'Max Level!'}</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2.5">
            <div className="bg-white h-2.5 rounded-full transition-all" style={{ width: `${percentage}%` }} />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total XP', value: xp.toLocaleString(), icon: '⚡' },
          { label: 'Lessons Done', value: `${completedLessons.length}/${totalLessons}`, icon: '📚' },
          { label: 'Current Streak', value: `${user.streakCurrent} days`, icon: '🔥' },
          { label: 'Best Streak', value: `${user.streakLongest} days`, icon: '🏆' },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white dark:bg-gray-800 rounded-2xl p-4 text-center border border-gray-100 dark:border-gray-700"
          >
            <div className="text-2xl mb-1">{stat.icon}</div>
            <div className="text-xl font-bold text-gray-900 dark:text-white">{stat.value}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Level Roadmap */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Level Roadmap</h3>
        <div className="space-y-3">
          {LEVELS.map((level) => {
            const isUnlocked = xp >= level.minXP;
            const isCurrent = levelInfo.level === level.level;
            return (
              <div
                key={level.level}
                className={`flex items-center gap-3 p-3 rounded-xl ${
                  isCurrent ? 'bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800' : ''
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    isUnlocked ? 'gradient-primary text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-400'
                  }`}
                >
                  {level.level}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`font-semibold text-sm ${isCurrent ? 'text-primary-600 dark:text-primary-400' : 'text-gray-700 dark:text-gray-300'}`}>
                      {level.title}
                    </span>
                    {isCurrent && (
                      <span className="text-xs bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400 px-2 py-0.5 rounded-full font-medium">
                        Current
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-400 dark:text-gray-500">{level.minXP.toLocaleString()} XP</div>
                </div>
                {isUnlocked && <span className="text-success-DEFAULT text-sm">✓</span>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Achievements */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900 dark:text-white">Achievements</h3>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {unlockedAchievementIds.size}/{achievements.length} unlocked
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {achievements.map((achievement) => {
            const isUnlocked = unlockedAchievementIds.has(achievement.id);
            const userAch = userAchievements.find((ua) => ua.achievementId === achievement.id);
            return (
              <div
                key={achievement.id}
                className={`p-3 rounded-xl border text-center ${
                  isUnlocked
                    ? 'border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20'
                    : 'border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 opacity-60'
                }`}
              >
                <div className={`text-2xl mb-1 ${!isUnlocked && 'grayscale'}`}>{achievement.icon}</div>
                <div className="text-xs font-semibold text-gray-900 dark:text-white">{achievement.title}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{achievement.description}</div>
                {isUnlocked && userAch && (
                  <div className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                    {format(new Date(userAch.unlockedAt), 'MMM d')}
                  </div>
                )}
                {!isUnlocked && (
                  <div className="text-xs text-gray-400 mt-1">🔒 Locked</div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
