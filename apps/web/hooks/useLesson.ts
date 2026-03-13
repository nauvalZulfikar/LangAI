'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export function useLesson(id: string) {
  return useQuery({
    queryKey: ['lesson', id],
    queryFn: async () => {
      const res = await fetch(`/api/lessons/${id}`);
      if (!res.ok) throw new Error('Failed to fetch lesson');
      return res.json();
    },
    enabled: !!id,
  });
}

export function useLessons(params?: { level?: string; unit?: number; type?: string }) {
  const searchParams = new URLSearchParams();
  if (params?.level) searchParams.set('level', params.level);
  if (params?.unit) searchParams.set('unit', String(params.unit));
  if (params?.type) searchParams.set('type', params.type);

  return useQuery({
    queryKey: ['lessons', params],
    queryFn: async () => {
      const res = await fetch(`/api/lessons?${searchParams.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch lessons');
      return res.json();
    },
  });
}

export function useCompleteLesson() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ lessonId, score, correct, total }: { lessonId: string; score: number; correct: number; total: number }) => {
      const res = await fetch(`/api/lessons/${lessonId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ score, correct, total }),
      });
      if (!res.ok) throw new Error('Failed to complete lesson');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lessons'] });
      queryClient.invalidateQueries({ queryKey: ['user-stats'] });
    },
  });
}
