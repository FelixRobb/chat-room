'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AuthForm from './components/AuthForm';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      router.push('/chatrooms');
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold mb-6 text-center">Chat Room App</h1>
        <AuthForm />
      </div>
    </div>
  );
}

