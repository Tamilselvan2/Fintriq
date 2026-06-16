'use client';

import { WifiOff } from 'lucide-react';
import Link from 'next/link';

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-[#020817] flex flex-col items-center justify-center p-4">
      <div className="flex items-center gap-2 mb-8">
        <span className="w-3 h-3 bg-blue-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(59,130,246,0.5)]"></span>
        <h1 className="text-3xl font-extrabold text-slate-50 tracking-tight">
          Fintriq
        </h1>
      </div>
      
      <div className="bg-card border border-border rounded-xl p-8 max-w-md w-full text-center shadow-2xl">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
          <WifiOff className="w-8 h-8 text-muted-foreground" />
        </div>
        
        <h2 className="text-xl font-bold text-foreground mb-3">
          You are offline
        </h2>
        
        <p className="text-muted-foreground mb-8 text-sm">
          It looks like you've lost your internet connection. We'll automatically reconnect you when you're back online.
        </p>
        
        <button 
          onClick={() => window.location.reload()}
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90 py-2.5 rounded-lg font-semibold transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
