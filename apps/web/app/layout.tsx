import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'LinguaFlow — Learn Languages with AI',
  description: 'Master Spanish with AI-powered lessons, spaced repetition, and real conversation practice.',
  keywords: ['language learning', 'Spanish', 'AI tutor', 'spaced repetition', 'CEFR'],
  authors: [{ name: 'LinguaFlow' }],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'LinguaFlow',
  },
  openGraph: {
    title: 'LinguaFlow — Learn Languages with AI',
    description: 'Master Spanish with AI-powered lessons, spaced repetition, and real conversation practice.',
    type: 'website',
  },
};

export const viewport: Viewport = {
  themeColor: '#6C63FF',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
