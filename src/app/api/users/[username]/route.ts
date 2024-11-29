import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: { username: string } }
) {
  const db = await getDb();
  const user = await db.get('SELECT id, username, bio FROM users WHERE username = ?', [params.username]);
  
  if (user) {
    return NextResponse.json(user);
  } else {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }
}

