import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  const db = await getDb();
  const { username } = await params;
  const user = await db.get('SELECT id, username, bio FROM users WHERE username = ?', [username]);

  if (user) {
    return NextResponse.json(user);
  } else {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  const db = await getDb();
  const { username: newUsername, bio } = await req.json();
  const { username: currentUsername } = await params;

  // Validate input
  if (!newUsername || newUsername.trim() === '') {
    return NextResponse.json({ error: 'Username cannot be empty' }, { status: 400 });
  }

  // Check if the new username already exists (excluding the current user)
  const existingUser = await db.get('SELECT id FROM users WHERE username = ? AND username != ?', [newUsername, currentUsername]);
  if (existingUser) {
    return NextResponse.json({ error: 'Username already taken' }, { status: 409 });
  }

  try {
    // Update the user's profile
    await db.run(
      'UPDATE users SET username = ?, bio = ? WHERE username = ?',
      [newUsername, bio, currentUsername]
    );

    // Fetch the updated user profile
    const updatedUser = await db.get('SELECT id, username, bio FROM users WHERE username = ?', [newUsername]);

    if (updatedUser) {
      return NextResponse.json(updatedUser);
    } else {
      return NextResponse.json({ error: 'Failed to retrieve updated user' }, { status: 500 });
    }
  } catch (error) {
    console.error('Error updating user profile:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}

