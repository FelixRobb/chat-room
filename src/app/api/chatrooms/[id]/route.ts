import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const db = await getDb();
  const chatroom = await db.get('SELECT * FROM chatrooms WHERE id = ?', [params.id]);

  if (chatroom) {
    return NextResponse.json(chatroom);
  } else {
    return NextResponse.json({ error: 'Chat room not found' }, { status: 404 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { name, description } = await req.json();
  const db = await getDb();
  
  try {
    await db.run(
      'UPDATE chatrooms SET name = ?, description = ? WHERE id = ?',
      [name, description, params.id]
    );
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating chat room:', error);
    return NextResponse.json({ error: 'Failed to update chat room' }, { status: 500 });
  }
}

