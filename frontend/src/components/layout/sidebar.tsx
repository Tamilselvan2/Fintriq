'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Receipt, Users, ShieldCheck, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { LogoutButton } from '../auth/logout-button';
import { useOrganization } from '@/hooks/use-organization';

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, adminOnly: false },
  { name: 'Transactions', href: '/transactions', icon: Receipt, adminOnly: false },
  { name: 'Team', href: '/team', icon: Users, adminOnly: false },
  { name: 'Audit Log', href: '/audit', icon: ShieldCheck, adminOnly: true },
  { name: 'Settings', href: '/settings/profile', icon: Settings, adminOnly: false },
];

export function Sidebar() {
  const pathname = usePathname();
  const { isAdmin } = useAuth();
  const { data: org } = useOrganization();

  return (
    <div className="hidden md:flex flex-col h-full bg-sidebar border-r border-border w-64 relative z-50">
      <div className="p-6 border-b border-border flex justify-between items-center h-20 shrink-0">
        <div>
          <h2 className="text-xl font-extrabold text-slate-50 tracking-tight flex items-center gap-2">
            <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.5)]"></span>
            Fintriq
          </h2>
          <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.2em] mt-1.5 opacity-70">
            {org?.name || 'Loading...'}
          </p>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto flex-col">
        {navItems.filter(item => !item.adminOnly || isAdmin).map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-bold transition-all duration-300 relative group',
                isActive
                  ? 'bg-primary/10 text-primary shadow-[0_0_20px_rgba(59,130,246,0.15)] border border-primary/20'
                  : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
              )}
            >
              <item.icon size={18} className={cn(isActive ? 'text-primary' : 'text-muted-foreground/70 group-hover:text-primary transition-colors')} />
              {item.name}
              {isActive && (
                <div className="absolute right-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-primary rounded-full shadow-[0_0_10px_rgba(59,130,246,0.8)]" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border bg-sidebar flex items-center justify-center">
        <div className="w-full">
          <LogoutButton />
        </div>
      </div>
    </div>
  );
}
