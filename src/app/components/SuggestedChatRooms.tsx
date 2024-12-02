'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

interface ChatRoom {
  id: number;
  name: string;
  description: string;
}

export default function SuggestedChatRooms() {
  const [suggestedRooms, setSuggestedRooms] = useState<ChatRoom[]>([]);
  const [user, setUser] = useState<{ id: number; username: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      fetchSuggestedRooms(parsedUser.id);
    }
  }, []);

  const fetchSuggestedRooms = async (userId: number) => {
    try {
      const response = await fetch(`/api/chatrooms/suggested?userId=${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch suggested rooms');
      }
      const data = await response.json();
      setSuggestedRooms(data);
    } catch (error) {
      console.error('Error fetching suggested rooms:', error);
      setError('Failed to load suggested rooms. Please try again later.');
    }
  };

  if (error) {
    return <div className="text-destructive">{error}</div>;
  }

  if (!user) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Suggested Chat Rooms</CardTitle>
      </CardHeader>
      <CardContent>
        {suggestedRooms.length === 0 ? (
          <p className="text-muted-foreground">No suggested rooms available at the moment.</p>
        ) : (
          <ul className="space-y-2">
            {suggestedRooms.map((room) => (
              <li key={room.id}>
                <Link href={`/chatroom/${room.id}`} className="block p-3 rounded-lg hover:bg-accent">
                  <h3 className="font-semibold">{room.name}</h3>
                  <p className="text-sm text-muted-foreground">{room.description}</p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

