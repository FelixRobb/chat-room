'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

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

    // Create a custom event listener for room creation
    const handleRoomCreated = () => fetchChatRooms();
    window.addEventListener('roomCreated', handleRoomCreated);

    return () => {
      window.removeEventListener('roomCreated', handleRoomCreated);
    };
  }, [search]);

  const fetchChatRooms = async () => {
    const response = await fetch(`/api/chatrooms?search=${search}`);
    const data = await response.json();
    setChatRooms(data);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Chat Rooms</CardTitle>
      </CardHeader>
      <CardContent>
        <Input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search chat rooms"
          className="mb-4"
        />
        <ul className="space-y-2">
          {chatRooms.map((room) => (
            <li key={room.id}>
              <Link href={`/chatroom/${room.id}`} className="block p-3 rounded-lg hover:bg-accent">
                <h3 className="font-semibold">{room.name}</h3>
                <p className="text-sm text-muted-foreground">{room.description}</p>
              </Link>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

