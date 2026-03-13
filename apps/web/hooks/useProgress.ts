'use client';

import { useQuery } from '@tanstack/react-query';

export function useProgressSummary() {
  return useQuery({
    queryKey: ['progress-summary'],
    queryFn: async () => {
      const res = await fetch('/api/progress/summary');
      if (!res.ok) throw new Error('Failed to fetch progress');
      return res.json();
    },
  });
}

export function useSkillScores() {
  return useQuery({
    queryKey: ['skill-scores'],
    queryFn: async () => {
      const res = await fetch('/api/progress/skills');
      if (!res.ok) throw new Error('Failed to fetch skill scores');
      return res.json();
    },
  });
}

export function useUserStats() {
  return useQuery({
    queryKey: ['user-stats'],
    queryFn: async () => {
      const res = await fetch('/api/user/stats');
      if (!res.ok) throw new Error('Failed to fetch user stats');
      return res.json();
    },
  });
}
