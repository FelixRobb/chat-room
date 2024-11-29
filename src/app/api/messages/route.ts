import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(req: NextRequest) {
  const chatRoomId = req.nextUrl.searchParams.get('chatRoomId');
  const db = await getDb();
  const messages = await db.all(
    `SELECT messages.*, users.username 
     FROM messages 
     JOIN users ON messages.user_id = users.id 
     WHERE chatroom_id = ? 
     ORDER BY timestamp DESC 
     LIMIT 50`,
    [chatRoomId]
  );
  return NextResponse.json(messages);
}

export async function POST(req: NextRequest) {
  const { chatRoomId, userId, content } = await req.json();
  const db = await getDb();
  const result = await db.run(
    'INSERT INTO messages (chatroom_id, user_id, content) VALUES (?, ?, ?)',
    [chatRoomId, userId, content]
  );
  return NextResponse.json({ success: true, id: result.lastID });
}

