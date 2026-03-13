'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useUserStore } from '@/stores/userStore';

export function useAuth(requireAuth = false) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { setUser } = useUserStore();

  useEffect(() => {
    if (requireAuth && status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, requireAuth, router]);

  useEffect(() => {
    if (session?.user) {
      setUser({
        id: session.user.id,
        name: session.user.name ?? null,
        email: session.user.email ?? null,
        avatar: session.user.image ?? null,
        xpTotal: session.user.xpTotal ?? 0,
        streakCurrent: session.user.streakCurrent ?? 0,
        currentLevel: session.user.currentLevel ?? 'A1',
        targetLanguage: session.user.targetLanguage ?? 'Spanish',
        nativeLanguage: session.user.nativeLanguage ?? 'English',
        dailyGoalMinutes: session.user.dailyGoalMinutes ?? 10,
      });
    }
  }, [session, setUser]);

  return {
    user: session?.user ?? null,
    isLoading: status === 'loading',
    isAuthenticated: status === 'authenticated',
    signIn,
    signOut: () => signOut({ callbackUrl: '/' }),
  };
}
