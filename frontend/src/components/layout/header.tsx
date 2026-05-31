'use client';

import { useAuth } from '@/hooks/use-auth';
import { usePathname } from 'next/navigation';
import { User as UserIcon } from 'lucide-react';

export function Header() {
  const pathname = usePathname();
  const { user } = useAuth();
  
  const title = pathname.split('/').filter(Boolean)[0] || 'Dashboard';
  const displayTitle = title.charAt(0).toUpperCase() + title.slice(1);

  return (
    <header className="h-20 bg-background/60 backdrop-blur-xl border-b border-border flex items-center justify-between px-6 lg:px-10 sticky top-0 z-30 transition-all">
      <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">{displayTitle}</h1>
      
      <div className="flex items-center gap-5">

        <div className="flex items-center gap-3 pl-5 border-l border-border h-10">
          <div className="hidden sm:block text-right">
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200 leading-none">
              {user?.name || user?.email.split('@')[0]}
            </p>
            <p className="text-[11px] text-brand-blue font-black uppercase tracking-wider mt-1">{user?.role}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-brand-blue to-emerald-400 flex items-center justify-center text-white font-bold shadow-md ring-2 ring-white dark:ring-slate-900 overflow-hidden">
            {user?.profileImageUrl ? (
              <img src={user.profileImageUrl} alt="Profile" className="w-full h-full object-cover" />
            ) : user?.name ? (
              user.name.charAt(0).toUpperCase()
            ) : (
              user?.email.charAt(0).toUpperCase() || <UserIcon size={18} />
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
