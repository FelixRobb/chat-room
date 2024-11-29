import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { hashPassword, comparePasswords } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const { action, username, password } = await req.json();
  const db = await getDb();

  if (action === 'register') {
    const hashedPassword = await hashPassword(password);
    await db.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword]);
    return NextResponse.json({ success: true, message: 'User registered successfully' });
  } else if (action === 'login') {
    const user = await db.get('SELECT * FROM users WHERE username = ?', [username]);
    if (user && await comparePasswords(password, user.password)) {
      return NextResponse.json({ success: true, userId: user.id, username: user.username });
    } else {
      return NextResponse.json({ success: false, message: 'Invalid credentials' }, { status: 401 });
    }
  }

  return NextResponse.json({ success: false, message: 'Invalid action' }, { status: 400 });
}

