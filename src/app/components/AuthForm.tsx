'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"

export default function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
  const { toast } = useToast();

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
        localStorage.setItem('user', JSON.stringify({ id: data.userId, username: data.username }));
        router.push('/chatrooms');
      } else {
        setIsLogin(true);
        toast({
          title: "Registration successful",
          description: "You can now log in with your new account.",
        });
      }
    } else {
      toast({
        title: "Error",
        description: data.message,
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isLogin ? 'Login' : 'Register'}</CardTitle>
        <CardDescription>
          {isLogin ? 'Enter your credentials to access your account.' : 'Create a new account to get started.'}
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button type="submit" className="w-full">
            {isLogin ? 'Login' : 'Register'}
          </Button>
          <Button type="button" variant="link" onClick={() => setIsLogin(!isLogin)} className="w-full">
            {isLogin ? 'Need to register?' : 'Already have an account?'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

