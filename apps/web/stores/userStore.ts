import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CEFRLevel } from '@/types';

interface UserState {
  id: string | null;
  name: string | null;
  email: string | null;
  avatar: string | null;
  xpTotal: number;
  streakCurrent: number;
  streakLongest: number;
  currentLevel: CEFRLevel;
  targetLanguage: string;
  nativeLanguage: string;
  dailyGoalMinutes: number;
  pendingXP: number;
  showXPPopup: boolean;
  showLevelUp: boolean;
  newAchievement: { title: string; description: string; icon: string } | null;
}

interface UserActions {
  setUser: (user: Partial<UserState>) => void;
  addXP: (amount: number) => void;
  clearPendingXP: () => void;
  setShowXPPopup: (show: boolean) => void;
  setShowLevelUp: (show: boolean) => void;
  setNewAchievement: (achievement: { title: string; description: string; icon: string } | null) => void;
  incrementStreak: () => void;
  reset: () => void;
}

const initialState: UserState = {
  id: null,
  name: null,
  email: null,
  avatar: null,
  xpTotal: 0,
  streakCurrent: 0,
  streakLongest: 0,
  currentLevel: 'A1' as CEFRLevel,
  targetLanguage: 'Spanish',
  nativeLanguage: 'English',
  dailyGoalMinutes: 10,
  pendingXP: 0,
  showXPPopup: false,
  showLevelUp: false,
  newAchievement: null,
};

export const useUserStore = create<UserState & UserActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      setUser: (user) => set((state) => ({ ...state, ...user })),

      addXP: (amount) => {
        set((state) => ({
          xpTotal: state.xpTotal + amount,
          pendingXP: amount,
          showXPPopup: true,
        }));
      },

      clearPendingXP: () => set({ pendingXP: 0, showXPPopup: false }),

      setShowXPPopup: (show) => set({ showXPPopup: show }),

      setShowLevelUp: (show) => set({ showLevelUp: show }),

      setNewAchievement: (achievement) => set({ newAchievement: achievement }),

      incrementStreak: () => {
        set((state) => {
          const newStreak = state.streakCurrent + 1;
          return {
            streakCurrent: newStreak,
            streakLongest: Math.max(state.streakLongest, newStreak),
          };
        });
      },

      reset: () => set(initialState),
    }),
    {
      name: 'linguaflow-user',
      partialize: (state) => ({
        id: state.id,
        name: state.name,
        email: state.email,
        avatar: state.avatar,
        xpTotal: state.xpTotal,
        streakCurrent: state.streakCurrent,
        streakLongest: state.streakLongest,
        currentLevel: state.currentLevel,
        targetLanguage: state.targetLanguage,
        nativeLanguage: state.nativeLanguage,
        dailyGoalMinutes: state.dailyGoalMinutes,
      }),
    }
  )
);
