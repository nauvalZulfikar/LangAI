'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PenLine, Send, ChevronDown, ChevronUp, BookOpen } from 'lucide-react';
import { WritingFeedback } from '@/types';
import { formatRelativeDate } from '@/lib/utils';

interface WritingEntry {
  id: string;
  content: string;
  createdAt: string;
  aiFeedback: WritingFeedback | null;
}

const PROMPTS = [
  'Describe tu día perfecto en detalle.',
  'Escribe sobre un recuerdo importante de tu infancia.',
  'Habla de tus planes para el futuro.',
  'Describe tu ciudad o pueblo natal.',
  '¿Cuál es tu comida favorita y por qué?',
  'Escribe sobre una persona que te inspira.',
  'Describe un viaje que te gustaría hacer.',
  '¿Qué harías si pudieras vivir en cualquier país del mundo?',
];

export default function WritingPage() {
  const [text, setText] = useState('');
  const [entries, setEntries] = useState<WritingEntry[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<WritingFeedback | null>(null);
  const [expandedEntry, setExpandedEntry] = useState<string | null>(null);
  const [isLoadingEntries, setIsLoadingEntries] = useState(true);
  const [randomPrompt, setRandomPrompt] = useState('');

  useEffect(() => {
    setRandomPrompt(PROMPTS[Math.floor(Math.random() * PROMPTS.length)]);
    fetch('/api/user/stats')
      .then((r) => r.json())
      .then((data) => {
        setEntries(data.writingEntries ?? []);
        setIsLoadingEntries(false);
      })
      .catch(() => setIsLoadingEntries(false));
  }, []);

  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;

  const handleSubmit = async () => {
    if (wordCount < 20 || isSubmitting) return;
    setIsSubmitting(true);
    setFeedback(null);

    try {
      const res = await fetch('/api/ai/writing/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, language: 'Spanish' }),
      });
      const data = await res.json();
      setFeedback(data);

      // Save entry
      const saveRes = await fetch('/api/user/stats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: text, aiFeedback: data, language: 'Spanish' }),
      });
      if (saveRes.ok) {
        const savedEntry = await saveRes.json();
        setEntries((prev) => [savedEntry, ...prev]);
      }
    } catch {
      setFeedback({
        overallScore: 0,
        grammarScore: 0,
        vocabularyScore: 0,
        fluencyScore: 0,
        corrections: [],
        suggestions: ['Unable to get AI feedback at this time.'],
        positives: ['Your entry has been saved.'],
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const ScoreBar = ({ label, score }: { label: string; score: number }) => (
    <div>
      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
        <span>{label}</span>
        <span className="font-medium">{score}/100</span>
      </div>
      <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-1.5">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.8 }}
          className={`h-1.5 rounded-full ${score >= 80 ? 'bg-success-DEFAULT' : score >= 60 ? 'bg-warning-DEFAULT' : 'bg-red-400'}`}
        />
      </div>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Writing Journal</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
          Write in Spanish and get instant AI feedback
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Editor */}
        <div className="lg:col-span-3 space-y-4">
          {/* Random prompt */}
          <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-100 dark:border-primary-800 rounded-xl p-4">
            <div className="flex items-start gap-2">
              <PenLine className="w-4 h-4 text-primary-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-medium text-primary-600 dark:text-primary-400 uppercase tracking-wider mb-1">Writing Prompt</p>
                <p className="text-sm text-gray-700 dark:text-gray-300">{randomPrompt}</p>
              </div>
            </div>
          </div>

          <div>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Comienza a escribir en español..."
              rows={12}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none transition text-sm leading-relaxed"
            />
            <div className="flex items-center justify-between mt-2 text-xs text-gray-400">
              <span>{wordCount} words {wordCount < 20 && '(min 20 words)'}</span>
              <button
                onClick={() => {
                  setRandomPrompt(PROMPTS[Math.floor(Math.random() * PROMPTS.length)]);
                }}
                className="hover:text-primary-500 transition-colors"
              >
                New prompt
              </button>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={wordCount < 20 || isSubmitting}
            className="w-full flex items-center justify-center gap-2 gradient-primary text-white py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity disabled:opacity-40"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" /> Submit for AI Feedback
              </>
            )}
          </button>

          {/* AI Feedback */}
          <AnimatePresence>
            {feedback && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-gray-900 dark:text-white">AI Feedback</h3>
                  <div className={`text-2xl font-bold ${feedback.overallScore >= 80 ? 'text-success-DEFAULT' : feedback.overallScore >= 60 ? 'text-warning-DEFAULT' : 'text-red-500'}`}>
                    {feedback.overallScore}/100
                  </div>
                </div>

                <div className="space-y-2">
                  <ScoreBar label="Grammar" score={feedback.grammarScore} />
                  <ScoreBar label="Vocabulary" score={feedback.vocabularyScore} />
                  <ScoreBar label="Fluency" score={feedback.fluencyScore} />
                </div>

                {feedback.positives.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-success-DEFAULT uppercase tracking-wider mb-2">Strengths</p>
                    <ul className="space-y-1">
                      {feedback.positives.map((p, i) => (
                        <li key={i} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                          <span className="text-success-DEFAULT">✓</span> {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {feedback.corrections.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-red-500 uppercase tracking-wider mb-2">Corrections</p>
                    <ul className="space-y-2">
                      {feedback.corrections.map((c, i) => (
                        <li key={i} className="text-sm bg-red-50 dark:bg-red-900/20 rounded-lg p-3">
                          <span className="line-through text-red-500">{c.original}</span>
                          <span className="mx-2 text-gray-400">→</span>
                          <span className="text-success-DEFAULT font-medium">{c.corrected}</span>
                          <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">{c.explanation}</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {feedback.suggestions.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-primary-500 uppercase tracking-wider mb-2">Suggestions</p>
                    <ul className="space-y-1">
                      {feedback.suggestions.map((s, i) => (
                        <li key={i} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                          <span className="text-primary-500">💡</span> {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Journal entries sidebar */}
        <div className="lg:col-span-2">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <BookOpen className="w-4 h-4" /> Past Entries
          </h2>

          {isLoadingEntries ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-gray-100 dark:bg-gray-700 rounded-xl h-20 animate-pulse" />
              ))}
            </div>
          ) : entries.length === 0 ? (
            <div className="text-center py-8 text-gray-400 dark:text-gray-500">
              <PenLine className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No entries yet. Start writing!</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[600px] overflow-y-auto scrollbar-hide">
              {entries.map((entry) => (
                <div
                  key={entry.id}
                  className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden"
                >
                  <button
                    onClick={() => setExpandedEntry(expandedEntry === entry.id ? null : entry.id)}
                    className="w-full text-left p-4"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">{entry.content}</p>
                      {expandedEntry === entry.id ? (
                        <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      {formatRelativeDate(entry.createdAt)}
                      {entry.aiFeedback && (
                        <span className="ml-2 text-primary-500 font-medium">Score: {(entry.aiFeedback as WritingFeedback).overallScore}/100</span>
                      )}
                    </p>
                  </button>
                  {expandedEntry === entry.id && (
                    <div className="px-4 pb-4 border-t border-gray-50 dark:border-gray-700">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">{entry.content}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
