import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { openai } from '@/lib/openai';
import { XP_REWARDS } from '@/lib/xp';
import { z } from 'zod';

const submitSchema = z.object({
  testId: z.string(),
  answers: z.array(z.any()),
});

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const result = submitSchema.safeParse(body);
  if (!result.success) return NextResponse.json({ error: 'Invalid data' }, { status: 400 });

  const { testId, answers } = result.data;
  const userId = session.user.id;

  const test = await db.goalMasteryTest.findFirst({
    where: { id: testId, goalId: params.id },
  });

  if (!test) return NextResponse.json({ error: 'Test not found' }, { status: 404 });

  const goal = await db.goalCycle.findFirst({
    where: { id: params.id, userId },
  });

  if (!goal) return NextResponse.json({ error: 'Goal not found' }, { status: 404 });

  const questions = JSON.parse(test.questions);
  let totalPoints = 0;
  let earnedPoints = 0;

  // Score each exercise
  for (let i = 0; i < questions.length; i++) {
    const question = questions[i];
    const answer = answers[i];
    totalPoints += 1;

    if (!answer) continue;

    const type = question.type;

    if (type === 'multiple_choice') {
      if (answer.selectedIndex === question.correctIndex) {
        earnedPoints += 1;
      }
    } else if (type === 'fill_blank') {
      const correct = (question.answer ?? '').trim().toLowerCase();
      const given = (answer.text ?? '').trim().toLowerCase();
      if (given === correct) {
        earnedPoints += 1;
      }
    } else if (type === 'word_match') {
      const pairs = question.pairs ?? [];
      const userPairs = answer.pairs ?? [];
      let matchCorrect = 0;
      for (let j = 0; j < pairs.length; j++) {
        if (userPairs[j]?.right === pairs[j]?.right) matchCorrect++;
      }
      earnedPoints += pairs.length > 0 ? matchCorrect / pairs.length : 0;
    } else if (type === 'sentence_builder') {
      const correct = (question.answer ?? '').trim().toLowerCase();
      const given = (answer.text ?? '').trim().toLowerCase();
      if (given === correct) {
        earnedPoints += 1;
      }
    } else if (type === 'reading_passage') {
      const subQuestions = question.questions ?? [];
      const subAnswers = answer.answers ?? [];
      let subCorrect = 0;
      for (let j = 0; j < subQuestions.length; j++) {
        if (subAnswers[j] === subQuestions[j]?.correctIndex) subCorrect++;
      }
      earnedPoints += subQuestions.length > 0 ? subCorrect / subQuestions.length : 0;
    } else if (type === 'writing_prompt' || type === 'speaking_prompt') {
      // Score subjective exercises via GPT-4o
      try {
        const evalCompletion = await openai.chat.completions.create({
          model: 'gpt-4o',
          messages: [
            {
              role: 'system',
              content: `Score this language response from 0 to 100. Return JSON: { "score": number, "feedback": string }`,
            },
            {
              role: 'user',
              content: `Prompt: ${question.prompt}\nSample answer: ${question.sampleAnswer}\nStudent answer: ${answer.text}`,
            },
          ],
          response_format: { type: 'json_object' },
          max_tokens: 200,
          temperature: 0.2,
        });
        const evalContent = evalCompletion.choices[0]?.message?.content;
        if (evalContent) {
          const evalResult = JSON.parse(evalContent);
          earnedPoints += (evalResult.score ?? 0) / 100;
        }
      } catch {
        // If AI scoring fails, give partial credit
        earnedPoints += 0.5;
      }
    }
  }

  const score = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
  const passed = score >= goal.passThreshold;

  // Update test record
  await db.goalMasteryTest.update({
    where: { id: testId },
    data: {
      answers: JSON.stringify(answers),
      score,
      passed,
      takenAt: new Date(),
    },
  });

  let xpEarned = 0;
  let remedialPlan = null;

  if (passed) {
    // Calculate XP
    xpEarned = XP_REWARDS.MASTERY_TEST_PASS;
    if (score === 100) {
      xpEarned = XP_REWARDS.MASTERY_TEST_PERFECT;
    }

    // On-time bonus
    const now = new Date();
    const deadline = goal.deadlineAt ? new Date(goal.deadlineAt) : null;
    if (deadline && now <= deadline) {
      xpEarned += Math.round(XP_REWARDS.GOAL_ON_TIME_BONUS * goal.xpMultiplier);
    }

    // Consecutive bonus
    const newSequence = goal.sequenceNumber + 1;
    if (newSequence >= 5) xpEarned += XP_REWARDS.GOAL_CONSECUTIVE_5;
    else if (newSequence >= 2) xpEarned += XP_REWARDS.GOAL_CONSECUTIVE_2;

    // Update goal and user
    await db.$transaction(async (tx) => {
      await tx.goalCycle.update({
        where: { id: goal.id },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
          xpBonusEarned: xpEarned,
          sequenceNumber: newSequence,
        },
      });

      await tx.user.update({
        where: { id: userId },
        data: { xpTotal: { increment: xpEarned } },
      });
    });
  } else {
    // Generate remedial plan
    try {
      const remedialCompletion = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `The student failed a mastery test with score ${score}%. Analyze their weak areas and recommend specific exercises to redo. Return JSON: { "weakAreas": string[], "recommendations": string[], "exerciseTypes": string[] }`,
          },
          {
            role: 'user',
            content: JSON.stringify({
              topic: goal.topic,
              score,
              questions: questions.map((q: Record<string, unknown>, i: number) => ({
                type: q.type,
                answered: !!answers[i],
              })),
            }),
          },
        ],
        response_format: { type: 'json_object' },
        max_tokens: 400,
        temperature: 0.3,
      });

      const remedialContent = remedialCompletion.choices[0]?.message?.content;
      if (remedialContent) {
        remedialPlan = JSON.parse(remedialContent);
        await db.goalMasteryTest.update({
          where: { id: testId },
          data: { remedialPlan: remedialContent },
        });
      }
    } catch {
      // Remedial generation failed, continue without it
    }
  }

  return NextResponse.json({
    score,
    passed,
    xpEarned,
    remedialPlan,
    goalCompleted: passed,
  });
}
