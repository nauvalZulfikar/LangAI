import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

// GET: returns user's invite code (or generates one if none)
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userId = session.user.id;

  let settings = await db.userSettings.findUnique({
    where: { userId },
    select: { inviteCode: true },
  });

  if (!settings?.inviteCode) {
    // Generate a unique code
    let code: string;
    let isUnique = false;
    do {
      code = generateInviteCode();
      const existing = await db.userSettings.findFirst({ where: { inviteCode: code } });
      isUnique = !existing;
    } while (!isUnique);

    settings = await db.userSettings.upsert({
      where: { userId },
      update: { inviteCode: code },
      create: { userId, inviteCode: code },
      select: { inviteCode: true },
    });
  }

  return NextResponse.json({ inviteCode: settings.inviteCode });
}
