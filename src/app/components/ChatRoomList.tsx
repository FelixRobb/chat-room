'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface ChatRoom {
  id: number;
  name: string;
  description: string;
}

export default function ChatRoomList() {
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchChatRooms();
  }, [search]);

  const fetchChatRooms = async () => {
    const response = await fetch(`/api/chatrooms?search=${search}`);
    const data = await response.json();
    setChatRooms(data);
  };

  return (
    <div className="space-y-4">
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search chat rooms"
        className="w-full p-2 border rounded"
      />
      <ul className="space-y-2">
        {chatRooms.map((room) => (
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

