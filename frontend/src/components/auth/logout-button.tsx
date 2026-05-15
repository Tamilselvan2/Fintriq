'use client';

import { useAuth } from '@/hooks/use-auth';
import { LogOut } from 'lucide-react';

export function LogoutButton() {
  const { logout } = useAuth();

  return (
    <button
      onClick={() => logout()}
      className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:text-brand-rose transition-colors dark:text-slate-300 dark:hover:text-brand-rose"
    >
      <LogOut size={16} />
      <span>Sign out</span>
    </button>
  );
}
