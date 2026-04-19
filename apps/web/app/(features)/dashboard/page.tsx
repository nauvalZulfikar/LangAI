import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import { DailyStreakBanner } from '@/components/dashboard/DailyStreakBanner';
import { DailyGoalProgress } from '@/components/dashboard/DailyGoalProgress';
import { ContinueLearningCard } from '@/components/dashboard/ContinueLearningCard';
import { DailyChallenge } from '@/components/dashboard/DailyChallenge';
import { SkillRadar } from '@/components/dashboard/SkillRadar';
import { WeeklyXPChart } from '@/components/dashboard/WeeklyXPChart';
import { RecentBadges } from '@/components/dashboard/RecentBadges';
import { LeaderboardPreview } from '@/components/dashboard/LeaderboardPreview';
import { getWeekStart } from '@/lib/utils';
import { GoalDashboardWidget } from '@/components/goals/GoalDashboardWidget';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  const userId = session.user.id;

  const [user, recentProgress, achievements, leaderboard, todayChallenge, userChallenge, activeGoalRaw, suggestedGoalRaw] = await Promise.all([
    db.user.findUnique({
      where: { id: userId },
      select: {
        xpTotal: true,
        streakCurrent: true,
        streakLongest: true,
        dailyGoalMinutes: true,
        currentLevel: true,
        targetLanguage: true,
        name: true,
      },
    }),
    db.userLessonProgress.findMany({
      where: { userId, status: 'IN_PROGRESS' },
      include: { lesson: true },
      orderBy: { completedAt: 'desc' },
      take: 1,
    }),
    db.userAchievement.findMany({
      where: { userId },
      include: { achievement: true },
      orderBy: { unlockedAt: 'desc' },
      take: 5,
    }),
    db.leaderboard.findMany({
      where: { weekStart: getWeekStart() },
      include: { user: { select: { id: true, name: true, avatar: true } } },
      orderBy: { xpEarned: 'desc' },
      take: 5,
    }),
    db.dailyChallenge.findFirst({
      where: { date: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } },
    }),
    db.userDailyChallenge.findFirst({
      where: {
        userId,
        completedAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
      },
    }),
    db.goalCycle.findFirst({
      where: { userId, status: 'ACTIVE' },
      include: { assignedLessons: true },
    }),
    db.goalCycle.findFirst({
      where: { userId, status: 'SUGGESTED' },
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  if (!user) redirect('/login');

  // Build weekly XP data (placeholder — real implementation queries daily breakdown)
  const weeklyXP = [0, 0, 0, 0, 0, 0, 0];

  // Skill scores — derived from lesson completion rates by type
  const lessonStats = await db.userLessonProgress.findMany({
    where: { userId, status: 'COMPLETED' },
    include: { lesson: { select: { type: true } } },
  });

  const skillScores = {
    vocabulary: 0,
    grammar: 0,
    listening: 0,
    speaking: 0,
    reading: 0,
    writing: 0,
  };

  const typeCounts: Record<string, { total: number; scoreSum: number }> = {};
  for (const p of lessonStats) {
    const type = p.lesson.type.toLowerCase() as keyof typeof skillScores;
    if (!typeCounts[type]) typeCounts[type] = { total: 0, scoreSum: 0 };
    typeCounts[type].total += 1;
    typeCounts[type].scoreSum += p.score;
  }
  for (const [type, data] of Object.entries(typeCounts)) {
    if (type in skillScores) {
      skillScores[type as keyof typeof skillScores] = Math.round(data.scoreSum / data.total);
    }
  }

  const rawLesson = recentProgress[0]?.lesson ?? null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const nextLesson = rawLesson ? { ...rawLesson, level: rawLesson.level as any, type: rawLesson.type as any } : null;

  const challengeData = todayChallenge
    ? {
        id: todayChallenge.id,
        type: todayChallenge.type,
        xpReward: todayChallenge.xpReward,
        content: JSON.parse(todayChallenge.content as string) as Record<string, unknown>,
        completed: !!userChallenge,
      }
    : null;

  const leaderboardEntries = leaderboard.map((entry, index) => ({
    rank: index + 1,
    userId: entry.user.id,
    name: entry.user.name,
    avatar: entry.user.avatar,
    xpEarned: entry.xpEarned,
    isCurrentUser: entry.user.id === userId,
  }));

  // Format goal data for widget
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let activeGoal: any = null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let suggestedGoal: any = null;

  if (activeGoalRaw) {
    const gl = activeGoalRaw.assignedLessons;
    const totalLessons = gl.length;
    const completedGoalLessons = gl.filter((l) => l.completedAt !== null).length;
    const now = new Date();
    const sAt = activeGoalRaw.startedAt ? new Date(activeGoalRaw.startedAt) : now;
    const dAt = activeGoalRaw.deadlineAt ? new Date(activeGoalRaw.deadlineAt) : now;
    const daysElapsed = Math.max(0, Math.floor((now.getTime() - sAt.getTime()) / (1000 * 60 * 60 * 24)));
    const daysRemaining = Math.max(0, Math.floor((dAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
    const percentComplete = totalLessons > 0 ? Math.round((completedGoalLessons / totalLessons) * 100) : 0;
    activeGoal = {
      id: activeGoalRaw.id,
      title: activeGoalRaw.title,
      description: activeGoalRaw.description,
      topic: activeGoalRaw.topic,
      cefrLevel: activeGoalRaw.cefrLevel,
      skillFocus: JSON.parse(activeGoalRaw.skillFocus),
      status: activeGoalRaw.status,
      durationDays: activeGoalRaw.durationDays,
      startedAt: activeGoalRaw.startedAt?.toISOString() ?? null,
      deadlineAt: activeGoalRaw.deadlineAt?.toISOString() ?? null,
      completedAt: activeGoalRaw.completedAt?.toISOString() ?? null,
      xpMultiplier: activeGoalRaw.xpMultiplier,
      passThreshold: activeGoalRaw.passThreshold,
      sequenceNumber: activeGoalRaw.sequenceNumber,
      progress: { totalLessons, completedLessons: completedGoalLessons, daysElapsed, daysRemaining, percentComplete },
    };
  } else if (suggestedGoalRaw) {
    suggestedGoal = {
      id: suggestedGoalRaw.id,
      title: suggestedGoalRaw.title,
      description: suggestedGoalRaw.description,
      topic: suggestedGoalRaw.topic,
      cefrLevel: suggestedGoalRaw.cefrLevel,
      skillFocus: JSON.parse(suggestedGoalRaw.skillFocus),
      status: suggestedGoalRaw.status,
      durationDays: suggestedGoalRaw.durationDays,
      xpMultiplier: suggestedGoalRaw.xpMultiplier,
      passThreshold: suggestedGoalRaw.passThreshold,
      sequenceNumber: suggestedGoalRaw.sequenceNumber,
      startedAt: null,
      deadlineAt: null,
      completedAt: null,
      progress: { totalLessons: 0, completedLessons: 0, daysElapsed: 0, daysRemaining: 0, percentComplete: 0 },
    };
  }

  const recentBadges = achievements.map((a) => ({
    id: a.id,
    title: a.achievement.title,
    icon: a.achievement.icon,
    unlockedAt: a.unlockedAt,
  }));

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Good {getTimeOfDay()}, {session.user.name?.split(' ')[0] ?? 'Learner'}! 👋
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
          Keep up the great work learning {user.targetLanguage}!
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-4">
          <DailyStreakBanner streak={user.streakCurrent} longestStreak={user.streakLongest} />
          <DailyGoalProgress minutesCompleted={0} dailyGoalMinutes={user.dailyGoalMinutes} />
          <GoalDashboardWidget activeGoal={activeGoal} suggestedGoal={suggestedGoal} />
          <ContinueLearningCard lesson={nextLesson} />
          <DailyChallenge challenge={challengeData} />
          <WeeklyXPChart data={weeklyXP} />
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          <SkillRadar skills={skillScores} />
          <RecentBadges badges={recentBadges} />
          <LeaderboardPreview entries={leaderboardEntries} />
        </div>
      </div>
    </div>
  );
}

function getTimeOfDay(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
}
