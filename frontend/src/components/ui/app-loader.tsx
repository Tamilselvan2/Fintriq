'use client';

import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface AppLoaderProps {
  isLoading: boolean;
}

export function AppLoader({ isLoading }: AppLoaderProps) {
  const [show, setShow] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      setIsFadingOut(true);
      const timer = setTimeout(() => setShow(false), 500); // Wait for transition
      return () => clearTimeout(timer);
    } else {
      setIsFadingOut(false);
      setShow(true);
    }
  }, [isLoading]);

  if (!show) return null;

  return (
    <div
      className={cn(
        'fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-slate-950 transition-opacity duration-500 ease-in-out pointer-events-none',
        isFadingOut ? 'opacity-0' : 'opacity-100'
      )}
    >
      <div 
        className={cn(
          "relative w-28 h-28 transition-transform duration-500 ease-in-out",
          isFadingOut ? "scale-105" : "scale-100"
        )}
      >
        {/* Static Background Ring */}
        <svg 
          className="absolute inset-0 w-full h-full" 
          viewBox="0 0 100 100"
        >
          <circle cx="50" cy="50" r="46" fill="none" className="stroke-slate-800/60" strokeWidth="4" />
        </svg>

        {/* Spinning Highlight Arc */}
        <svg 
          className="absolute inset-0 w-full h-full animate-spin" 
          viewBox="0 0 100 100"
          style={{ animationDuration: '1.2s' }}
        >
          <circle 
            cx="50" 
            cy="50" 
            r="46" 
            fill="none" 
            className="stroke-brand-blue" 
            strokeWidth="4" 
            strokeLinecap="round" 
            strokeDasharray="289" 
            strokeDashoffset="216" 
          />
        </svg>

        {/* Centered Logo */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center w-[72px] h-[72px] bg-slate-900 rounded-full">
          <span className="text-[32px] font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-brand-blue to-blue-400">
            F
          </span>
        </div>
      </div>
      
      <div className="mt-8 text-xs font-bold tracking-[0.2em] text-slate-500 uppercase animate-pulse">
        Loading Fintriq...
      </div>
    </div>
  );
}
