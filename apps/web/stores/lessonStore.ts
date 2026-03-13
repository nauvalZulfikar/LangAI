import { create } from 'zustand';
import { Exercise, LessonWithProgress } from '@/types';

interface LessonState {
  currentLesson: LessonWithProgress | null;
  currentExerciseIndex: number;
  answers: Record<number, unknown>;
  score: number;
  isCompleted: boolean;
  startedAt: Date | null;
  timeSpent: number;
}

interface LessonActions {
  setLesson: (lesson: LessonWithProgress) => void;
  nextExercise: () => void;
  prevExercise: () => void;
  submitAnswer: (index: number, answer: unknown, isCorrect: boolean) => void;
  completeLesson: () => void;
  resetLesson: () => void;
  tickTimer: () => void;
}

const initialState: LessonState = {
  currentLesson: null,
  currentExerciseIndex: 0,
  answers: {},
  score: 0,
  isCompleted: false,
  startedAt: null,
  timeSpent: 0,
};

export const useLessonStore = create<LessonState & LessonActions>()((set, get) => ({
  ...initialState,

  setLesson: (lesson) =>
    set({
      currentLesson: lesson,
      currentExerciseIndex: 0,
      answers: {},
      score: 0,
      isCompleted: false,
      startedAt: new Date(),
      timeSpent: 0,
    }),

  nextExercise: () => {
    const { currentLesson, currentExerciseIndex } = get();
    if (!currentLesson) return;
    const exercises = currentLesson.content.exercises;
    if (currentExerciseIndex < exercises.length - 1) {
      set({ currentExerciseIndex: currentExerciseIndex + 1 });
    }
  },

  prevExercise: () => {
    const { currentExerciseIndex } = get();
    if (currentExerciseIndex > 0) {
      set({ currentExerciseIndex: currentExerciseIndex - 1 });
    }
  },

  submitAnswer: (index, answer, isCorrect) => {
    set((state) => {
      const newAnswers = { ...state.answers, [index]: answer };
      const correctCount = Object.values({ ...newAnswers }).filter((_, i) => {
        return i === index ? isCorrect : state.answers[i] !== undefined;
      }).length;
      const totalAnswered = Object.keys(newAnswers).length;
      const newScore = totalAnswered > 0 ? Math.round((correctCount / totalAnswered) * 100) : 0;
      return { answers: newAnswers, score: newScore };
    });
  },

  completeLesson: () => set({ isCompleted: true }),

  resetLesson: () => set(initialState),

  tickTimer: () => set((state) => ({ timeSpent: state.timeSpent + 1 })),
}));
