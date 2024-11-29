'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Layout from './Layout';

export default function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      setIsAuthenticated(true);
    } else {
      router.push('/');
    }
  }, [router]);

  if (!isAuthenticated) {
    return null; // or a loading spinner
  }

  return <Layout>{children}</Layout>;
}

