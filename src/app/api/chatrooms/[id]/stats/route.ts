import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const db = await getDb();

  try {
    const totalMessages = await db.get(
      'SELECT COUNT(*) as count FROM messages WHERE chatroom_id = ?',
      [id]
    );

    const activeUsers = await db.get(
      'SELECT COUNT(DISTINCT user_id) as count FROM messages WHERE chatroom_id = ?',
      [id]
    );

    const oldestMessage = await db.get(
      'SELECT MIN(timestamp) as oldest FROM messages WHERE chatroom_id = ?',
      [id]
    );

    const currentDate = new Date();
    const oldestDate = new Date(oldestMessage.oldest);
    const daysSinceOldest = Math.ceil((currentDate.getTime() - oldestDate.getTime()) / (1000 * 3600 * 24));

    const averageMessagesPerDay = totalMessages.count / daysSinceOldest;

    return NextResponse.json({
      totalMessages: totalMessages.count,
      activeUsers: activeUsers.count,
      averageMessagesPerDay: averageMessagesPerDay
    });
  } catch (error) {
    console.error('Error fetching chat room stats:', error);
    return NextResponse.json({ error: 'Failed to fetch chat room stats' }, { status: 500 });
  }
}

