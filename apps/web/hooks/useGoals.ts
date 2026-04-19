'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export function useActiveGoal() {
  return useQuery({
    queryKey: ['goals'],
    queryFn: async () => {
      const res = await fetch('/api/goals');
      if (!res.ok) throw new Error('Failed to fetch goals');
      return res.json();
    },
  });
}

export function useGenerateGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) throw new Error('Failed to generate goal');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
    },
  });
}

export function useAcceptGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (goalId: string) => {
      const res = await fetch(`/api/goals/${goalId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'accept' }),
      });
      if (!res.ok) throw new Error('Failed to accept goal');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
    },
  });
}

export function useSkipGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (goalId: string) => {
      const res = await fetch(`/api/goals/${goalId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'skip' }),
      });
      if (!res.ok) throw new Error('Failed to skip goal');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
    },
  });
}

export function useTodayPlan(goalId: string | null) {
  return useQuery({
    queryKey: ['daily-plan', goalId],
    queryFn: async () => {
      const res = await fetch(`/api/goals/${goalId}/daily-plan`);
      if (!res.ok) throw new Error('Failed to fetch daily plan');
      return res.json();
    },
    enabled: !!goalId,
  });
}

export function useGeneratePlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (goalId: string) => {
      const res = await fetch(`/api/goals/${goalId}/daily-plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) throw new Error('Failed to generate plan');
      return res.json();
    },
    onSuccess: (_, goalId) => {
      queryClient.invalidateQueries({ queryKey: ['daily-plan', goalId] });
    },
  });
}

export function useGoalProgress(goalId: string | null) {
  return useQuery({
    queryKey: ['goal-progress', goalId],
    queryFn: async () => {
      const res = await fetch(`/api/goals/${goalId}/progress`);
      if (!res.ok) throw new Error('Failed to fetch progress');
      return res.json();
    },
    enabled: !!goalId,
  });
}

export function useMasteryTest(goalId: string | null) {
  return useQuery({
    queryKey: ['mastery-test', goalId],
    queryFn: async () => {
      const res = await fetch(`/api/goals/${goalId}/mastery-test`);
      if (!res.ok) throw new Error('Failed to fetch test');
      return res.json();
    },
    enabled: !!goalId,
  });
}

export function useGenerateTest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (goalId: string) => {
      const res = await fetch(`/api/goals/${goalId}/mastery-test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) throw new Error('Failed to generate test');
      return res.json();
    },
    onSuccess: (_, goalId) => {
      queryClient.invalidateQueries({ queryKey: ['mastery-test', goalId] });
    },
  });
}

export function useSubmitTest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ goalId, testId, answers }: { goalId: string; testId: string; answers: unknown[] }) => {
      const res = await fetch(`/api/goals/${goalId}/mastery-test/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ testId, answers }),
      });
      if (!res.ok) throw new Error('Failed to submit test');
      return res.json();
    },
    onSuccess: (_, { goalId }) => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      queryClient.invalidateQueries({ queryKey: ['mastery-test', goalId] });
      queryClient.invalidateQueries({ queryKey: ['goal-progress', goalId] });
    },
  });
}
