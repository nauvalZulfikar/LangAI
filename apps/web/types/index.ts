// String-based types (SQLite doesn't support enums)
export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
export type LessonType = 'VOCABULARY' | 'GRAMMAR' | 'LISTENING' | 'SPEAKING' | 'READING' | 'WRITING';
export type ProgressStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';

export interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  avatar: string | null;
  nativeLanguage: string;
  targetLanguage: string;
  currentLevel: CEFRLevel;
  xpTotal: number;
  streakCurrent: number;
  streakLongest: number;
  lastActivityAt: Date | null;
  dailyGoalMinutes: number;
  createdAt: Date;
}

export interface UserSettings {
  id: string;
  userId: string;
  notificationsEnabled: boolean;
  reminderTime: string;
  theme: string;
  uiLanguage: string;
}

export interface LessonContent {
  exercises: Exercise[];
}

export type ExerciseType =
  | 'multiple_choice'
  | 'fill_blank'
  | 'word_match'
  | 'sentence_builder'
  | 'listening_comprehension'
  | 'speaking_prompt'
  | 'reading_passage'
  | 'writing_prompt'
  | 'vocabulary_in_context';

export interface BaseExercise {
  type: ExerciseType;
}

export interface MultipleChoiceExercise extends BaseExercise {
  type: 'multiple_choice';
  question: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
}

export interface FillBlankExercise extends BaseExercise {
  type: 'fill_blank';
  sentence: string;
  answer: string;
  hint?: string;
}

export interface WordMatchExercise extends BaseExercise {
  type: 'word_match';
  pairs: Array<{ left: string; right: string }>;
}

export interface SentenceBuilderExercise extends BaseExercise {
  type: 'sentence_builder';
  words: string[];
  answer: string;
  translation: string;
}

export interface ListeningExercise extends BaseExercise {
  type: 'listening_comprehension';
  audioUrl?: string;
  transcript: string;
  question: string;
  options: string[];
  correctIndex: number;
}

export interface SpeakingPromptExercise extends BaseExercise {
  type: 'speaking_prompt';
  prompt: string;
  sampleAnswer?: string;
  targetWords?: string[];
}

export interface ReadingPassageExercise extends BaseExercise {
  type: 'reading_passage';
  passage?: string;
  title?: string;
  text?: string;
  questions: Array<{
    question: string;
    options: string[];
    correctIndex: number;
  }>;
}

export interface WritingPromptExercise extends BaseExercise {
  type: 'writing_prompt';
  prompt: string;
  sampleAnswer?: string;
}

export interface VocabInContextExercise extends BaseExercise {
  type: 'vocabulary_in_context';
  sentence: string;
  word: string;
  options: string[];
  correctIndex: number;
}

export type Exercise =
  | MultipleChoiceExercise
  | FillBlankExercise
  | WordMatchExercise
  | SentenceBuilderExercise
  | ListeningExercise
  | SpeakingPromptExercise
  | ReadingPassageExercise
  | WritingPromptExercise
  | VocabInContextExercise;

export interface LessonWithProgress {
  id: string;
  title: string;
  description: string;
  level: CEFRLevel;
  unit: number;
  order: number;
  type: LessonType;
  estimatedMinutes: number;
  xpReward: number;
  content: LessonContent;
  progress?: {
    status: ProgressStatus;
    score: number;
    completedAt: Date | null;
    attempts: number;
  } | null;
}

export interface FlashcardWithSRS {
  id: string;
  front: string;
  back: string;
  audioUrl: string | null;
  imageUrl: string | null;
  language: string;
  tags: string;
  srs: {
    id: string;
    interval: number;
    easeFactor: number;
    dueDate: Date;
    repetitions: number;
    lastReviewed: Date | null;
    correctStreak: number;
  };
}

export interface AchievementWithStatus {
  id: string;
  title: string;
  description: string;
  icon: string;
  xpReward: number;
  condition: Record<string, unknown>;
  unlocked: boolean;
  unlockedAt?: Date;
}

export interface ProgressSummary {
  totalLessons: number;
  completedLessons: number;
  totalXP: number;
  currentStreak: number;
  longestStreak: number;
  currentLevel: CEFRLevel;
  weeklyXP: number[];
  skillScores: {
    vocabulary: number;
    grammar: number;
    listening: number;
    speaking: number;
    reading: number;
    writing: number;
  };
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string | null;
  avatar: string | null;
  xpEarned: number;
  isCurrentUser: boolean;
}

export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
}

export interface WritingFeedback {
  overallScore: number;
  grammarScore: number;
  vocabularyScore: number;
  fluencyScore: number;
  corrections: Array<{
    original: string;
    corrected: string;
    explanation: string;
  }>;
  suggestions: string[];
  positives: string[];
}

export interface DailyChallengeData {
  id: string;
  type: string;
  content: Record<string, unknown>;
  xpReward: number;
  completed: boolean;
  score?: number;
}

export interface Notification {
  id: string;
  type: 'achievement' | 'streak' | 'reminder' | 'challenge' | 'level_up';
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
  data?: Record<string, unknown>;
}

export type GoalStatus = 'SUGGESTED' | 'ACTIVE' | 'COMPLETED' | 'FAILED' | 'SKIPPED';

export type TestCategory =
  | 'Vocabulary Recognition'
  | 'Vocabulary Production'
  | 'Grammar Accuracy'
  | 'Reading Comprehension'
  | 'Listening Comprehension'
  | 'Spoken Production'
  | 'Written Production'
  | 'Pragmatic/Contextual Use'
  | 'Discourse Coherence'
  | 'Transfer / Application';

export interface GoalCycleData {
  id: string;
  title: string;
  description: string;
  topic: string;
  cefrLevel: CEFRLevel;
  skillFocus: LessonType[];
  status: GoalStatus;
  durationDays: number;
  startedAt: string | null;
  deadlineAt: string | null;
  completedAt: string | null;
  xpMultiplier: number;
  passThreshold: number;
  sequenceNumber: number;
  progress: {
    totalLessons: number;
    completedLessons: number;
    daysElapsed: number;
    daysRemaining: number;
    percentComplete: number;
  };
}

export interface GoalDailyPlanData {
  id: string;
  dayNumber: number;
  date: string;
  lessons: Array<{
    id: string;
    title: string;
    type: LessonType;
    estimatedMinutes: number;
    completed: boolean;
  }>;
  rationale: string;
  isCompleted: boolean;
}

export interface GoalMasteryTestData {
  id: string;
  attempt: number;
  testCategories: TestCategory[];
  questions: Exercise[];
  score: number | null;
  passed: boolean | null;
}

// Session user extension
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
      xpTotal?: number;
      streakCurrent?: number;
      currentLevel?: CEFRLevel;
      targetLanguage?: string;
      nativeLanguage?: string;
      dailyGoalMinutes?: number;
    };
  }
}
