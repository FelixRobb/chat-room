import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(
  req: NextRequest,
  { params } : { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const db = await getDb();
  const members = await db.all(
    `SELECT users.id, users.username
     FROM users
     JOIN chatroom_members ON users.id = chatroom_members.user_id
     WHERE chatroom_members.chatroom_id = ?`,
    [id]
  );

  return NextResponse.json(members);
}

export async function POST(
  req: NextRequest,
  { params } : { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { userId } = await req.json();
  const db = await getDb();

  try {
    await db.run(
      'INSERT INTO chatroom_members (chatroom_id, user_id) VALUES (?, ?)',
      [id, userId]
    );
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error adding member to chat room:', error);
    return NextResponse.json({ error: 'Failed to add member to chat room' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params } : { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { userId } = await req.json();
  const db = await getDb();

  try {
    await db.run(
      'DELETE FROM chatroom_members WHERE chatroom_id = ? AND user_id = ?',
      [id, userId]
    );
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing member from chat room:', error);
    return NextResponse.json({ error: 'Failed to remove member from chat room' }, { status: 500 });
  }
}

