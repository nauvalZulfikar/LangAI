import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { openai, checkRateLimit } from '@/lib/openai';
import { z } from 'zod';

const schema = z.object({
  scenario: z.string(),
  messages: z.array(z.object({ role: z.enum(['user', 'assistant']), content: z.string() })),
  isStart: z.boolean().optional(),
});

const scenarioPrompts: Record<string, string> = {
  cafe: 'You are a friendly Spanish waiter at a café in Madrid. Speak only in Spanish (unless the user seems confused). Help the customer practice ordering food and drinks. Keep responses concise (2-3 sentences). Correct major grammar mistakes gently.',
  airport: 'You are a helpful airline agent at Madrid-Barajas airport. Speak in Spanish, helping the customer practice airport vocabulary and directions. Keep responses conversational and educational.',
  doctor: 'You are a kind Spanish-speaking doctor. Help the patient practice describing symptoms and understanding medical advice. Speak mostly in Spanish with patience.',
  shopping: 'You are a market vendor in a Spanish-speaking city. Help the customer practice shopping vocabulary, prices, and negotiations. Be friendly and use authentic Spanish expressions.',
  meeting: 'You are a professional Spanish business partner. Engage in formal business conversation, using professional Spanish vocabulary and expressions.',
  hotel: 'You are a hotel receptionist at a Spanish hotel. Help the guest practice check-in, room preferences, and hotel amenities in Spanish.',
};

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  if (!checkRateLimit(session.user.id)) {
    return NextResponse.json({ error: 'Rate limit exceeded. Please wait a minute.' }, { status: 429 });
  }

  const body = await req.json();
  const result = schema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
  }

  const { scenario, messages, isStart } = result.data;

  const systemPrompt = scenarioPrompts[scenario] ?? scenarioPrompts.cafe;

  try {
    const openaiMessages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      { role: 'system', content: systemPrompt },
    ];

    if (isStart) {
      openaiMessages.push({
        role: 'user',
        content: '[START CONVERSATION] Begin the scenario with a natural greeting.',
      });
    } else {
      for (const msg of messages.slice(-10)) {
        openaiMessages.push({ role: msg.role, content: msg.content });
      }
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: openaiMessages,
      max_tokens: 200,
      temperature: 0.8,
    });

    const message = completion.choices[0]?.message?.content ?? '¿Puedes repetir eso, por favor?';

    // Save conversation
    await fetch(`${process.env.NEXTAUTH_URL}/api/user/stats`, {
      method: 'GET',
    }).catch(() => null);

    return NextResponse.json({ message });
  } catch (error) {
    console.error('Speaking AI error:', error);
    return NextResponse.json(
      { message: 'Lo siento, hay un error técnico. Por favor, inténtalo de nuevo.' },
      { status: 200 }
    );
  }
}
