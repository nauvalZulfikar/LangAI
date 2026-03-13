'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Check } from 'lucide-react';

const LANGUAGES = ['Spanish', 'French', 'German', 'Italian', 'Portuguese', 'Japanese', 'Mandarin', 'Korean'];
const NATIVE_LANGUAGES = ['English', 'Spanish', 'French', 'German', 'Portuguese', 'Arabic', 'Russian', 'Hindi'];
const GOALS = [
  { id: 'travel', icon: '✈️', label: 'Travel' },
  { id: 'career', icon: '💼', label: 'Career' },
  { id: 'culture', icon: '🎭', label: 'Culture' },
  { id: 'family', icon: '👨‍👩‍👧', label: 'Family' },
  { id: 'school', icon: '🎓', label: 'School' },
  { id: 'fun', icon: '🎮', label: 'Fun' },
];
const DAILY_GOALS = [
  { minutes: 5, label: 'Casual', desc: '5 min/day', emoji: '🌱' },
  { minutes: 10, label: 'Regular', desc: '10 min/day', emoji: '⚡' },
  { minutes: 20, label: 'Serious', desc: '20 min/day', emoji: '🔥' },
  { minutes: 30, label: 'Intense', desc: '30 min/day', emoji: '💪' },
];

const PLACEMENT_QUESTIONS = [
  {
    id: 1,
    question: 'Which sentence is correct?',
    options: ['Yo soy un estudiante.', 'Yo estar un estudiante.', 'Yo tengo un estudiante.', 'Yo soy estudiante un.'],
    correctIndex: 0,
    level: 'A1',
  },
  {
    id: 2,
    question: 'What does "¿Cuándo llegaste?" mean?',
    options: ['Where are you going?', 'When did you arrive?', 'How long have you been here?', 'Why are you late?'],
    correctIndex: 1,
    level: 'A2',
  },
  {
    id: 3,
    question: 'Choose the correct form: "Si ___ más tiempo, estudiaría más."',
    options: ['tengo', 'tuve', 'tuviera', 'tendría'],
    correctIndex: 2,
    level: 'B1',
  },
  {
    id: 4,
    question: 'Which sentence uses the subjunctive correctly?',
    options: [
      'Espero que él viene mañana.',
      'Espero que él venga mañana.',
      'Espero que él vendría mañana.',
      'Espero que él vino mañana.',
    ],
    correctIndex: 1,
    level: 'B2',
  },
  {
    id: 5,
    question: 'What is the meaning of "No obstante los contratiempos, perseveró"?',
    options: [
      'Because of the setbacks, he gave up.',
      'Despite the setbacks, he persevered.',
      'After the setbacks, he recovered.',
      'Without setbacks, he continued.',
    ],
    correctIndex: 1,
    level: 'C1',
  },
];

type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

function determineCEFRLevel(answers: number[]): CEFRLevel {
  let correctCount = 0;
  for (let i = 0; i < PLACEMENT_QUESTIONS.length; i++) {
    if (answers[i] === PLACEMENT_QUESTIONS[i].correctIndex) correctCount++;
  }
  if (correctCount === 0) return 'A1';
  if (correctCount === 1) return 'A1';
  if (correctCount === 2) return 'A2';
  if (correctCount === 3) return 'B1';
  if (correctCount === 4) return 'B2';
  return 'C1';
}

export default function OnboardingPage() {
  const router = useRouter();
  const { update } = useSession();
  const [step, setStep] = useState(0);
  const [targetLanguage, setTargetLanguage] = useState('Spanish');
  const [nativeLanguage, setNativeLanguage] = useState('English');
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [dailyGoalMinutes, setDailyGoalMinutes] = useState(10);
  const [placementAnswers, setPlacementAnswers] = useState<number[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const steps = ['Language', 'Native', 'Goals', 'Daily Goal', 'Placement Test', 'All Set!'];
  const totalSteps = steps.length;

  const handleNext = () => setStep((s) => Math.min(s + 1, totalSteps - 1));
  const handleBack = () => setStep((s) => Math.max(s - 1, 0));

  const toggleGoal = (id: string) => {
    setSelectedGoals((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]
    );
  };

  const handlePlacementAnswer = (index: number) => {
    const newAnswers = [...placementAnswers, index];
    setPlacementAnswers(newAnswers);
    if (currentQuestion < PLACEMENT_QUESTIONS.length - 1) {
      setCurrentQuestion((q) => q + 1);
    } else {
      handleNext();
    }
  };

  const handleFinish = async () => {
    setIsLoading(true);
    const level = determineCEFRLevel(placementAnswers);
    try {
      await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetLanguage,
          nativeLanguage,
          dailyGoalMinutes,
          currentLevel: level,
        }),
      });
      await update();
      router.push('/dashboard');
    } catch {
      setIsLoading(false);
    }
  };

  const slideVariants = {
    enter: { opacity: 0, x: 40 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -40 },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex flex-col items-center justify-center px-4 py-12">
      {/* Progress */}
      <div className="w-full max-w-lg mb-8">
        <div className="flex items-center justify-between mb-2 text-sm text-gray-500 dark:text-gray-400">
          <span>Step {step + 1} of {totalSteps}</span>
          <span>{steps[step]}</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <motion.div
            className="gradient-primary h-2 rounded-full"
            animate={{ width: `${((step + 1) / totalSteps) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      <div className="w-full max-w-lg bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3 }}
            className="p-8"
          >
            {/* Step 0: Target Language */}
            {step === 0 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">What do you want to learn?</h2>
                <p className="text-gray-500 dark:text-gray-400 mb-6">Choose your target language</p>
                <div className="grid grid-cols-2 gap-3">
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang}
                      onClick={() => setTargetLanguage(lang)}
                      className={`p-3 rounded-xl border-2 text-sm font-medium transition-all ${
                        targetLanguage === lang
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                          : 'border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-primary-300'
                      }`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 1: Native Language */}
            {step === 1 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">What is your native language?</h2>
                <p className="text-gray-500 dark:text-gray-400 mb-6">We'll tailor explanations for you</p>
                <div className="grid grid-cols-2 gap-3">
                  {NATIVE_LANGUAGES.map((lang) => (
                    <button
                      key={lang}
                      onClick={() => setNativeLanguage(lang)}
                      className={`p-3 rounded-xl border-2 text-sm font-medium transition-all ${
                        nativeLanguage === lang
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                          : 'border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-primary-300'
                      }`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Goals */}
            {step === 2 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Why are you learning?</h2>
                <p className="text-gray-500 dark:text-gray-400 mb-6">Select all that apply</p>
                <div className="grid grid-cols-3 gap-3">
                  {GOALS.map((goal) => (
                    <button
                      key={goal.id}
                      onClick={() => toggleGoal(goal.id)}
                      className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 text-sm font-medium transition-all ${
                        selectedGoals.includes(goal.id)
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                          : 'border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-primary-300'
                      }`}
                    >
                      <span className="text-2xl">{goal.icon}</span>
                      {goal.label}
                      {selectedGoals.includes(goal.id) && (
                        <div className="absolute top-1 right-1 w-4 h-4 bg-primary-500 rounded-full flex items-center justify-center">
                          <Check className="w-2.5 h-2.5 text-white" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3: Daily Goal */}
            {step === 3 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Set your daily goal</h2>
                <p className="text-gray-500 dark:text-gray-400 mb-6">Consistency is key to fluency</p>
                <div className="space-y-3">
                  {DAILY_GOALS.map((goal) => (
                    <button
                      key={goal.minutes}
                      onClick={() => setDailyGoalMinutes(goal.minutes)}
                      className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all ${
                        dailyGoalMinutes === goal.minutes
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30'
                          : 'border-gray-200 dark:border-gray-600 hover:border-primary-300'
                      }`}
                    >
                      <span className="text-2xl">{goal.emoji}</span>
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-white">{goal.label}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{goal.desc}</div>
                      </div>
                      {dailyGoalMinutes === goal.minutes && (
                        <div className="ml-auto w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center">
                          <Check className="w-3.5 h-3.5 text-white" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 4: Placement Test */}
            {step === 4 && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Quick Placement Test</h2>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {currentQuestion + 1}/{PLACEMENT_QUESTIONS.length}
                  </span>
                </div>
                <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">
                  Help us find the right level for you
                </p>
                <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-1.5 mb-6">
                  <div
                    className="gradient-primary h-1.5 rounded-full transition-all"
                    style={{ width: `${((currentQuestion) / PLACEMENT_QUESTIONS.length) * 100}%` }}
                  />
                </div>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentQuestion}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 mb-4">
                      <span className="text-xs font-medium text-primary-500 uppercase tracking-wider">
                        Level {PLACEMENT_QUESTIONS[currentQuestion].level}
                      </span>
                      <p className="font-semibold text-gray-900 dark:text-white mt-1">
                        {PLACEMENT_QUESTIONS[currentQuestion].question}
                      </p>
                    </div>
                    <div className="space-y-2">
                      {PLACEMENT_QUESTIONS[currentQuestion].options.map((opt, i) => (
                        <button
                          key={i}
                          onClick={() => handlePlacementAnswer(i)}
                          className="w-full text-left p-3 rounded-xl border border-gray-200 dark:border-gray-600 text-sm text-gray-700 dark:text-gray-300 hover:border-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all"
                        >
                          <span className="font-medium text-gray-400 mr-2">{String.fromCharCode(65 + i)}.</span>
                          {opt}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => {
                        handlePlacementAnswer(-1);
                      }}
                      className="mt-3 text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      Skip question →
                    </button>
                  </motion.div>
                </AnimatePresence>
              </div>
            )}

            {/* Step 5: All Set */}
            {step === 5 && (
              <div className="text-center py-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                  className="text-7xl mb-6"
                >
                  🎉
                </motion.div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">You&apos;re all set!</h2>
                <p className="text-gray-500 dark:text-gray-400 mb-2">
                  Your personalized {targetLanguage} journey is ready.
                </p>
                <div className="bg-primary-50 dark:bg-primary-900/20 rounded-xl p-4 mb-6 text-left space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Learning:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{targetLanguage}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Level:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {determineCEFRLevel(placementAnswers)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Daily goal:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{dailyGoalMinutes} min/day</span>
                  </div>
                </div>
                <button
                  onClick={handleFinish}
                  disabled={isLoading}
                  className="w-full gradient-primary text-white py-4 rounded-xl font-bold text-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {isLoading ? 'Setting up...' : 'Start Learning →'}
                </button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation Buttons */}
        {step < 4 && (
          <div className="px-8 pb-8 flex items-center justify-between">
            {step > 0 ? (
              <button
                onClick={handleBack}
                className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors text-sm font-medium"
              >
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
            ) : (
              <div />
            )}
            <button
              onClick={handleNext}
              className="flex items-center gap-2 gradient-primary text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity"
            >
              {step === 3 ? 'Take Placement Test' : 'Continue'}
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
