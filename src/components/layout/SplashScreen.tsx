"use client";

import React, { useEffect, useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

export function SplashScreen() {
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => setIsVisible(false), 800);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div 
      className={cn(
        "fixed inset-0 z-[100] flex items-center justify-center bg-background transition-all duration-700 ease-in-out",
        isExiting ? "opacity-0 scale-110 pointer-events-none" : "opacity-100"
      )}
    >
      <div className="flex flex-col items-center gap-6 animate-reveal">
        <div className="relative">
          <div className="absolute inset-0 bg-primary/30 blur-3xl animate-pulse rounded-full" />
          <div className="relative bg-primary p-6 rounded-[2rem] shadow-2xl glow-primary">
            <ShieldCheck className="h-20 w-20 text-primary-foreground stroke-[1.5]" />
          </div>
        </div>
        <h1 className="text-6xl font-bold tracking-tighter text-foreground">
          Vault
          <span className="text-primary">.</span>
        </h1>
        <div className="flex gap-1.5 mt-2">
          <div className="h-1.5 w-1.5 rounded-full bg-primary/20 animate-bounce [animation-delay:-0.3s]" />
          <div className="h-1.5 w-1.5 rounded-full bg-primary/40 animate-bounce [animation-delay:-0.15s]" />
          <div className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce" />
        </div>
      </div>
    </div>
  );
}