'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const response = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: isLogin ? 'login' : 'register', username, password }),
    });
    const data = await response.json();
    if (data.success) {
      if (isLogin) {
        // Store user info in localStorage or context
        localStorage.setItem('user', JSON.stringify({ id: data.userId, username: data.username }));
        router.push('/chatrooms');
      } else {
        setIsLogin(true);
      }
    } else {
      alert(data.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Username"
        required
        className="w-full p-2 border rounded"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
        className="w-full p-2 border rounded"
      />
      <button type="submit" className="w-full p-2 bg-blue-500 text-white rounded">
        {isLogin ? 'Login' : 'Register'}
      </button>
      <button type="button" onClick={() => setIsLogin(!isLogin)} className="w-full p-2 text-blue-500">
        {isLogin ? 'Need to register?' : 'Already have an account?'}
      </button>
    </form>
  );
}

