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
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-96">
        <h1 className="text-2xl font-bold mb-4 text-center">Chat Room App</h1>
        <AuthForm />
      </div>
    </div>
  );
}

