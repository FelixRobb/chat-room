'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import AuthenticatedLayout from '../../components/AuthenticatedLayout';
import { useToast } from "@/hooks/use-toast"

interface Message {
  id: number;
  content: string;
  username: string;
  timestamp: string;
}

interface ChatRoom {
  id: number;
  name: string;
  description: string;
  createdBy: number;
}

export default function ChatRoomPage() {
  const { id } = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [user, setUser] = useState<{ id: number; username: string } | null>(null);
  const [chatRoom, setChatRoom] = useState<ChatRoom | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [isMember, setIsMember] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    fetchChatRoom();
    fetchMessages();
    checkMembership();
    const interval = setInterval(fetchMessages, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, [id]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const fetchChatRoom = async () => {
    const response = await fetch(`/api/chatrooms/${id}`);
    const data = await response.json();
    setChatRoom(data);
    setEditName(data.name);
    setEditDescription(data.description);
    setIsAdmin(user?.id === data.createdBy);
  };

  const fetchMessages = async () => {
    const response = await fetch(`/api/messages?chatRoomId=${id}`);
    const data = await response.json();
    setMessages(data);
  };

  const checkMembership = async () => {
    if (user) {
      const response = await fetch(`/api/chatrooms/${id}/members?userId=${user.id}`);
      const data = await response.json();
      setIsMember(data.isMember);
    }
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

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    const response = await fetch(`/api/chatrooms/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: editName, description: editDescription }),
    });
    if (response.ok) {
      setChatRoom({ ...chatRoom!, name: editName, description: editDescription });
      setIsEditing(false);
      toast({
        title: "Success",
        description: "Chat room updated successfully",
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to update chat room",
        variant: "destructive",
      });
    }
  };

  const handleJoin = async () => {
    if (!user) return;
    const response = await fetch(`/api/chatrooms/${id}/members`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id }),
    });
    if (response.ok) {
      setIsMember(true);
      toast({
        title: "Success",
        description: "You have joined the chat room",
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to join chat room",
        variant: "destructive",
      });
    }
  };

  const handleLeave = async () => {
    if (!user) return;
    const response = await fetch(`/api/chatrooms/${id}/members`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id }),
    });
    if (response.ok) {
      setIsMember(false);
      toast({
        title: "Success",
        description: "You have left the chat room",
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to leave chat room",
        variant: "destructive",
      });
    }
  };

  return (
    <AuthenticatedLayout>
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            {chatRoom?.name || `Chat Room ${id}`}
            {isAdmin && (
              <Button onClick={() => setIsEditing(true)}>Edit</Button>
            )}
          </CardTitle>
          <p className="text-sm text-muted-foreground">{chatRoom?.description}</p>
          {!isMember ? (
            <Button onClick={handleJoin}>Join Chat Room</Button>
          ) : (
            <Button variant="outline" onClick={handleLeave}>Leave Chat Room</Button>
          )}
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[60vh] w-full pr-4" ref={scrollAreaRef}>
            {messages.map((message) => (
              <div key={message.id} className="mb-4">
                <Link href={`/profile/${message.username}`} className="font-semibold hover:underline">
                  {message.username}
                </Link>
                <div className="bg-accent rounded-lg p-2 mt-1">
                  {message.content}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {new Date(message.timestamp).toLocaleString()}
                </div>
              </div>
            ))}
          </ScrollArea>
        </CardContent>
        <CardFooter>
          <form onSubmit={sendMessage} className="flex w-full space-x-2">
            <Input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message"
              className="flex-grow"
            />
            <Button type="submit">Send</Button>
          </form>
        </CardFooter>
      </Card>

      {isAdmin && (
        <Dialog open={isEditing} onOpenChange={setIsEditing}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Chat Room</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleEdit} className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  required
                />
              </div>
              <Button type="submit">Save Changes</Button>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {isAdmin && (
        <Card className="mt-4 w-full max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle>Admin Panel</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push(`/chatroom/${id}/stats`)}>View Stats</Button>
            <Button className="ml-2" onClick={() => router.push(`/chatroom/${id}/members`)}>Manage Members</Button>
          </CardContent>
        </Card>
      )}
    </AuthenticatedLayout>
  );
}

