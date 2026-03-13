import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';

const patchSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  targetLanguage: z.string().optional(),
  nativeLanguage: z.string().optional(),
  dailyGoalMinutes: z.number().int().min(1).max(120).optional(),
  currentLevel: z.enum(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']).optional(),
  settings: z
    .object({
      notificationsEnabled: z.boolean().optional(),
      reminderTime: z.string().optional(),
      theme: z.string().optional(),
      uiLanguage: z.string().optional(),
    })
    .optional(),
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    include: { settings: true },
  });

  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
  return NextResponse.json(user);
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const result = patchSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: 'Invalid data', details: result.error.flatten() }, { status: 400 });
  }

  const { settings, ...userFields } = result.data;

  try {
    await db.$transaction(async (tx) => {
      if (Object.keys(userFields).length > 0) {
        await tx.user.update({
          where: { id: session.user.id },
          data: userFields,
        });
      }
      if (settings && Object.keys(settings).length > 0) {
        await tx.userSettings.upsert({
          where: { userId: session.user.id },
          update: settings,
          create: { userId: session.user.id, ...settings },
        });
      }
    });

    const updated = await db.user.findUnique({
      where: { id: session.user.id },
      include: { settings: true },
    });
    return NextResponse.json(updated);
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
