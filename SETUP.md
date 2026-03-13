# LinguaFlow — Setup Guide

## Prerequisites
- Node.js 18+
- PostgreSQL database (local or Supabase)
- pnpm (recommended) or npm

## 1. Install dependencies
```bash
cd "d:/Downloads/coding project/LangAI"
npm install
```

## 2. Configure environment variables
```bash
cp apps/web/.env.example apps/web/.env.local
```
Fill in all values in `apps/web/.env.local`.

## 3. Push database schema
```bash
cd apps/web
npx prisma generate
npx prisma db push
```

## 4. Seed the database
```bash
npx ts-node --compiler-options '{"module":"CommonJS"}' ../../prisma/seed.ts
```
Or from root:
```bash
npm run db:seed
```

## 5. Run development server
```bash
npm run dev
```
Visit http://localhost:3000

## Key routes
- `/` — Landing page (redirects to dashboard if authenticated)
- `/login` — Sign in (Google OAuth or magic link email)
- `/register` — Sign up
- `/onboarding` — 6-step onboarding with placement test
- `/dashboard` — Main dashboard
- `/lessons` — Lesson list by unit/level
- `/lessons/[id]` — Interactive lesson player
- `/flashcards` — SRS flashcard session
- `/speaking` — AI conversation partner (GPT-4o)
- `/writing` — Writing journal with AI feedback
- `/progress` — Level roadmap + achievements
- `/leaderboard` — Weekly XP rankings
- `/settings` — Account & preferences
- `/notifications` — Notification center

## API routes
All under `/api/`:
- `auth/[...nextauth]` — NextAuth
- `user/profile` — GET/PATCH user profile
- `user/stats` — GET stats, POST writing entry
- `lessons` — GET lessons list
- `lessons/[id]` — GET lesson
- `lessons/[id]/complete` — POST complete lesson
- `flashcards/due` — GET due flashcards
- `flashcards/review` — POST rate flashcard (SM-2)
- `srs/session` — GET session info
- `srs/rate` — POST rate card
- `ai/speaking` — POST AI conversation
- `ai/writing/evaluate` — POST AI writing feedback
- `progress/summary` — GET progress summary
- `progress/skills` — GET skill scores
- `leaderboard/global` — GET weekly leaderboard
- `achievements` — GET all achievements
- `achievements/check` — POST check for new unlocks
- `daily-challenge` — GET today's challenge
- `daily-challenge/submit` — POST submit challenge
- `notifications` — GET notifications
