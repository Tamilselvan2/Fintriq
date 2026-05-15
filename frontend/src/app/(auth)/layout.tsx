import React from 'react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 overflow-hidden py-12 px-4 sm:px-6 lg:px-8">
      {/* Decorative background gradients */}
      <div className="absolute top-10 left-1/4 w-72 h-72 bg-brand-blue rounded-full mix-blend-multiply dark:mix-blend-lighten filter blur-[100px] opacity-40 animate-blob"></div>
      <div className="absolute top-20 right-1/4 w-72 h-72 bg-brand-emerald rounded-full mix-blend-multiply dark:mix-blend-lighten filter blur-[100px] opacity-40 animate-blob" style={{ animationDelay: '2s' }}></div>
      <div className="absolute -bottom-8 left-1/3 w-72 h-72 bg-brand-rose rounded-full mix-blend-multiply dark:mix-blend-lighten filter blur-[100px] opacity-40 animate-blob" style={{ animationDelay: '4s' }}></div>

      {/* Glassmorphism Card Container */}
      <div className="relative w-full max-w-md p-8 sm:p-10 rounded-2xl bg-white/60 dark:bg-slate-900/60 backdrop-blur-2xl border border-white/50 dark:border-slate-800/50 shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.5)] z-10">
        {children}
      </div>
    </div>
  );
}
