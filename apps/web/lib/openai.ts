import OpenAI from 'openai';

const globalForOpenAI = globalThis as unknown as {
  openai: OpenAI | undefined;
};

export const openai =
  globalForOpenAI.openai ??
  new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

if (process.env.NODE_ENV !== 'production') globalForOpenAI.openai = openai;

// Rate limiting store (in-memory; use Redis in production)
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(userId: string, limit = 10, windowMs = 60000): boolean {
  const now = Date.now();
  const entry = rateLimitStore.get(userId);

  if (!entry || now > entry.resetAt) {
    rateLimitStore.set(userId, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (entry.count >= limit) {
    return false;
  }

  entry.count += 1;
  return true;
}
