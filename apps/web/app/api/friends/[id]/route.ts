import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

// PATCH: accept friend request
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userId = session.user.id;
  const { id } = params;

  const friendship = await db.friendship.findUnique({ where: { id } });
  if (!friendship) {
    return NextResponse.json({ error: 'Friend request not found' }, { status: 404 });
  }

  // Only the recipient (friendId) can accept
  if (friendship.friendId !== userId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  if (friendship.status !== 'PENDING') {
    return NextResponse.json({ error: 'Request is not pending' }, { status: 400 });
  }

  const updated = await db.friendship.update({
    where: { id },
    data: { status: 'ACCEPTED' },
  });

  return NextResponse.json(updated);
}

// DELETE: remove friend or decline request
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userId = session.user.id;
  const { id } = params;

  const friendship = await db.friendship.findUnique({ where: { id } });
  if (!friendship) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  // Either party can remove
  if (friendship.userId !== userId && friendship.friendId !== userId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  await db.friendship.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
