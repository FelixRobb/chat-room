import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('userId');
  const db = await getDb();
  
  // First, check if the user has any followers
  const hasFollowers = await db.get('SELECT 1 FROM followers WHERE follower_id = ? LIMIT 1', [userId]);
  
  let suggestedRooms;
  if (hasFollowers) {
    suggestedRooms = await db.all(
      `SELECT DISTINCT c.id, c.name, c.description
       FROM chatrooms c
       JOIN messages m ON c.id = m.chatroom_id
       JOIN followers f ON m.user_id = f.followed_id
       WHERE f.follower_id = ?
       LIMIT 5`,
      [userId]
    );
  } else {
    // If the user has no followers, suggest some random chat rooms
    suggestedRooms = await db.all(
      `SELECT id, name, description
       FROM chatrooms
       ORDER BY RANDOM()
       LIMIT 5`
    );
  }
  
  return NextResponse.json(suggestedRooms);
}

