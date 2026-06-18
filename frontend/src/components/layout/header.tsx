'use client';

import { useAuth } from '@/hooks/use-auth';
import { usePathname } from 'next/navigation';
import { User as UserIcon, Building, Shield, Sliders, LogOut } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

export function Header() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const title = pathname.split('/').filter(Boolean)[0] || 'Dashboard';
  const displayTitle = title.charAt(0).toUpperCase() + title.slice(1);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="fixed md:sticky top-0 left-0 md:left-auto w-full h-16 md:h-20 bg-background/80 backdrop-blur-xl border-b border-border flex items-center justify-between px-4 md:px-6 lg:px-10 z-40 transition-all">
      
      {/* Desktop Title */}
      <h1 className="hidden md:block text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
        {displayTitle}
      </h1>

      {/* Mobile Branding */}
      <div className="md:hidden flex items-center gap-2">
        <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.5)]"></span>
        <span className="font-black text-xl text-slate-900 dark:text-white tracking-tight">Fintriq</span>
      </div>
      
      <div className="flex items-center gap-4 md:gap-5">
        {/* Quick Logout (Mobile Optional) */}
        <button 
          onClick={() => logout()}
          className="md:hidden p-2 -mr-2 text-muted-foreground hover:text-danger transition-colors"
          aria-label="Sign Out"
        >
          <LogOut size={20} />
        </button>

        <div className="flex items-center gap-3 md:pl-5 md:border-l border-border h-10 relative" ref={dropdownRef}>
          <div className="hidden sm:block text-right">
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200 leading-none">
              {user?.name || user?.email.split('@')[0]}
            </p>
            <p className="text-[11px] text-brand-blue font-black uppercase tracking-wider mt-1">{user?.role}</p>
          </div>
          
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-tr from-brand-blue to-emerald-400 flex items-center justify-center text-white font-bold shadow-md ring-2 ring-background hover:ring-brand-blue/50 transition-all overflow-hidden focus:outline-none"
          >
            {user?.profileImageUrl ? (
              <img src={user.profileImageUrl} alt="Profile" className="w-full h-full object-cover" />
            ) : user?.name ? (
              user.name.charAt(0).toUpperCase()
            ) : (
              user?.email.charAt(0).toUpperCase() || <UserIcon size={18} />
            )}
          </button>

          {/* Avatar Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-card border border-border shadow-2xl rounded-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 origin-top-right">
              <div className="px-4 py-3 border-b border-border/50 md:hidden">
                <p className="text-sm font-bold text-foreground truncate">{user?.name || user?.email.split('@')[0]}</p>
                <p className="text-xs text-muted-foreground truncate mt-0.5">{user?.email}</p>
              </div>
              
              <div className="py-1">
                <Link href="/settings/profile" className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors" onClick={() => setIsDropdownOpen(false)}>
                  <UserIcon size={16} /> Profile
                </Link>
                <Link href="/settings/organization" className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors" onClick={() => setIsDropdownOpen(false)}>
                  <Building size={16} /> Organization
                </Link>
                <Link href="/settings/preferences" className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors" onClick={() => setIsDropdownOpen(false)}>
                  <Sliders size={16} /> Preferences
                </Link>
                <Link href="/settings/security" className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors" onClick={() => setIsDropdownOpen(false)}>
                  <Shield size={16} /> Security
                </Link>
              </div>
              
              <div className="border-t border-border/50 mt-1 py-1">
                <button 
                  onClick={() => { setIsDropdownOpen(false); logout(); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-danger hover:bg-danger/10 transition-colors"
                >
                  <LogOut size={16} /> Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
