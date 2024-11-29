'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface ChatRoom {
  id: number;
  name: string;
  description: string;
}

export default function SuggestedChatRooms() {
  const [suggestedRooms, setSuggestedRooms] = useState<ChatRoom[]>([]);
  const [user, setUser] = useState<{ id: number; username: string } | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      fetchSuggestedRooms(parsedUser.id);
    }
  }, []);

  const fetchSuggestedRooms = async (userId: number) => {
    const response = await fetch(`/api/chatrooms/suggested?userId=${userId}`);
    const data = await response.json();
    setSuggestedRooms(data);
  };

  if (!user) return null;

  return (
    <div className="mt-4">
      <h2 className="text-xl font-bold mb-2">Suggested Chat Rooms</h2>
      <ul className="space-y-2">
        {suggestedRooms.map((room) => (
          <li key={room.id} className="border p-2 rounded">
            <Link href={`/chatroom/${room.id}`}>
              <h3 className="font-bold">{room.name}</h3>
              <p className="text-sm text-gray-600">{room.description}</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

