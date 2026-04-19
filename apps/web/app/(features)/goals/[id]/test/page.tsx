'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useGenerateTest, useMasteryTest, useSubmitTest } from '@/hooks/useGoals';
import { useGoalStore } from '@/stores/goalStore';
import { TestResultCard } from '@/components/goals/TestResultCard';
import { GoalCompleteModal } from '@/components/goals/GoalCompleteModal';
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';

export default function MasteryTestPage() {
  const params = useParams();
  const router = useRouter();
  const goalId = params.id as string;

  const { data: testData, isLoading: testLoading } = useMasteryTest(goalId);
  const generateTest = useGenerateTest();
  const submitTest = useSubmitTest();
  const { setShowGoalCompleteModal } = useGoalStore();

  const [currentIndex, setCurrentIndex] = useState(0);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [answers, setAnswers] = useState<any[]>([]);
  const [submitted, setSubmitted] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [result, setResult] = useState<any>(null);

  const test = testData?.noTest ? null : testData;
  const questions = test?.questions ?? [];

  useEffect(() => {
    if (questions.length > 0 && answers.length === 0) {
      setAnswers(new Array(questions.length).fill(null));
    }
  }, [questions.length, answers.length]);

  const handleGenerate = () => {
    generateTest.mutate(goalId);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const setAnswer = (index: number, answer: any) => {
    setAnswers((prev) => {
      const next = [...prev];
      next[index] = answer;
      return next;
    });
  };

  const handleSubmit = async () => {
    if (!test?.id) return;
    const res = await submitTest.mutateAsync({ goalId, testId: test.id, answers });
    setResult(res);
    setSubmitted(true);
    if (res.goalCompleted) {
      setShowGoalCompleteModal(true);
    }
  };

  if (testLoading) {
    return (
      <div className="max-w-3xl mx-auto flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (submitted && result) {
    return (
      <div className="max-w-3xl mx-auto">
        <TestResultCard
          score={result.score}
          passed={result.passed}
          xpEarned={result.xpEarned}
          goalId={goalId}
          passThreshold={70}
        />
        <GoalCompleteModal
          xpEarned={result.xpEarned ?? 0}
          goalTitle=""
          score={result.score}
        />
      </div>
    );
  }

  if (!test || testData?.noTest) {
    return (
      <div className="max-w-3xl mx-auto text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Mastery Test</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          Generate a transfer-of-learning test to prove your mastery.
        </p>
        <button
          onClick={handleGenerate}
          disabled={generateTest.isPending}
          className="py-3 px-8 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50"
        >
          {generateTest.isPending ? 'Generating...' : 'Generate Test'}
        </button>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => router.push(`/goals/${goalId}`)}
          className="text-sm text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Goal
        </button>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          Question {currentIndex + 1} of {questions.length}
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2 mb-6">
        <div
          className="gradient-primary h-2 rounded-full transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
        />
      </div>

      {/* Exercise rendering */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 mb-6">
        {currentQuestion?.type === 'multiple_choice' && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">{currentQuestion.question}</h3>
            <div className="space-y-2">
              {currentQuestion.options?.map((option: string, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setAnswer(currentIndex, { selectedIndex: idx })}
                  className={`w-full text-left p-3 rounded-xl border transition-colors ${
                    answers[currentIndex]?.selectedIndex === idx
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        )}

        {currentQuestion?.type === 'fill_blank' && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">{currentQuestion.sentence}</h3>
            {currentQuestion.hint && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Hint: {currentQuestion.hint}</p>
            )}
            <input
              type="text"
              value={answers[currentIndex]?.text ?? ''}
              onChange={(e) => setAnswer(currentIndex, { text: e.target.value })}
              className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              placeholder="Type your answer..."
            />
          </div>
        )}

        {currentQuestion?.type === 'word_match' && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Match the words</h3>
            <div className="space-y-2">
              {currentQuestion.pairs?.map((pair: { left: string; right: string }, idx: number) => (
                <div key={idx} className="flex items-center gap-3">
                  <span className="flex-1 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm">{pair.left}</span>
                  <input
                    type="text"
                    value={answers[currentIndex]?.pairs?.[idx]?.right ?? ''}
                    onChange={(e) => {
                      const pairs = [...(answers[currentIndex]?.pairs ?? currentQuestion.pairs.map(() => ({ right: '' })))];
                      pairs[idx] = { right: e.target.value };
                      setAnswer(currentIndex, { pairs });
                    }}
                    className="flex-1 p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
                    placeholder="Match..."
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {currentQuestion?.type === 'sentence_builder' && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Build the sentence</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Translation: {currentQuestion.translation}</p>
            <div className="flex flex-wrap gap-2 mb-4">
              {currentQuestion.words?.map((word: string, idx: number) => (
                <span key={idx} className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm">
                  {word}
                </span>
              ))}
            </div>
            <input
              type="text"
              value={answers[currentIndex]?.text ?? ''}
              onChange={(e) => setAnswer(currentIndex, { text: e.target.value })}
              className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              placeholder="Type the sentence..."
            />
          </div>
        )}

        {currentQuestion?.type === 'reading_passage' && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {currentQuestion.title}
            </h3>
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl mb-4 text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
              {currentQuestion.text}
            </div>
            <div className="space-y-4">
              {currentQuestion.questions?.map((q: { question: string; options: string[]; correctIndex: number }, qIdx: number) => (
                <div key={qIdx}>
                  <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">{q.question}</p>
                  <div className="space-y-1">
                    {q.options?.map((opt: string, oIdx: number) => (
                      <button
                        key={oIdx}
                        onClick={() => {
                          const subAnswers = [...(answers[currentIndex]?.answers ?? [])];
                          subAnswers[qIdx] = oIdx;
                          setAnswer(currentIndex, { answers: subAnswers });
                        }}
                        className={`w-full text-left p-2 rounded-lg border text-sm transition-colors ${
                          answers[currentIndex]?.answers?.[qIdx] === oIdx
                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                            : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {(currentQuestion?.type === 'writing_prompt' || currentQuestion?.type === 'speaking_prompt') && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">{currentQuestion.prompt}</h3>
            <textarea
              value={answers[currentIndex]?.text ?? ''}
              onChange={(e) => setAnswer(currentIndex, { text: e.target.value })}
              rows={4}
              className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
              placeholder="Write your response..."
            />
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
          disabled={currentIndex === 0}
          className="flex items-center gap-1 py-2 px-4 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-30"
        >
          <ArrowLeft className="w-4 h-4" /> Previous
        </button>

        {currentIndex < questions.length - 1 ? (
          <button
            onClick={() => setCurrentIndex((i) => Math.min(questions.length - 1, i + 1))}
            className="flex items-center gap-1 py-2.5 px-6 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-medium transition-colors"
          >
            Next <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={submitTest.isPending}
            className="py-2.5 px-6 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50"
          >
            {submitTest.isPending ? 'Submitting...' : 'Submit Test'}
          </button>
        )}
      </div>
    </div>
  );
}
