'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import AuthenticatedLayout from '../components/AuthenticatedLayout';
import ChatRoomList from '../components/ChatRoomList';
import SuggestedChatRooms from '../components/SuggestedChatRooms';
import CreateChatRoom from '../components/CreateChatRoom';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface ChatRoom {
  id: number;
  name: string;
  newMessages: number;
}

export default function ChatRoomsPage() {
  const [followedRooms, setFollowedRooms] = useState<ChatRoom[]>([]);

  useEffect(() => {
    fetchFollowedRooms();
  }, []);

  const fetchFollowedRooms = async () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.id) {
      const response = await fetch(`/api/user-chatrooms?userId=${user.id}`);
      const data = await response.json();
      setFollowedRooms(data);
    }
  };

  return (
    <AuthenticatedLayout>
      <div className="space-y-8">
        <h1 className="text-3xl font-bold">Chat Rooms</h1>
        
        {followedRooms.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Your Chat Rooms</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {followedRooms.map((room) => (
                  <li key={room.id} className="flex justify-between items-center">
                    <Link href={`/chatroom/${room.id}`} className="hover:underline">
                      {room.name}
                    </Link>
                    {room.newMessages > 0 && (
                      <Badge variant="secondary">{room.newMessages} new</Badge>
                    )}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-8">
            <ChatRoomList />
            <CreateChatRoom />
          </div>
          <SuggestedChatRooms />
        </div>
      </div>
    </AuthenticatedLayout>
  );
}

