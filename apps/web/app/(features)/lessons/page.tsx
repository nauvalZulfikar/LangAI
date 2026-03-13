import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { BookOpen, Clock, Zap, CheckCircle2, Lock } from 'lucide-react';
import { CEFRLevel, LessonType } from '@/types';

const levelColors: Record<CEFRLevel, string> = {
  A1: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  A2: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
  B1: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  B2: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  C1: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  C2: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

const typeIcons: Record<LessonType, string> = {
  VOCABULARY: '📖',
  GRAMMAR: '✏️',
  LISTENING: '🎧',
  SPEAKING: '🗣️',
  READING: '📰',
  WRITING: '✍️',
};

export default async function LessonsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  const userId = session.user.id;

  const [lessons, userProgress] = await Promise.all([
    db.lesson.findMany({
      orderBy: [{ unit: 'asc' }, { order: 'asc' }],
    }),
    db.userLessonProgress.findMany({
      where: { userId },
    }),
  ]);

  const progressMap = Object.fromEntries(userProgress.map((p) => [p.lessonId, p]));

  // Group by unit
  const units: Record<number, typeof lessons> = {};
  for (const lesson of lessons) {
    if (!units[lesson.unit]) units[lesson.unit] = [];
    units[lesson.unit].push(lesson);
  }

  const unitNames: Record<number, string> = {
    1: 'Greetings & Introductions',
    2: 'Numbers & Time',
    3: 'Family & People',
    4: 'Food & Restaurants',
    5: 'Travel & Directions',
    6: 'Work & Daily Routine',
    7: 'Health & Body',
    8: 'Hobbies & Free Time',
    9: 'News & Current Events',
    10: 'Abstract Ideas & Debate',
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Lessons</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
          {lessons.length} lessons across {Object.keys(units).length} units
        </p>
      </div>

      <div className="space-y-8">
        {Object.entries(units).map(([unit, unitLessons]) => {
          const unitNum = Number(unit);
          const completedInUnit = unitLessons.filter(
            (l) => progressMap[l.id]?.status === 'COMPLETED'
          ).length;
          const unitProgress = Math.round((completedInUnit / unitLessons.length) * 100);

          return (
            <div key={unit}>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h2 className="font-bold text-gray-900 dark:text-white">
                    Unit {unit}: {unitNames[unitNum] ?? `Unit ${unit}`}
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {completedInUnit}/{unitLessons.length} completed
                  </p>
                </div>
                <div className="text-sm font-bold text-primary-500">{unitProgress}%</div>
              </div>

              <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-1.5 mb-4">
                <div
                  className="gradient-primary h-1.5 rounded-full transition-all"
                  style={{ width: `${unitProgress}%` }}
                />
              </div>

              <div className="space-y-2">
                {unitLessons.map((lesson, lessonIndex) => {
                  const progress = progressMap[lesson.id];
                  const isCompleted = progress?.status === 'COMPLETED';
                  const isInProgress = progress?.status === 'IN_PROGRESS';
                  const isLocked = lessonIndex > 0 && !progressMap[unitLessons[lessonIndex - 1].id];

                  return (
                    <div
                      key={lesson.id}
                      className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                        isCompleted
                          ? 'bg-green-50 dark:bg-green-900/10 border-green-100 dark:border-green-900/30'
                          : isInProgress
                          ? 'bg-white dark:bg-gray-800 border-primary-200 dark:border-primary-800 shadow-sm'
                          : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 hover:border-primary-200'
                      }`}
                    >
                      <div className="text-2xl flex-shrink-0">{typeIcons[lesson.type as LessonType]}</div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <h3 className="font-semibold text-gray-900 dark:text-white text-sm truncate">{lesson.title}</h3>
                          <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium flex-shrink-0 ${levelColors[lesson.level as CEFRLevel]}`}>
                            {lesson.level}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{lesson.description}</p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-400 dark:text-gray-500">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {lesson.estimatedMinutes}m
                          </span>
                          <span className="flex items-center gap-1">
                            <Zap className="w-3 h-3" /> {lesson.xpReward} XP
                          </span>
                          {isCompleted && progress.score > 0 && (
                            <span className="text-success-DEFAULT font-medium">
                              {'★'.repeat(progress.score >= 90 ? 3 : progress.score >= 70 ? 2 : 1)}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex-shrink-0">
                        {isCompleted ? (
                          <CheckCircle2 className="w-6 h-6 text-success-DEFAULT" />
                        ) : isLocked ? (
                          <Lock className="w-5 h-5 text-gray-300 dark:text-gray-600" />
                        ) : (
                          <Link
                            href={`/lessons/${lesson.id}`}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                              isInProgress
                                ? 'gradient-primary text-white'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-primary-50 hover:text-primary-600 dark:hover:bg-primary-900/30 dark:hover:text-primary-400'
                            }`}
                          >
                            {isInProgress ? 'Continue' : 'Start'}
                          </Link>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {lessons.length === 0 && (
          <div className="text-center py-16">
            <BookOpen className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">No lessons yet</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Run the seed script to add lessons.</p>
          </div>
        )}
      </div>
    </div>
  );
}
