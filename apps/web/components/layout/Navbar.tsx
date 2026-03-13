'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Settings, LogOut, ChevronDown, Flame, Zap } from 'lucide-react';
import { getLevelFromXP, getXPProgress } from '@/lib/xp';
import { useUserStore } from '@/stores/userStore';

export function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const { xpTotal, streakCurrent } = useUserStore();
  const effectiveXP = xpTotal || session?.user?.xpTotal || 0;
  const effectiveStreak = streakCurrent || session?.user?.streakCurrent || 0;
  const levelInfo = getLevelFromXP(effectiveXP);
  const { percentage } = getXPProgress(effectiveXP);

  if (!session) return null;

  const navItems = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/lessons', label: 'Lessons' },
    { href: '/flashcards', label: 'Flashcards' },
    { href: '/speaking', label: 'Speaking' },
    { href: '/writing', label: 'Writing' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">L</span>
            </div>
            <span className="font-bold text-gray-900 dark:text-white hidden sm:block">LinguaFlow</span>
          </Link>

          {/* Nav Links - Desktop */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname === item.href
                    ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right Side */}
          <div className="flex items-center gap-3">
            {/* Streak */}
            <div className="hidden sm:flex items-center gap-1.5 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 px-3 py-1.5 rounded-full text-sm font-semibold">
              <Flame className="w-4 h-4" />
              {effectiveStreak}
            </div>

            {/* XP */}
            <div className="hidden sm:flex items-center gap-1.5 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 px-3 py-1.5 rounded-full text-sm font-semibold">
              <Zap className="w-4 h-4" />
              {effectiveXP.toLocaleString()} XP
            </div>

            {/* Notifications */}
            <Link
              href="/notifications"
              className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors relative"
            >
              <Bell className="w-5 h-5" />
            </Link>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl p-1.5 transition-colors"
              >
                <div className="relative">
                  {session.user.image ? (
                    <img src={session.user.image} alt="" className="w-8 h-8 rounded-full" />
                  ) : (
                    <div className="w-8 h-8 gradient-primary rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">
                        {session.user.name?.[0] ?? session.user.email?.[0] ?? 'U'}
                      </span>
                    </div>
                  )}
                  {/* Level badge */}
                  <div className="absolute -bottom-1 -right-1 bg-primary-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {levelInfo.level}
                  </div>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-400 hidden sm:block" />
              </button>

              <AnimatePresence>
                {menuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 w-60 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden"
                  >
                    <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                      <p className="font-semibold text-gray-900 dark:text-white text-sm">{session.user.name ?? 'Language Learner'}</p>
                      <p className="text-gray-400 text-xs mt-0.5">{session.user.email}</p>
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                          <span>Level {levelInfo.level} — {levelInfo.title}</span>
                          <span>{percentage}%</span>
                        </div>
                        <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-1.5">
                          <div
                            className="gradient-primary h-1.5 rounded-full transition-all"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="p-2">
                      <Link
                        href="/progress"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        <span>📊</span> My Progress
                      </Link>
                      <Link
                        href="/settings"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        <Settings className="w-4 h-4" /> Settings
                      </Link>
                      <button
                        onClick={() => signOut({ callbackUrl: '/' })}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      >
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
