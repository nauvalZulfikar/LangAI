import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { openai, checkRateLimit } from '@/lib/openai';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const test = await db.goalMasteryTest.findFirst({
    where: { goalId: params.id, takenAt: null },
    orderBy: { createdAt: 'desc' },
  });

  if (!test) {
    return NextResponse.json({ noTest: true });
  }

  return NextResponse.json({
    id: test.id,
    attempt: test.attempt,
    testCategories: JSON.parse(test.testCategories),
    questions: JSON.parse(test.questions),
    score: test.score,
    passed: test.passed,
  });
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  if (!checkRateLimit(session.user.id, 3, 60000)) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
  }

  const userId = session.user.id;

  const goal = await db.goalCycle.findFirst({
    where: { id: params.id, userId, status: 'ACTIVE' },
    include: {
      assignedLessons: {
        include: {
          lesson: { select: { id: true, title: true, type: true, content: true } },
        },
      },
    },
  });

  if (!goal) return NextResponse.json({ error: 'Active goal not found' }, { status: 404 });

  // Verify all lessons are completed
  const allDone = goal.assignedLessons.length > 0 && goal.assignedLessons.every((l) => l.completedAt !== null);
  if (!allDone) {
    return NextResponse.json({ error: 'Not all goal lessons are completed yet' }, { status: 400 });
  }

  // Determine test categories based on skillFocus
  const skillFocus: string[] = JSON.parse(goal.skillFocus);
  const categoryMap: Record<string, string[]> = {
    VOCABULARY: ['Vocabulary Recognition', 'Vocabulary Production'],
    GRAMMAR: ['Grammar Accuracy'],
    READING: ['Reading Comprehension'],
    LISTENING: ['Listening Comprehension'],
    SPEAKING: ['Spoken Production'],
    WRITING: ['Written Production'],
  };

  const categories = new Set<string>();
  for (const skill of skillFocus) {
    const mapped = categoryMap[skill];
    if (mapped) {
      for (const c of mapped) categories.add(c);
    }
  }
  categories.add('Transfer / Application');
  const testCategories = Array.from(categories).slice(0, 5);

  // Extract practiced contexts from lesson content
  const practicedContexts: string[] = [];
  for (const gl of goal.assignedLessons) {
    try {
      const content = JSON.parse(gl.lesson.content);
      if (content.exercises) {
        for (const ex of content.exercises) {
          if (ex.question) practicedContexts.push(ex.question);
          if (ex.prompt) practicedContexts.push(ex.prompt);
          if (ex.sentence) practicedContexts.push(ex.sentence);
        }
      }
    } catch {
      // Skip unparseable content
    }
  }

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { targetLanguage: true, nativeLanguage: true },
  });

  // Count previous attempts
  const previousAttempts = await db.goalMasteryTest.count({
    where: { goalId: goal.id },
  });

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are a language assessment designer specializing in transfer-of-learning testing.

Context (JSON): topic, cefrLevel, targetLanguage, nativeLanguage,
testCategories[] (3-5 from 10 categories), practicedContexts[], skillFocus[]

CRITICAL: The student practiced {topic} in these contexts: {practicedContexts}.
Generate questions testing the SAME knowledge but in COMPLETELY DIFFERENT contexts.
Example: practiced food vocab in restaurant -> test food vocab in cooking show / grocery store / recipe.

Generate 10-15 exercises matching existing types:
- multiple_choice: { "type": "multiple_choice", "question": string, "options": string[4], "correctIndex": number, "explanation": string }
- fill_blank: { "type": "fill_blank", "sentence": string, "answer": string, "hint": string }
- word_match: { "type": "word_match", "pairs": [{"left": string, "right": string}] }
- sentence_builder: { "type": "sentence_builder", "words": string[], "answer": string, "translation": string }
- reading_passage: { "type": "reading_passage", "title": string, "text": string, "questions": [{"question": string, "options": string[], "correctIndex": number}] }
- writing_prompt: { "type": "writing_prompt", "prompt": string, "sampleAnswer": string }

Return: { "exercises": Exercise[], "categoryMapping": { "0": "Vocabulary Recognition", ... } }`,
        },
        {
          role: 'user',
          content: JSON.stringify({
            topic: goal.topic,
            cefrLevel: goal.cefrLevel,
            targetLanguage: user?.targetLanguage ?? 'Spanish',
            nativeLanguage: user?.nativeLanguage ?? 'English',
            testCategories,
            practicedContexts: practicedContexts.slice(0, 20),
            skillFocus,
          }),
        },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 2000,
      temperature: 0.4,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) throw new Error('No response from AI');

    const testData = JSON.parse(content);

    const test = await db.goalMasteryTest.create({
      data: {
        goalId: goal.id,
        attempt: previousAttempts + 1,
        testCategories: JSON.stringify(testCategories),
        questions: JSON.stringify(testData.exercises),
      },
    });

    return NextResponse.json({
      id: test.id,
      attempt: test.attempt,
      testCategories,
      questions: testData.exercises,
      score: null,
      passed: null,
    });
  } catch (error) {
    console.error('Mastery test generation error:', error);
    return NextResponse.json({ error: 'Failed to generate mastery test' }, { status: 500 });
  }
}
