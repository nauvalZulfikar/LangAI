# 🌐 LinguaFlow — AI Language Learning Platform
## Master Build Prompt for Agentic AI (Claude / Copilot / Cursor)

> **Instructions for AI Agent:** Read this entire document before writing a single line of code.
> Build every feature described here. Do not skip sections. Ask clarifying questions only if
> there is a genuine blocker — otherwise, make the best architectural decision and proceed.

---

## 0. PROJECT OVERVIEW

Build a full-stack, production-ready **language learning web application** called **LinguaFlow**.

The platform guides users from complete beginner (A1) to expert (C2) using scientifically
proven methods: Spaced Repetition, Active Recall, Comprehensible Input, and Gamification.

Users must feel motivated to open the app every single day.

---

## 1. TECH STACK

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router) + TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Backend | Next.js API Routes (or tRPC) |
| Database | PostgreSQL via Prisma ORM |
| Auth | NextAuth.js (Google + Email Magic Link) |
| AI Features | OpenAI API (gpt-4o) |
| Audio | Web Speech API + Eleven Labs API (TTS) |
| State | Zustand (client) + React Query (server) |
| Animations | Framer Motion |
| Testing | Vitest + Playwright (E2E) |
| Deployment | Vercel + Supabase (PostgreSQL) |

Use monorepo structure with `apps/web` and `packages/` for shared logic.

---

## 2. DATABASE SCHEMA (Prisma)

Generate a complete `schema.prisma` file with the following models:

```
User
  - id, email, name, avatar, createdAt
  - nativeLanguage, targetLanguage
  - currentLevel (ENUM: A1 A2 B1 B2 C1 C2)
  - xpTotal, streakCurrent, streakLongest
  - lastActivityAt, dailyGoalMinutes

UserSettings
  - userId (1:1), notificationsEnabled, reminderTime
  - theme (light/dark), uiLanguage

Lesson
  - id, title, description, level, unit, order
  - type (ENUM: VOCABULARY GRAMMAR LISTENING SPEAKING READING WRITING)
  - estimatedMinutes, xpReward, content (JSON)

UserLessonProgress
  - userId, lessonId, status (NOT_STARTED / IN_PROGRESS / COMPLETED)
  - score, completedAt, attempts

Flashcard
  - id, front, back, audioUrl, imageUrl
  - lessonId, language, tags (String[])

UserFlashcard (SRS tracking)
  - userId, flashcardId
  - interval (days), easeFactor, dueDate
  - repetitions, lastReviewed, correctStreak

Achievement
  - id, title, description, icon, xpReward, condition (JSON)

UserAchievement
  - userId, achievementId, unlockedAt

AIConversation
  - id, userId, language, scenario, messages (JSON), createdAt

WritingEntry
  - id, userId, content, language, aiFeedback (JSON), createdAt

DailyChallenge
  - id, date, type, content (JSON), xpReward

UserDailyChallenge
  - userId, challengeId, completedAt, score

Leaderboard (weekly snapshot)
  - userId, weekStart, xpEarned, rank
```

---

## 3. FEATURE MODULES

Build each module as a self-contained feature folder under `app/(features)/`.

---

### MODULE 1: ONBOARDING & PLACEMENT TEST

**File:** `app/(features)/onboarding/`

**Flow:**
1. Welcome screen with language selection (support: English, Spanish, French, Japanese, Mandarin, Arabic, German, Korean)
2. Native language picker
3. Goal selection: Travel / Career / Education / Hobby / Fluency
4. Daily time commitment: 5 / 10 / 15 / 20 / 30 min
5. Placement test: 20 adaptive questions across grammar, vocabulary, reading
   - Questions get harder/easier based on right/wrong answers (IRT model: simple 3-tier)
   - At end, assign CEFR level (A1–C2)
6. Personalized "learning path" summary screen before dashboard

**Requirements:**
- Entire onboarding < 3 minutes
- Progress bar at top showing step X of 6
- Skip placement test option (defaults to A1)
- Save all onboarding data to User table on completion

---

### MODULE 2: DASHBOARD (Home Screen)

**File:** `app/(features)/dashboard/`

**Components to build:**

```
<DashboardPage>
  <DailyStreakBanner />        # streak count + flame animation
  <DailyGoalProgress />        # circular progress: X/Y minutes today
  <ContinueLearningCard />     # resume last incomplete lesson
  <DailyChallenge />           # one special challenge per day
  <SkillRadar />               # recharts radar: Reading/Writing/Listening/Speaking/Grammar/Vocab
  <WeeklyXPChart />            # bar chart: XP earned per day this week
  <RecentBadges />             # last 3 achievements unlocked
  <LeaderboardPreview />       # top 5 friends/global this week
```

**Behavior:**
- If user hasn't studied today, show motivational prompt with CTA
- Show "🔥 X day streak!" banner prominently
- Daily goal resets at midnight user local time
- Dashboard data cached for 60 seconds, refresh on focus

---

### MODULE 3: LESSON PLAYER

**File:** `app/(features)/lessons/`

Build a **multi-type lesson engine** that renders different exercise types based on `lesson.type`.

#### 3A. Exercise Types to Implement:

| Type | Description |
|---|---|
| `MULTIPLE_CHOICE` | 4 options, tap correct answer, instant feedback |
| `FILL_IN_BLANK` | Sentence with blank, user types answer |
| `WORD_MATCH` | Drag-and-drop pairs (word ↔ translation) |
| `SENTENCE_BUILDER` | Tap words in correct order to form sentence |
| `LISTENING_COMPREHENSION` | Play audio, answer 3 questions |
| `SPEAKING_PROMPT` | Show sentence, user records audio, AI scores pronunciation |
| `READING_PASSAGE` | Short text + comprehension questions |
| `WRITING_PROMPT` | Open text box, AI evaluates grammar + content |
| `FLASHCARD_REVIEW` | SRS flashcard session (see Module 4) |

#### 3B. Lesson Flow:
```
LessonIntro → [Exercise 1..N] → ResultsScreen
```
- Each lesson has 8–15 exercises
- Progress bar at top (exercises completed / total)
- Wrong answer → show correction + explanation → continue
- Correct answer → celebrate with Framer Motion animation + XP pop
- Heart/life system: 3 hearts per lesson, lose one per wrong answer
  - If 0 hearts: "Practice Mode" (no XP loss, unlimited tries)
- On lesson complete: show score, XP earned, stars (1–3), next lesson CTA

#### 3C. Lesson Content Format (JSON stored in DB):
```json
{
  "exercises": [
    {
      "type": "MULTIPLE_CHOICE",
      "prompt": "What does 'Bonjour' mean?",
      "options": ["Hello", "Goodbye", "Thank you", "Please"],
      "correct": 0,
      "explanation": "Bonjour is the standard French greeting used during the day."
    },
    {
      "type": "FILL_IN_BLANK",
      "sentence": "Je ___ un étudiant.",
      "answer": "suis",
      "hint": "verb 'to be' conjugated for 'I'"
    }
  ]
}
```

---

### MODULE 4: SPACED REPETITION FLASHCARD SYSTEM (SRS)

**File:** `app/(features)/flashcards/`

Implement the **SM-2 algorithm** exactly:

```typescript
// SM-2 Algorithm
function sm2(card: UserFlashcard, quality: 0|1|2|3|4|5): UserFlashcard {
  // quality: 0-1 = fail, 2 = hard, 3 = good, 4 = easy, 5 = perfect
  let { interval, easeFactor, repetitions } = card;

  if (quality < 3) {
    repetitions = 0;
    interval = 1;
  } else {
    if (repetitions === 0) interval = 1;
    else if (repetitions === 1) interval = 6;
    else interval = Math.round(interval * easeFactor);
    repetitions += 1;
  }

  easeFactor = Math.max(1.3, easeFactor + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));

  return {
    ...card,
    interval,
    easeFactor,
    repetitions,
    dueDate: addDays(new Date(), interval),
    lastReviewed: new Date(),
  };
}
```

**Flashcard UI:**
- Flip card animation (CSS 3D transform)
- Front: target language word + pronunciation guide
- Back: translation + example sentence + audio button
- After flip, show 4 rating buttons: "Again / Hard / Good / Easy"
- Session ends after all due cards reviewed
- Show session summary: cards reviewed, retention rate, next review date

**Daily SRS Queue:**
- Pull all `UserFlashcard` where `dueDate <= today`
- Cap at 50 cards per session
- New cards: max 20 per day

---

### MODULE 5: AI SPEAKING PARTNER

**File:** `app/(features)/speaking/`

Build a real-time conversational AI for speaking practice.

**Features:**
- Scenario picker: Restaurant / Airport / Job Interview / Shopping / Small Talk / Custom
- User speaks → Web Speech API transcribes → sent to OpenAI → AI responds in target language
- AI response displayed as text + played via TTS (ElevenLabs or browser TTS)
- After conversation ends, AI gives structured feedback:

```json
{
  "fluency_score": 72,
  "grammar_errors": [
    { "said": "I go to store yesterday", "correction": "I went to the store yesterday", "rule": "Past tense" }
  ],
  "vocabulary_suggestions": ["Instead of 'big', try 'enormous' or 'vast'"],
  "overall_feedback": "Great effort! Your sentence structure is improving."
}
```

**System prompt for AI:**
```
You are a friendly {targetLanguage} language tutor helping a {level} student practice conversation.
Scenario: {scenario}
Rules:
- Keep responses 1-3 sentences max
- Use vocabulary appropriate for {level}
- If the user makes a grammar error, gently correct it naturally in your response
- Be encouraging and patient
- Respond ONLY in {targetLanguage}
```

---

### MODULE 6: AI WRITING JOURNAL

**File:** `app/(features)/writing/`

**Flow:**
1. User selects prompt (or free write): "Describe your weekend", "Write about your dream job", etc.
2. User writes in text area (min 50 words, max 500)
3. On submit, call OpenAI to evaluate:

```
Evaluate this {level} {language} student's writing. Return JSON:
{
  "overall_score": 0-100,
  "grammar_score": 0-100,
  "vocabulary_score": 0-100,
  "coherence_score": 0-100,
  "corrections": [{ "original": "", "corrected": "", "explanation": "" }],
  "vocabulary_suggestions": [{ "word": "", "suggestion": "", "reason": "" }],
  "positive_feedback": "",
  "improvement_tip": ""
}
```

4. Show annotated text with corrections highlighted inline
5. Save entry + feedback to `WritingEntry` table
6. "Writing History" page showing all past entries + score trends

---

### MODULE 7: GAMIFICATION ENGINE

**File:** `packages/gamification/`

Build as a shared package consumed by all modules.

#### 7A. XP System

| Action | XP Reward |
|---|---|
| Complete lesson (3 stars) | 50 XP |
| Complete lesson (2 stars) | 30 XP |
| Complete lesson (1 star) | 10 XP |
| SRS session (20+ cards) | 25 XP |
| Speaking session (5+ min) | 40 XP |
| Writing entry submitted | 30 XP |
| Daily challenge completed | 60 XP |
| Maintain streak (7 days) | 100 XP bonus |
| Invite friend | 200 XP |

#### 7B. Level System
```typescript
const LEVELS = [
  { level: 1, minXP: 0, title: "Seedling" },
  { level: 2, minXP: 500, title: "Explorer" },
  { level: 3, minXP: 1500, title: "Adventurer" },
  { level: 4, minXP: 3500, title: "Scholar" },
  { level: 5, minXP: 7000, title: "Linguist" },
  { level: 6, minXP: 12000, title: "Polyglot" },
  { level: 7, minXP: 20000, title: "Master" },
  { level: 8, minXP: 35000, title: "Legend" },
];
```

#### 7C. Streak System
- Streak increments when user completes ≥1 lesson in a calendar day
- "Streak Freeze" item: user gets 1 free freeze per week (can buy more)
- If streak broken without freeze → reset to 0
- Visual: animated flame 🔥 with color changing at 7 / 30 / 100 day milestones

#### 7D. Achievements (build all 30)

```typescript
const ACHIEVEMENTS = [
  // Streak achievements
  { id: "streak_3", title: "Habit Forming", desc: "3 day streak", icon: "🔥", xp: 50 },
  { id: "streak_7", title: "Week Warrior", desc: "7 day streak", icon: "⚡", xp: 100 },
  { id: "streak_30", title: "Monthly Master", desc: "30 day streak", icon: "🏆", xp: 500 },
  { id: "streak_100", title: "Century Club", desc: "100 day streak", icon: "💎", xp: 2000 },
  
  // Vocabulary achievements
  { id: "vocab_100", title: "Word Collector", desc: "Learn 100 words", icon: "📚", xp: 100 },
  { id: "vocab_500", title: "Vocabulary Builder", desc: "Learn 500 words", icon: "📖", xp: 300 },
  { id: "vocab_1000", title: "Word Wizard", desc: "Learn 1000 words", icon: "🧙", xp: 1000 },
  
  // Lesson achievements
  { id: "lesson_1", title: "First Steps", desc: "Complete first lesson", icon: "👶", xp: 50 },
  { id: "lesson_10", title: "Getting Serious", desc: "Complete 10 lessons", icon: "📝", xp: 100 },
  { id: "lesson_50", title: "Dedicated Learner", desc: "Complete 50 lessons", icon: "🎓", xp: 500 },
  { id: "lesson_100", title: "Century Scholar", desc: "Complete 100 lessons", icon: "🦉", xp: 1000 },
  
  // Perfect scores
  { id: "perfect_5", title: "Perfectionist", desc: "5 perfect lesson scores", icon: "⭐", xp: 200 },
  { id: "perfect_20", title: "Flawless", desc: "20 perfect lesson scores", icon: "💫", xp: 500 },
  
  // Speaking
  { id: "speaking_1", title: "First Words", desc: "Complete first speaking session", icon: "🎤", xp: 100 },
  { id: "speaking_10", title: "Conversationalist", desc: "10 speaking sessions", icon: "💬", xp: 300 },
  
  // Writing
  { id: "writing_1", title: "Pen to Paper", desc: "Submit first writing entry", icon: "✍️", xp: 100 },
  { id: "writing_10", title: "Storyteller", desc: "10 writing entries", icon: "📜", xp: 300 },
  
  // SRS
  { id: "srs_100", title: "Memory Master", desc: "Review 100 flashcards", icon: "🧠", xp: 150 },
  { id: "srs_1000", title: "Recall Champion", desc: "Review 1000 flashcards", icon: "🎯", xp: 500 },
  
  // Level achievements
  { id: "level_b1", title: "Intermediate!", desc: "Reach B1 level", icon: "🌟", xp: 500 },
  { id: "level_c1", title: "Advanced!", desc: "Reach C1 level", icon: "🚀", xp: 2000 },
  { id: "level_c2", title: "Mastery!", desc: "Reach C2 level", icon: "👑", xp: 5000 },
  
  // Social
  { id: "invite_1", title: "Word Spreader", desc: "Invite a friend", icon: "🤝", xp: 200 },
  { id: "top_leaderboard", title: "Top of the Class", desc: "Rank #1 weekly", icon: "🥇", xp: 500 },
  
  // Time-based
  { id: "early_bird", title: "Early Bird", desc: "Study before 7am", icon: "🌅", xp: 50 },
  { id: "night_owl", title: "Night Owl", desc: "Study after 10pm", icon: "🦉", xp: 50 },
  { id: "weekend_warrior", title: "Weekend Warrior", desc: "Study all weekend", icon: "📅", xp: 100 },
  { id: "marathon", title: "Marathon Session", desc: "Study 60+ min in one day", icon: "🏃", xp: 200 },
  { id: "daily_challenge_7", title: "Challenger", desc: "Complete 7 daily challenges", icon: "⚔️", xp: 200 },
  { id: "speed_demon", title: "Speed Demon", desc: "Complete lesson under 2 min", icon: "💨", xp: 100 },
];
```

---

### MODULE 8: PROGRESS & ANALYTICS

**File:** `app/(features)/progress/`

Build a dedicated progress page with:

```
<ProgressPage>
  <CEFRLevelBadge />          # Current level + progress to next
  <VocabSizeEstimator />      # "You know ~X words" (count mastered flashcards)
  <RetentionRateCard />        # % of SRS cards correct in last 30 days
  <SkillBreakdown />           # Individual scores per skill (R/W/L/S/G/V)
  <TimeStudiedChart />         # Hours studied per week (last 8 weeks)
  <LessonCompletionMap />      # Grid of all lessons with completion status
  <PredictionCard />           # "At your pace, you'll reach B2 in ~3 months"
  <AchievementGrid />          # All achievements, locked/unlocked
```

**Prediction algorithm (simple):**
```typescript
function predictLevelDate(user: User): Date {
  const xpPerDay = user.xpTotal / daysSinceJoined(user);
  const xpNeededForNextLevel = getXPForLevel(nextLevel) - user.xpTotal;
  const daysNeeded = Math.ceil(xpNeededForNextLevel / xpPerDay);
  return addDays(new Date(), daysNeeded);
}
```

---

### MODULE 9: LEADERBOARD

**File:** `app/(features)/leaderboard/`

- Weekly XP leaderboard (resets every Monday 00:00 UTC)
- Tabs: "Global" | "Friends"
- Show rank, avatar, name, XP this week
- Highlight current user's row
- Top 3 get gold/silver/bronze crown icons
- Pagination: show 25 per page
- Weekly snapshot saved to `Leaderboard` table every Sunday night (cron job)

---

### MODULE 10: NOTIFICATIONS & REMINDERS

**File:** `app/(features)/notifications/`

**In-app notifications:**
- Achievement unlocked
- Streak at risk (haven't studied yet, it's 8pm)
- Friend joined / surpassed you on leaderboard
- SRS cards due

**Push notifications (PWA):**
- Daily reminder at user's chosen time
- "You're on a X day streak! Don't break it today 🔥"
- Personalized: use user's name + target language

**Implement as PWA** (`next-pwa`) so notifications work on mobile.

---

### MODULE 11: CURRICULUM (SEED DATA)

**File:** `prisma/seed.ts`

Seed the database with a complete English → Spanish curriculum:

```
Unit 1: Greetings & Introductions (A1) — 5 lessons
Unit 2: Numbers & Time (A1) — 5 lessons  
Unit 3: Family & People (A1) — 5 lessons
Unit 4: Food & Restaurants (A2) — 6 lessons
Unit 5: Travel & Directions (A2) — 6 lessons
Unit 6: Work & Daily Routine (A2) — 6 lessons
Unit 7: Health & Body (B1) — 7 lessons
Unit 8: Hobbies & Free Time (B1) — 7 lessons
Unit 9: News & Current Events (B2) — 8 lessons
Unit 10: Abstract Ideas & Debate (C1) — 8 lessons
```

Each lesson must include:
- At least 8 exercises (mix of types)
- 10 flashcards per lesson
- At least one audio/speaking exercise per unit

---

### MODULE 12: SETTINGS & PROFILE

**File:** `app/(features)/settings/`

```
<SettingsPage>
  <ProfileSection />           # Avatar, name, email
  <LanguageSection />          # Change target language, native language
  <GoalsSection />             # Change daily goal minutes
  <NotificationSection />      # Toggle reminders, set time
  <AppearanceSection />        # Light/dark mode, font size
  <StreakFreezeSection />       # View/use streak freezes
  <AccountSection />           # Export data, delete account
  <SubscriptionSection />      # Free vs Pro features
```

---

## 4. API ROUTES

Build the following API endpoints:

```
POST   /api/auth/[...nextauth]

GET    /api/user/profile
PUT    /api/user/profile
GET    /api/user/stats

GET    /api/lessons
GET    /api/lessons/[id]
POST   /api/lessons/[id]/complete

GET    /api/flashcards/due
POST   /api/flashcards/review
POST   /api/flashcards/bulk-create

GET    /api/srs/session
POST   /api/srs/rate

POST   /api/ai/speaking
POST   /api/ai/writing/evaluate
POST   /api/ai/pronunciation/score

GET    /api/progress/summary
GET    /api/progress/skills

GET    /api/leaderboard/global
GET    /api/leaderboard/friends

GET    /api/achievements
POST   /api/achievements/check      # trigger achievement evaluation

GET    /api/daily-challenge
POST   /api/daily-challenge/submit

GET    /api/notifications
PUT    /api/notifications/[id]/read
```

---

## 5. UI/UX REQUIREMENTS

### Design System
- Primary color: `#6C63FF` (purple)
- Secondary color: `#FF6584` (coral)
- Success: `#43D39E` (mint green)
- Warning: `#FFB443` (amber)
- Use shadcn/ui components as base
- All rounded corners (border-radius: 12px standard, 20px for cards)
- Subtle drop shadows on cards

### Animations (Framer Motion)
- Correct answer: green flash + XP number flies up + bounces
- Wrong answer: card shakes left-right
- Level up: full-screen confetti + badge zoom-in
- Streak milestone: flame grows + pulses
- Page transitions: fade + slide up (0.2s)
- Achievement unlock: slide in from right with glow

### Mobile Responsiveness
- All screens must work on 375px width (iPhone SE)
- Bottom nav bar on mobile: Home / Learn / Flashcards / Progress / Profile
- Lesson exercises centered, max-width 600px

### Accessibility
- All interactive elements keyboard navigable
- ARIA labels on all icon buttons
- Color contrast ratio ≥ 4.5:1
- Support prefers-reduced-motion

---

## 6. ENVIRONMENT VARIABLES

Create `.env.example`:
```
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=...
NEXTAUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
OPENAI_API_KEY=...
ELEVENLABS_API_KEY=...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 7. PROJECT STRUCTURE

```
linguaflow/
├── apps/
│   └── web/
│       ├── app/
│       │   ├── (auth)/
│       │   │   ├── login/
│       │   │   └── register/
│       │   ├── (features)/
│       │   │   ├── dashboard/
│       │   │   ├── onboarding/
│       │   │   ├── lessons/
│       │   │   ├── flashcards/
│       │   │   ├── speaking/
│       │   │   ├── writing/
│       │   │   ├── progress/
│       │   │   ├── leaderboard/
│       │   │   ├── settings/
│       │   │   └── notifications/
│       │   ├── api/
│       │   ├── layout.tsx
│       │   └── page.tsx
│       ├── components/
│       │   ├── ui/               # shadcn components
│       │   ├── layout/           # Navbar, BottomNav, Sidebar
│       │   ├── exercises/        # All exercise type components
│       │   ├── flashcards/
│       │   ├── charts/
│       │   └── gamification/     # XP pop, achievement modal, etc.
│       ├── lib/
│       │   ├── db.ts             # Prisma client
│       │   ├── auth.ts           # NextAuth config
│       │   ├── openai.ts
│       │   ├── sm2.ts            # SRS algorithm
│       │   └── xp.ts            # XP calculation
│       ├── hooks/
│       ├── stores/               # Zustand stores
│       └── types/
├── packages/
│   └── gamification/
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
└── package.json
```

---

## 8. BUILD ORDER (Follow This Sequence)

Build in this exact order to avoid dependency issues:

```
1. Project scaffolding (Next.js, Tailwind, shadcn/ui, Prisma)
2. Database schema + migrations
3. Authentication (NextAuth)
4. Design system (colors, typography, base components)
5. Onboarding flow
6. Dashboard skeleton
7. Lesson player (start with MULTIPLE_CHOICE, then add other types)
8. SRS Flashcard system (SM-2 algorithm first, then UI)
9. Gamification engine (XP, streaks, achievements)
10. Progress page + charts
11. AI Speaking partner
12. AI Writing journal
13. Leaderboard
14. Notifications
15. Settings page
16. Seed curriculum data
17. PWA setup
18. Polish animations
19. Tests
```

---

## 9. ACCEPTANCE CRITERIA

The build is complete when:

- [ ] User can register, complete onboarding, and get assigned a CEFR level
- [ ] User can complete a full lesson of each exercise type
- [ ] SRS flashcard system correctly schedules cards using SM-2
- [ ] XP is awarded correctly for all actions
- [ ] Streak increments daily and breaks correctly
- [ ] At least 10 achievements can be unlocked
- [ ] AI speaking partner responds in target language
- [ ] AI writing feedback returns structured JSON with corrections
- [ ] Progress page shows accurate skill breakdown and predictions
- [ ] Leaderboard shows weekly rankings
- [ ] App is fully responsive on mobile (375px)
- [ ] Dark mode works on all pages
- [ ] All API routes return proper error responses (400/401/404/500)
- [ ] Seed data loads 50+ lessons with real content
- [ ] PWA installable on mobile with working push notifications

---

## 10. NOTES FOR AI AGENT

- **Do not use placeholder/lorem ipsum content.** All lesson content, flashcards, and seed data must be real, accurate language learning material.
- **Do not skip the SM-2 algorithm.** Implement it exactly as specified.
- **AI features require real OpenAI API calls.** Use streaming for speaking responses.
- **Every module must have proper loading states, error states, and empty states.**
- **Use TypeScript strictly** — no `any` types unless absolutely necessary.
- **All database queries must use Prisma transactions** where multiple writes are involved.
- **Rate-limit all AI API endpoints** (10 req/min per user).
- **Log all errors** to console in development; use structured logging in production.
- If a feature requires a missing env variable, **throw a clear error at startup** with setup instructions.

---

*End of PROMPT.md — Begin building LinguaFlow.*
