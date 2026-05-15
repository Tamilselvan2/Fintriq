'use client';

import { useAuth } from '@/hooks/use-auth';
import { usePathname } from 'next/navigation';
import { Bell, User as UserIcon } from 'lucide-react';

export function Header() {
  const pathname = usePathname();
  const { user } = useAuth();
  
  const title = pathname.split('/').filter(Boolean)[0] || 'Dashboard';
  const displayTitle = title.charAt(0).toUpperCase() + title.slice(1);

  return (
    <header className="h-20 bg-white/60 dark:bg-slate-950/60 backdrop-blur-xl border-b border-border flex items-center justify-between px-6 lg:px-10 sticky top-0 z-30 transition-all">
      <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">{displayTitle}</h1>
      
      <div className="flex items-center gap-5">
        <button className="p-2.5 rounded-full text-slate-500 hover:bg-white dark:hover:bg-slate-800 hover:shadow-sm border border-transparent hover:border-border transition-all relative">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-brand-rose rounded-full border border-white dark:border-slate-900"></span>
        </button>
        
        <div className="flex items-center gap-3 pl-5 border-l border-border h-10">
          <div className="hidden sm:block text-right">
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200 leading-none">{user?.email.split('@')[0]}</p>
            <p className="text-[11px] text-brand-blue font-black uppercase tracking-wider mt-1">{user?.role}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-brand-blue to-emerald-400 flex items-center justify-center text-white font-bold shadow-md ring-2 ring-white dark:ring-slate-900">
            {user?.email.charAt(0).toUpperCase() || <UserIcon size={18} />}
          </div>
        </div>
      </div>
    </header>
  );
}
