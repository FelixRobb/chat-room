import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(req: NextRequest) {
  const username = req.nextUrl.searchParams.get('username');
  const db = await getDb();
  const followers = await db.all(
    `SELECT users.username 
     FROM followers 
     JOIN users ON followers.follower_id = users.id 
     WHERE followers.followed_id = (SELECT id FROM users WHERE username = ?)`,
    [username]
  );
  return NextResponse.json(followers.map(f => f.username));
}

export async function POST(req: NextRequest) {
  const { followerId, followedUsername } = await req.json();
  const db = await getDb();
  const followedUser = await db.get('SELECT id FROM users WHERE username = ?', [followedUsername]);
  
  if (!followedUser) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  try {
    await db.run(
      'INSERT OR IGNORE INTO followers (follower_id, followed_id) VALUES (?, ?)',
      [followerId, followedUser.id]
    );
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error following user:', error);
    return NextResponse.json({ error: 'Failed to follow user' }, { status: 500 });
  }
}

