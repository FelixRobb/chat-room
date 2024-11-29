'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import AuthenticatedLayout from '../../components/AuthenticatedLayout';

interface UserProfile {
  id: number;
  username: string;
  bio: string;
}

export default function ProfilePage() {
  const { username } = useParams();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [followers, setFollowers] = useState<string[]>([]);
  const [currentUser, setCurrentUser] = useState<{ id: number; username: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
    fetchProfile();
    fetchFollowers();
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
    } catch (error) {
      console.error('Error following user:', error);
      setError('Failed to follow user. Please try again later.');
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

  return (
    <AuthenticatedLayout>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">{profile.username}'s Profile</h1>
        <p className="mb-4">{profile.bio || 'No bio available'}</p>
        <h2 className="text-xl font-bold mb-2">Followers</h2>
        {followers.length > 0 ? (
          <ul className="mb-4">
            {followers.map((follower) => (
              <li key={follower}>{follower}</li>
            ))}
          </ul>
        ) : (
          <p>No followers yet</p>
        )}
        {currentUser && currentUser.username !== profile.username && (
          <button
            onClick={handleFollow}
            className="bg-blue-500 text-white p-2 rounded"
          >
            Follow
          </button>
        )}
      </div>
    </AuthenticatedLayout>
  );
}

