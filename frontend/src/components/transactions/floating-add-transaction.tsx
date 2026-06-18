import { Plus } from 'lucide-react';
import { RoleGate } from '@/components/auth/role-gate';
import { Role } from '@/types/models';

interface FloatingAddTransactionProps {
  onClick: () => void;
}

export function FloatingAddTransaction({ onClick }: FloatingAddTransactionProps) {
  return (
    <RoleGate allowedRoles={[Role.ADMIN, Role.ACCOUNTANT]}>
      <button
        onClick={onClick}
        aria-label="Add Transaction"
        className="fixed z-50 flex items-center justify-center text-white bg-brand-blue hover:brightness-110 rounded-2xl shadow-lg border border-white/10 backdrop-blur-md transition-all duration-200 hover:scale-[1.03] active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/50 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900 w-[56px] h-[56px] right-6 bottom-[max(90px,calc(70px+env(safe-area-inset-bottom)))] md:bottom-[max(24px,env(safe-area-inset-bottom))]"
      >
        <Plus size={28} strokeWidth={2.5} />
      </button>
    </RoleGate>
  );
}
