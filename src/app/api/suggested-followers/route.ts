import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(req: NextRequest) {
  const username = req.nextUrl.searchParams.get('username');
  const db = await getDb();
  
  // This query suggests users based on common chat rooms and followers
  const suggestedFollowers = await db.all(
    `SELECT DISTINCT u.username
     FROM users u
     JOIN messages m ON u.id = m.user_id
     JOIN (
       SELECT DISTINCT chatroom_id
       FROM messages
       WHERE user_id = (SELECT id FROM users WHERE username = ?)
     ) common_rooms ON m.chatroom_id = common_rooms.chatroom_id
     LEFT JOIN followers f ON u.id = f.followed_id AND f.follower_id = (SELECT id FROM users WHERE username = ?)
     WHERE u.username != ? AND f.follower_id IS NULL
     UNION
     SELECT DISTINCT u2.username
     FROM followers f1
     JOIN followers f2 ON f1.followed_id = f2.follower_id
     JOIN users u2 ON f2.followed_id = u2.id
     LEFT JOIN followers f3 ON u2.id = f3.followed_id AND f3.follower_id = (SELECT id FROM users WHERE username = ?)
     WHERE f1.follower_id = (SELECT id FROM users WHERE username = ?)
       AND u2.username != ?
       AND f3.follower_id IS NULL
     LIMIT 10`,
    [username, username, username, username, username, username]
  );
  
  return NextResponse.json(suggestedFollowers.map((f: any) => f.username));
}

