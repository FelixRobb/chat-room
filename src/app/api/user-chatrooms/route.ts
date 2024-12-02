import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(req: NextRequest) {
  const username = req.nextUrl.searchParams.get('username');
  const db = await getDb();
  const chatRooms = await db.all(
    `SELECT DISTINCT c.id, c.name
     FROM chatrooms c
     JOIN messages m ON c.id = m.chatroom_id
     WHERE m.user_id = (SELECT id FROM users WHERE username = ?)
     ORDER BY m.timestamp DESC
     LIMIT 10`,
    [username]
  );
  return NextResponse.json(chatRooms);
}

