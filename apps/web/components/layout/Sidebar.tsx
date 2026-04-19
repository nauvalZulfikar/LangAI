'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BookOpen, CreditCard, Mic, PenLine, BarChart2, Trophy, Bell, Settings, Flame, Zap, Target } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSession } from 'next-auth/react';
import { useUserStore } from '@/stores/userStore';
import { getLevelFromXP, getXPProgress } from '@/lib/xp';

const navItems = [
  { href: '/dashboard', icon: Home, label: 'Dashboard' },
  { href: '/goals', icon: Target, label: 'Goals' },
  { href: '/lessons', icon: BookOpen, label: 'Lessons' },
  { href: '/flashcards', icon: CreditCard, label: 'Flashcards' },
  { href: '/speaking', icon: Mic, label: 'Speaking' },
  { href: '/writing', icon: PenLine, label: 'Writing' },
  { href: '/progress', icon: BarChart2, label: 'Progress' },
  { href: '/leaderboard', icon: Trophy, label: 'Leaderboard' },
];

const secondaryItems = [
  { href: '/notifications', icon: Bell, label: 'Notifications' },
  { href: '/settings', icon: Settings, label: 'Settings' },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { xpTotal, streakCurrent } = useUserStore();
  const effectiveXP = xpTotal || session?.user?.xpTotal || 0;
  const effectiveStreak = streakCurrent || session?.user?.streakCurrent || 0;
  const levelInfo = getLevelFromXP(effectiveXP);
  const { percentage, current, needed } = getXPProgress(effectiveXP);

  return (
    <aside className="hidden md:flex flex-col w-64 h-screen sticky top-0 bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 p-4">
      {/* Logo */}
      <Link href="/dashboard" className="flex items-center gap-2 px-2 mb-8">
        <div className="w-9 h-9 gradient-primary rounded-xl flex items-center justify-center">
          <span className="text-white font-bold">L</span>
        </div>
        <span className="font-bold text-gray-900 dark:text-white text-lg">LinguaFlow</span>
      </Link>

      {/* User Stats */}
      <div className="bg-gradient-to-br from-primary-50 to-purple-50 dark:from-primary-900/20 dark:to-purple-900/20 rounded-2xl p-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5 text-sm font-semibold text-orange-500">
            <Flame className="w-4 h-4" />
            {effectiveStreak} day streak
          </div>
          <div className="flex items-center gap-1.5 text-sm font-semibold text-primary-600 dark:text-primary-400">
            <Zap className="w-4 h-4" />
            {effectiveXP.toLocaleString()} XP
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1.5">
            <span>Level {levelInfo.level} — {levelInfo.title}</span>
            <span>{current}/{needed} XP</span>
          </div>
          <div className="w-full bg-white dark:bg-gray-800 rounded-full h-2">
            <div
              className="gradient-primary h-2 rounded-full transition-all duration-500"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1">
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
              )}
            >
              <Icon className={cn('w-5 h-5', isActive && 'stroke-[2.5]')} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Secondary Nav */}
      <div className="border-t border-gray-100 dark:border-gray-800 pt-4 mt-4 space-y-1">
        {secondaryItems.map(({ href, icon: Icon, label }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
              pathname === href
                ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
            )}
          >
            <Icon className="w-5 h-5" />
            {label}
          </Link>
        ))}
      </div>
    </aside>
  );
}
