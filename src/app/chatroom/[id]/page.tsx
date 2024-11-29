'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

interface Message {
  id: number;
  content: string;
  username: string;
  timestamp: string;
}

export default function ChatRoomPage() {
  const { id } = useParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [user, setUser] = useState<{ id: number; username: string } | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, [id]);

  const fetchMessages = async () => {
    const response = await fetch(`/api/messages?chatRoomId=${id}`);
    const data = await response.json();
    setMessages(data);
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chatRoomId: id, userId: user.id, content: newMessage }),
    });
    setNewMessage('');
    fetchMessages();
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Chat Room {id}</h1>
      <div className="border rounded p-4 h-96 overflow-y-auto mb-4">
        {messages.map((message) => (
          <div key={message.id} className="mb-2">
            <span className="font-bold">{message.username}: </span>
            <span>{message.content}</span>
            <span className="text-xs text-gray-500 ml-2">{new Date(message.timestamp).toLocaleString()}</span>
          </div>
        ))}
      </div>
      <form onSubmit={sendMessage} className="flex">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message"
          className="flex-grow p-2 border rounded-l"
        />
        <button type="submit" className="bg-blue-500 text-white p-2 rounded-r">Send</button>
      </form>
    </div>
  );
}

