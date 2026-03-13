'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/dashboard');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Navbar */}
      <nav className="container mx-auto px-4 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-lg">L</span>
          </div>
          <span className="text-xl font-bold text-gray-900 dark:text-white">LinguaFlow</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-gray-600 dark:text-gray-300 hover:text-primary-500 transition-colors font-medium">
            Sign In
          </Link>
          <Link
            href="/register"
            className="bg-primary-500 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-primary-600 transition-colors"
          >
            Get Started Free
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <main className="container mx-auto px-4 pt-16 pb-24 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="inline-flex items-center gap-2 bg-primary-50 dark:bg-primary-900/30 border border-primary-200 dark:border-primary-700 rounded-full px-4 py-2 mb-8">
            <span className="text-2xl">🌟</span>
            <span className="text-primary-700 dark:text-primary-300 font-medium text-sm">AI-Powered Language Learning</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 dark:text-white mb-6 leading-tight">
            Speak Spanish
            <br />
            <span className="text-transparent bg-clip-text gradient-primary">Fluently & Fast</span>
          </h1>

          <p className="text-xl text-gray-600 dark:text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed">
            Master Spanish with personalized AI lessons, spaced repetition flashcards, and real conversation practice. From A1 beginner to C1 advanced.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link
              href="/register"
              className="bg-primary-500 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-primary-600 transition-all hover:shadow-lg hover:shadow-primary-200 dark:hover:shadow-primary-900"
            >
              Start Learning for Free →
            </Link>
            <Link
              href="/login"
              className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-8 py-4 rounded-2xl font-bold text-lg border border-gray-200 dark:border-gray-700 hover:border-primary-300 transition-all"
            >
              Sign In
            </Link>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto text-left">
            {[
              {
                icon: '🧠',
                title: 'Smart Spaced Repetition',
                desc: 'Our SM-2 algorithm ensures you review words at the perfect time for maximum retention.',
              },
              {
                icon: '🗣️',
                title: 'AI Conversation Partner',
                desc: 'Practice speaking with our GPT-4 powered AI that gives real-time pronunciation feedback.',
              },
              {
                icon: '🏆',
                title: 'Gamified Progress',
                desc: 'Earn XP, maintain streaks, unlock achievements, and compete on the global leaderboard.',
              },
            ].map((feature) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700"
              >
                <div className="text-4xl mb-3">{feature.icon}</div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </main>
    </div>
  );
}
