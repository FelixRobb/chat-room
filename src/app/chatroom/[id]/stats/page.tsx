'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import AuthenticatedLayout from '../../../components/AuthenticatedLayout';

interface ChatRoomStats {
  totalMessages: number;
  activeUsers: number;
  averageMessagesPerDay: number;
}

export default function ChatRoomStatsPage() {
  const { id } = useParams();
  const [stats, setStats] = useState<ChatRoomStats | null>(null);

  useEffect(() => {
    fetchStats();
  }, [id]);

  const fetchStats = async () => {
    const response = await fetch(`/api/chatrooms/${id}/stats`);
    const data = await response.json();
    setStats(data);
  };

  if (!stats) {
    return <AuthenticatedLayout><div>Loading...</div></AuthenticatedLayout>;
  }

  return (
    <AuthenticatedLayout>
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Chat Room Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-accent rounded-lg p-4 text-center">
              <h3 className="text-lg font-semibold">Total Messages</h3>
              <p className="text-2xl">{stats.totalMessages}</p>
            </div>
            <div className="bg-accent rounded-lg p-4 text-center">
              <h3 className="text-lg font-semibold">Active Users</h3>
              <p className="text-2xl">{stats.activeUsers}</p>
            </div>
            <div className="bg-accent rounded-lg p-4 text-center">
              <h3 className="text-lg font-semibold">Avg. Messages/Day</h3>
              <p className="text-2xl">{stats.averageMessagesPerDay.toFixed(2)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </AuthenticatedLayout>
  );
}

