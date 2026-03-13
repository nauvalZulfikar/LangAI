'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BookOpen, CreditCard, Mic, PenLine, BarChart2, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', icon: Home, label: 'Home' },
  { href: '/lessons', icon: BookOpen, label: 'Lessons' },
  { href: '/flashcards', icon: CreditCard, label: 'Cards' },
  { href: '/speaking', icon: Mic, label: 'Speak' },
  { href: '/writing', icon: PenLine, label: 'Write' },
  { href: '/progress', icon: BarChart2, label: 'Progress' },
  { href: '/leaderboard', icon: Trophy, label: 'Ranks' },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 md:hidden">
      <div className="flex items-center justify-around px-2 py-2 pb-safe">
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition-colors min-w-0',
                isActive
                  ? 'text-primary-600 dark:text-primary-400'
                  : 'text-gray-400 dark:text-gray-500'
              )}
            >
              <Icon className={cn('w-5 h-5', isActive && 'stroke-[2.5]')} />
              <span className="text-[10px] font-medium truncate">{label}</span>
              {isActive && (
                <div className="absolute bottom-0 w-6 h-0.5 gradient-primary rounded-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
