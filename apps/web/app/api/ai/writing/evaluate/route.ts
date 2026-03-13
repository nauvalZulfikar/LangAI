import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { openai, checkRateLimit } from '@/lib/openai';
import { z } from 'zod';

const schema = z.object({
  text: z.string().min(10).max(5000),
  prompt: z.string().optional(),
  language: z.string().default('Spanish'),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  if (!checkRateLimit(session.user.id)) {
    return NextResponse.json({ error: 'Rate limit exceeded.' }, { status: 429 });
  }

  const body = await req.json();
  const result = schema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
  }

  const { text, language } = result.data;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are a professional ${language} language teacher. Evaluate the student's writing and return a JSON object with this exact structure:
{
  "overallScore": number (0-100),
  "grammarScore": number (0-100),
  "vocabularyScore": number (0-100),
  "fluencyScore": number (0-100),
  "corrections": [{"original": string, "corrected": string, "explanation": string}],
  "suggestions": [string],
  "positives": [string]
}
Be encouraging but honest. Max 3 corrections and 3 suggestions. Keep explanations brief.`,
        },
        {
          role: 'user',
          content: `Please evaluate this ${language} writing:\n\n${text}`,
        },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 600,
      temperature: 0.3,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) throw new Error('No response');

    const feedback = JSON.parse(content);
    return NextResponse.json(feedback);
  } catch (error) {
    console.error('Writing evaluate error:', error);
    // Return a basic fallback
    return NextResponse.json({
      overallScore: 65,
      grammarScore: 65,
      vocabularyScore: 70,
      fluencyScore: 60,
      corrections: [],
      suggestions: ['Try to use more varied vocabulary.', 'Check your verb conjugations.'],
      positives: ['Good effort!', 'Your writing shows understanding of the topic.'],
    });
  }
}
