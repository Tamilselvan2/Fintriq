'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Receipt, Users, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, adminOnly: false },
  { name: 'Transactions', href: '/transactions', icon: Receipt, adminOnly: false },
  { name: 'Team', href: '/team', icon: Users, adminOnly: false },
  { name: 'Audit Log', href: '/audit', icon: ShieldCheck, adminOnly: true },
];

export function BottomNav() {
  const pathname = usePathname();
  const { isAdmin } = useAuth();

  const visibleItems = navItems.filter(item => !item.adminOnly || isAdmin);

  return (
    <div className="md:hidden fixed bottom-0 left-0 w-full z-40 bg-card/90 backdrop-blur-xl border-t border-border shadow-[0_-10px_40px_rgba(0,0,0,0.2)] pb-[env(safe-area-inset-bottom)]">
      <nav className="flex items-center justify-around h-[70px] px-2">
        {visibleItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center w-full h-full gap-0.5 rounded-xl transition-all',
                isActive 
                  ? 'text-primary' 
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <div className={cn(
                "p-1.5 rounded-full transition-all duration-300 relative",
                isActive ? "bg-primary/10 shadow-[0_0_15px_rgba(59,130,246,0.15)]" : ""
              )}>
                <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} className="transition-transform active:scale-95" />
              </div>
              <span className={cn(
                "text-[10px] font-bold tracking-wide transition-all",
                isActive ? "text-primary" : "text-muted-foreground"
              )}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
