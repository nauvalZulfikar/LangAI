import { create } from 'zustand';
import { GoalCycleData, GoalDailyPlanData, GoalMasteryTestData } from '@/types';

interface GoalState {
  activeGoal: GoalCycleData | null;
  suggestedGoal: GoalCycleData | null;
  todayPlan: GoalDailyPlanData | null;
  currentTest: GoalMasteryTestData | null;
  showGoalCompleteModal: boolean;
  showTestResultModal: boolean;
  lastTestScore: number | null;
  lastTestPassed: boolean | null;
}

interface GoalActions {
  setActiveGoal: (goal: GoalCycleData | null) => void;
  setSuggestedGoal: (goal: GoalCycleData | null) => void;
  setTodayPlan: (plan: GoalDailyPlanData | null) => void;
  setCurrentTest: (test: GoalMasteryTestData | null) => void;
  setShowGoalCompleteModal: (show: boolean) => void;
  setShowTestResultModal: (show: boolean) => void;
  setTestResult: (score: number, passed: boolean) => void;
  reset: () => void;
}

const initialState: GoalState = {
  activeGoal: null,
  suggestedGoal: null,
  todayPlan: null,
  currentTest: null,
  showGoalCompleteModal: false,
  showTestResultModal: false,
  lastTestScore: null,
  lastTestPassed: null,
};

export const useGoalStore = create<GoalState & GoalActions>()((set) => ({
  ...initialState,

  setActiveGoal: (goal) => set({ activeGoal: goal }),
  setSuggestedGoal: (goal) => set({ suggestedGoal: goal }),
  setTodayPlan: (plan) => set({ todayPlan: plan }),
  setCurrentTest: (test) => set({ currentTest: test }),
  setShowGoalCompleteModal: (show) => set({ showGoalCompleteModal: show }),
  setShowTestResultModal: (show) => set({ showTestResultModal: show }),
  setTestResult: (score, passed) =>
    set({ lastTestScore: score, lastTestPassed: passed, showTestResultModal: true }),
  reset: () => set(initialState),
}));
