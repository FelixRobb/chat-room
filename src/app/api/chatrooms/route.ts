import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(req: NextRequest) {
  const db = await getDb();
  const searchQuery = req.nextUrl.searchParams.get('search') || '';
  const chatrooms = await db.all(
    'SELECT * FROM chatrooms WHERE name LIKE ? OR description LIKE ?',
    [`%${searchQuery}%`, `%${searchQuery}%`]
  );
  return NextResponse.json(chatrooms);
}

export async function POST(req: NextRequest) {
  const { name, description, createdBy } = await req.json();
  const db = await getDb();
  const result = await db.run(
    'INSERT INTO chatrooms (name, description, created_by) VALUES (?, ?, ?)',
    [name, description, createdBy]
  );
  return NextResponse.json({ success: true, id: result.lastID });
}

