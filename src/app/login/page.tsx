
"use client";

import React, { useState, useEffect } from 'react';
import { useFirebase } from '@/firebase';
import { signInWithEmailAndPassword, signInAnonymously } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldCheck, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { auth, user, isUserLoading } = useFirebase();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (user && !isUserLoading) {
      router.push('/');
    }
  }, [user, isUserLoading, router]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) return;

    setIsLoading(true);
    signInWithEmailAndPassword(auth, email, password)
      .catch((error: any) => {
        setIsLoading(false);
        toast({
          variant: "destructive",
          title: "Login Failed",
          description: error.message || "Invalid email or password.",
        });
      });
  };

  const handleGuestLogin = () => {
    if (!auth) return;
    setIsLoading(true);
    signInAnonymously(auth)
      .catch((error: any) => {
        setIsLoading(false);
        toast({
          variant: "destructive",
          title: "Guest Access Failed",
          description: error.message,
        });
      });
  };

  if (isUserLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md shadow-lg border-none">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-primary p-3 rounded-2xl glow-primary shadow-lg animate-glow-pulse">
              <ShieldCheck className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">Welcome back</CardTitle>
          <CardDescription>Enter your credentials to access your vault</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Input 
                type="email" 
                placeholder="Email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
                disabled={isLoading}
                className="h-12 bg-muted/50 border-none transition-all focus-visible:glow-primary"
              />
            </div>
            <div className="space-y-2">
              <Input 
                type="password" 
                placeholder="Password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
                disabled={isLoading}
                className="h-12 bg-muted/50 border-none transition-all focus-visible:glow-primary"
              />
            </div>
            <Button 
              type="submit" 
              className="w-full h-12 text-base font-semibold glow-primary hover:shadow-xl transition-all"
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
              Sign In
            </Button>
          </form>
          <div className="mt-4 text-center">
            <Button 
              variant="ghost" 
              onClick={handleGuestLogin} 
              disabled={isLoading}
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              Continue as Guest
            </Button>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <p className="text-sm text-center text-muted-foreground">
            Don't have an account?{" "}
            <Link href="/signup" className="text-primary font-semibold hover:underline">
              Sign up
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
