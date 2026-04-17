import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

// GET: list accepted friends
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userId = session.user.id;

  const friendships = await db.friendship.findMany({
    where: {
      OR: [
        { userId, status: 'ACCEPTED' },
        { friendId: userId, status: 'ACCEPTED' },
      ],
    },
    include: {
      user: { select: { id: true, name: true, avatar: true, currentLevel: true, xpTotal: true, streakCurrent: true } },
      friend: { select: { id: true, name: true, avatar: true, currentLevel: true, xpTotal: true, streakCurrent: true } },
    },
  });

  const friends = friendships.map((f) => {
    const isSender = f.userId === userId;
    const other = isSender ? f.friend : f.user;
    return {
      friendshipId: f.id,
      ...other,
    };
  });

  return NextResponse.json(friends);
}

// POST: send friend request by email
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userId = session.user.id;
  const body = await req.json() as { email?: string };

  if (!body.email) {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 });
  }

  const targetUser = await db.user.findUnique({
    where: { email: body.email },
    select: { id: true, name: true, email: true },
  });

  if (!targetUser) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  if (targetUser.id === userId) {
    return NextResponse.json({ error: 'Cannot add yourself' }, { status: 400 });
  }

  // Check if friendship already exists
  const existing = await db.friendship.findFirst({
    where: {
      OR: [
        { userId, friendId: targetUser.id },
        { userId: targetUser.id, friendId: userId },
      ],
    },
  });

  if (existing) {
    return NextResponse.json({ error: 'Friend request already exists' }, { status: 409 });
  }

  const friendship = await db.friendship.create({
    data: { userId, friendId: targetUser.id, status: 'PENDING' },
    include: {
      friend: { select: { id: true, name: true, email: true } },
    },
  });

  return NextResponse.json(friendship, { status: 201 });
}
