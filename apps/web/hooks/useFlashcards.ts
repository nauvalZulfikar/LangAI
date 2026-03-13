'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export function useDueFlashcards() {
  return useQuery({
    queryKey: ['flashcards-due'],
    queryFn: async () => {
      const res = await fetch('/api/flashcards/due');
      if (!res.ok) throw new Error('Failed to fetch flashcards');
      return res.json();
    },
    staleTime: 30 * 1000,
  });
}

export function useReviewFlashcard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ flashcardId, quality }: { flashcardId: string; quality: number }) => {
      const res = await fetch('/api/flashcards/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ flashcardId, quality }),
      });
      if (!res.ok) throw new Error('Failed to review flashcard');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flashcards-due'] });
      queryClient.invalidateQueries({ queryKey: ['srs-session'] });
    },
  });
}

export function useSRSSession() {
  return useQuery({
    queryKey: ['srs-session'],
    queryFn: async () => {
      const res = await fetch('/api/srs/session');
      if (!res.ok) throw new Error('Failed to fetch SRS session');
      return res.json();
    },
  });
}
