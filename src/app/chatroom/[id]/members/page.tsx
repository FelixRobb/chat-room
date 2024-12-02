'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import AuthenticatedLayout from '../../../components/AuthenticatedLayout';
import { useToast } from "@/hooks/use-toast"

interface Member {
  id: number;
  username: string;
}

export default function ChatRoomMembersPage() {
  const { id } = useParams();
  const { toast } = useToast();
  const [members, setMembers] = useState<Member[]>([]);

  useEffect(() => {
    fetchMembers();
  }, [id]);

  const fetchMembers = async () => {
    const response = await fetch(`/api/chatrooms/${id}/members`);
    const data = await response.json();
    setMembers(data);
  };

  const handleRemoveMember = async (memberId: number) => {
    const response = await fetch(`/api/chatrooms/${id}/members`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: memberId }),
    });
    if (response.ok) {
      setMembers(members.filter(member => member.id !== memberId));
      toast({
        title: "Success",
        description: "Member removed successfully",
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to remove member",
        variant: "destructive",
      });
    }
  };

  return (
    <AuthenticatedLayout>
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Chat Room Members</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {members.map((member) => (
              <li key={member.id} className="flex justify-between items-center">
                <span>{member.username}</span>
                <Button variant="destructive" onClick={() => handleRemoveMember(member.id)}>Remove</Button>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </AuthenticatedLayout>
  );
}

