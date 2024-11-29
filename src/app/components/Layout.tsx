'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Layout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/');
  };

  return (
    <div>
      <nav className="bg-blue-500 p-4">
        <div className="container mx-auto flex justify-between items-center">
          <Link href="/" className="text-white text-xl font-bold">
            Chat Room App
          </Link>
          <div className="space-x-4">
            <Link href="/chatrooms" className="text-white">
              Chat Rooms
            </Link>
            <Link href={`/profile/${JSON.parse(localStorage.getItem('user') || '{}').username || ''}`} className="text-white">
              Profile
            </Link>
            <button
              onClick={handleLogout}
              className="text-white"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>
      <main className="container mx-auto p-4">{children}</main>
    </div>
  );
}

