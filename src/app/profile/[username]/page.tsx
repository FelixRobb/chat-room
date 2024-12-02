'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import AuthenticatedLayout from '../../components/AuthenticatedLayout';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface UserProfile {
  id: number;
  username: string;
  bio: string;
}

interface ChatRoom {
  id: number;
  name: string;
}

export default function ProfilePage() {
  const { username } = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [followers, setFollowers] = useState<string[]>([]);
  const [following, setFollowing] = useState<string[]>([]);
  const [suggestedFollowers, setSuggestedFollowers] = useState<string[]>([]);
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [currentUser, setCurrentUser] = useState<{ id: number; username: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editUsername, setEditUsername] = useState('');
  const [editBio, setEditBio] = useState('');

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
    fetchProfile();
    fetchFollowers();
    fetchFollowing();
    fetchSuggestedFollowers();
    fetchChatRooms();
  }, [username]);

  const fetchProfile = async () => {
    try {
      const response = await fetch(`/api/users/${username}`);
      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }
      const data = await response.json();
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError('Failed to load profile. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFollowers = async () => {
    try {
      const response = await fetch(`/api/followers?username=${username}`);
      if (!response.ok) {
        throw new Error('Failed to fetch followers');
      }
      const data = await response.json();
      setFollowers(data);
    } catch (error) {
      console.error('Error fetching followers:', error);
      setError('Failed to load followers. Please try again later.');
    }
  };

  const fetchFollowing = async () => {
    try {
      const response = await fetch(`/api/following?username=${username}`);
      if (!response.ok) {
        throw new Error('Failed to fetch following');
      }
      const data = await response.json();
      setFollowing(data);
    } catch (error) {
      console.error('Error fetching following:', error);
      setError('Failed to load following. Please try again later.');
    }
  };

  const fetchSuggestedFollowers = async () => {
    try {
      const response = await fetch(`/api/suggested-followers?username=${username}`);
      if (!response.ok) {
        throw new Error('Failed to fetch suggested followers');
      }
      const data = await response.json();
      setSuggestedFollowers(data);
    } catch (error) {
      console.error('Error fetching suggested followers:', error);
      setError('Failed to load suggested followers. Please try again later.');
    }
  };

  const fetchChatRooms = async () => {
    try {
      const response = await fetch(`/api/user-chatrooms?username=${username}`);
      if (!response.ok) {
        throw new Error('Failed to fetch chat rooms');
      }
      const data = await response.json();
      setChatRooms(data);
    } catch (error) {
      console.error('Error fetching chat rooms:', error);
      setError('Failed to load chat rooms. Please try again later.');
    }
  };

  const handleFollow = async () => {
    if (!currentUser) return;
    try {
      const response = await fetch('/api/followers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ followerId: currentUser.id, followedUsername: username }),
      });
      if (!response.ok) {
        throw new Error('Failed to follow user');
      }
      fetchFollowers();
      toast({
        title: "Success",
        description: `You are now following ${username}`,
      });
    } catch (error) {
      console.error('Error following user:', error);
      toast({
        title: "Error",
        description: "Failed to follow user. Please try again later.",
        variant: "destructive",
      });
    }
  };

  const handleUnfollow = async (unfollowUsername: string) => {
    if (!currentUser) return;
    try {
      const response = await fetch('/api/followers', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ followerId: currentUser.id, followedUsername: unfollowUsername }),
      });
      if (!response.ok) {
        throw new Error('Failed to unfollow user');
      }
      fetchFollowing();
      toast({
        title: "Success",
        description: `You have unfollowed ${unfollowUsername}`,
      });
    } catch (error) {
      console.error('Error unfollowing user:', error);
      toast({
        title: "Error",
        description: "Failed to unfollow user. Please try again later.",
        variant: "destructive",
      });
    }
  };

  const handleLeaveChatRoom = async (chatRoomId: number) => {
    if (!currentUser) return;
    try {
      const response = await fetch(`/api/chatrooms/${chatRoomId}/members`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id }),
      });
      if (!response.ok) {
        throw new Error('Failed to leave chat room');
      }
      fetchChatRooms();
      toast({
        title: "Success",
        description: "You have left the chat room",
      });
    } catch (error) {
      console.error('Error leaving chat room:', error);
      toast({
        title: "Error",
        description: "Failed to leave chat room. Please try again later.",
        variant: "destructive",
      });
    }
  };

  const handleEditProfile = async () => {
    if (!currentUser) return;
    try {
      const response = await fetch(`/api/users/${currentUser.username}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: editUsername, bio: editBio }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update profile');
      }
      const updatedProfile = await response.json();
      setProfile(updatedProfile);
      setIsEditing(false);
      if (currentUser.username !== updatedProfile.username) {
        // Update local storage with new username
        localStorage.setItem('user', JSON.stringify({ ...currentUser, username: updatedProfile.username }));
        // Redirect to new profile URL
        router.push(`/profile/${updatedProfile.username}`);
      }
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update profile. Please try again later.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <AuthenticatedLayout><div>Loading...</div></AuthenticatedLayout>;
  }

  if (error) {
    return <AuthenticatedLayout><div className="text-red-500">{error}</div></AuthenticatedLayout>;
  }

  if (!profile) {
    return <AuthenticatedLayout><div>User not found</div></AuthenticatedLayout>;
  }

  const isOwnProfile = currentUser && currentUser.username === profile.username;

  return (
    <AuthenticatedLayout>
      <div className="container mx-auto p-4 space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl flex justify-between items-center">
              {profile.username}'s Profile
              {isOwnProfile && (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Edit Profile</DialogTitle>
                      <DialogDescription>Make changes to your profile here. Click save when you're done.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <label htmlFor="username" className="text-right">
                          Username
                        </label>
                        <Input
                          id="username"
                          value={editUsername}
                          onChange={(e) => setEditUsername(e.target.value)}
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <label htmlFor="bio" className="text-right">
                          Bio
                        </label>
                        <Textarea
                          id="bio"
                          value={editBio}
                          onChange={(e) => setEditBio(e.target.value)}
                          className="col-span-3"
                        />
                      </div>
                    </div>
                    <Button onClick={handleEditProfile}>Save changes</Button>
                  </DialogContent>
                </Dialog>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg mb-4">{profile.bio || 'No bio available'}</p>
            {!isOwnProfile && (
              <Button onClick={handleFollow} disabled={followers.includes(currentUser?.username || '')}>
                {followers.includes(currentUser?.username || '') ? 'Following' : 'Follow'}
              </Button>
            )}
          </CardContent>
        </Card>

        <Tabs defaultValue="followers" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="followers">Followers</TabsTrigger>
            <TabsTrigger value="following">Following</TabsTrigger>
            <TabsTrigger value="chatrooms">Chat Rooms</TabsTrigger>
            {isOwnProfile && <TabsTrigger value="suggested">Suggested</TabsTrigger>}
          </TabsList>
          <TabsContent value="followers">
            <Card>
              <CardHeader>
                <CardTitle>Followers</CardTitle>
              </CardHeader>
              <CardContent>
                {followers.length > 0 ? (
                  <ul className="space-y-2">
                    {followers.map((follower) => (
                      <li key={follower}>
                        <Link href={`/profile/${follower}`} className="hover:underline">
                          {follower}
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No followers yet</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="following">
            <Card>
              <CardHeader>
                <CardTitle>Following</CardTitle>
              </CardHeader>
              <CardContent>
                {following.length > 0 ? (
                  <ul className="space-y-2">
                    {following.map((followedUser) => (
                      <li key={followedUser} className="flex justify-between items-center">
                        <Link href={`/profile/${followedUser}`} className="hover:underline">
                          {followedUser}
                        </Link>
                        {isOwnProfile && (
                          <Button onClick={() => handleUnfollow(followedUser)} variant="outline" size="sm">
                            Unfollow
                          </Button>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>Not following anyone yet</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="chatrooms">
            <Card>
              <CardHeader>
                <CardTitle>Chat Rooms</CardTitle>
              </CardHeader>
              <CardContent>
                {chatRooms.length > 0 ? (
                  <ul className="space-y-2">
                    {chatRooms.map((room) => (
                      <li key={room.id} className="flex justify-between items-center">
                        <Link href={`/chatroom/${room.id}`} className="hover:underline">
                          {room.name}
                        </Link>
                        {isOwnProfile && (
                          <Button onClick={() => handleLeaveChatRoom(room.id)} variant="outline" size="sm">
                            Leave
                          </Button>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>Not part of any chat rooms yet</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          {isOwnProfile && (
            <TabsContent value="suggested">
              <Card>
                <CardHeader>
                  <CardTitle>Suggested Followers</CardTitle>
                </CardHeader>
                <CardContent>
                  {suggestedFollowers.length > 0 ? (
                    <ul className="space-y-2">
                      {suggestedFollowers.map((suggestedUser) => (
                        <li key={suggestedUser} className="flex justify-between items-center">
                          <Link href={`/profile/${suggestedUser}`} className="hover:underline">
                            {suggestedUser}
                          </Link>
                          <Button onClick={() => handleFollow()} variant="outline" size="sm">
                            Follow
                          </Button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>No suggested followers at the moment</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </AuthenticatedLayout>
  );
}