import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(req: NextRequest) {
  const username = req.nextUrl.searchParams.get('username');
  const db = await getDb();
  const following = await db.all(
    `SELECT users.username 
     FROM followers 
     JOIN users ON followers.followed_id = users.id 
     WHERE followers.follower_id = (SELECT id FROM users WHERE username = ?)`,
    [username]
  );
  return NextResponse.json(following.map((f: any) => f.username));
}

