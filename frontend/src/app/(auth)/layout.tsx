import React from 'react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-background overflow-hidden py-12 px-4 sm:px-6 lg:px-8">
      {/* Decorative background gradients - Restored to deep cinematic fintech palette */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-600/20 rounded-full filter blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-emerald-500/10 rounded-full filter blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.08)_0%,transparent_70%)] pointer-events-none"></div>
      <div className="absolute bottom-[5%] left-[10%] w-[30%] h-[30%] bg-rose-500/5 rounded-full filter blur-[100px] animate-pulse" style={{ animationDelay: '4s' }}></div>

      {/* Glassmorphism Auth Card - Premium Translucent Surface */}
      <div className="relative w-full max-w-md p-8 sm:p-12 rounded-[32px] bg-card/70 backdrop-blur-3xl border border-white/5 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.6)] z-10 transition-all duration-500 hover:shadow-[0_35px_60px_-15px_rgba(0,0,0,0.7)]">
        {children}
      </div>
    </div>
  );
}
