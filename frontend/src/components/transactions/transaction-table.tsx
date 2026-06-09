'use client';

import { Transaction } from '@/types/models';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';
import { MoreHorizontal, Pencil, Trash2, Receipt } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { RoleGate } from '../auth/role-gate';
import { Role } from '@/types/models';
import { EmptyState } from '@/components/ui/empty-state';

interface TransactionTableProps {
  transactions: Transaction[];
  onEdit: (t: Transaction) => void;
  onDelete: (t: Transaction) => void;
}

interface MenuPosition {
  top: number;
  right: number;
}

export function TransactionTable({ transactions, onEdit, onDelete }: TransactionTableProps) {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [menuPos, setMenuPos] = useState<MenuPosition>({ top: 0, right: 0 });
  const buttonRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  // Close menu on scroll or resize so it doesn't drift
  useEffect(() => {
    const close = () => setOpenMenuId(null);
    window.addEventListener('scroll', close, true);
    window.addEventListener('resize', close);
    return () => {
      window.removeEventListener('scroll', close, true);
      window.removeEventListener('resize', close);
    };
  }, []);

  const handleMenuToggle = (id: string) => {
    if (openMenuId === id) {
      setOpenMenuId(null);
      return;
    }
    const btn = buttonRefs.current[id];
    if (btn) {
      const rect = btn.getBoundingClientRect();
      setMenuPos({
        top: rect.bottom + 6,
        right: window.innerWidth - rect.right,
      });
    }
    setOpenMenuId(id);
  };

  if (transactions.length === 0) {
    return (
      <EmptyState
        icon={<Receipt className="w-8 h-8" strokeWidth={1.5} />}
        title="No transactions yet"
        description="Create your first transaction to unlock analytics, charts, and detailed reporting."
        className="min-h-[400px]"
      />
    );
  }

  return (
    <>
      <div className="overflow-x-auto bg-card">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-muted/50 border-b border-border text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              <th className="px-6 py-4 whitespace-nowrap">Date</th>
              <th className="px-6 py-4 whitespace-nowrap">Category</th>
              <th className="px-6 py-4">Description</th>
              <th className="px-6 py-4 whitespace-nowrap">Type</th>
              <th className="px-6 py-4 whitespace-nowrap text-right">Amount</th>
              <th className="px-6 py-4 whitespace-nowrap text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {transactions.map((t) => {
              const isIncome = t.type === 'INCOME';
              return (
                <tr key={t.id} className="hover:bg-primary/[0.02] border-b border-border transition-colors group">
                  <td className="px-6 py-5 whitespace-nowrap text-sm font-bold text-muted-foreground/80">
                    {format(new Date(t.transactionDate ?? t.createdAt), 'MMM dd, yyyy')}
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap text-sm text-muted-foreground">
                    <span className="bg-slate-900/50 px-3 py-1.5 rounded-lg text-xs font-bold border border-border/50 text-slate-400 group-hover:border-primary/30 transition-all">
                      {t.category}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-sm font-extrabold text-foreground max-w-[250px] truncate group-hover:text-primary transition-colors">
                    {t.description || <span className="text-muted-foreground/60 font-normal italic">No description</span>}
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <span className={`inline-flex items-center px-3 py-1.5 rounded-xl text-[10px] uppercase tracking-widest font-black ${isIncome ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                      {t.type}
                    </span>
                  </td>
                  <td className={`px-6 py-5 whitespace-nowrap text-base font-black tracking-tight text-right ${isIncome ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {isIncome ? '+' : '-'}{formatCurrency(t.amount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <RoleGate allowedRoles={[Role.ADMIN, Role.ACCOUNTANT]}>
                      <button
                        ref={(el) => { buttonRefs.current[t.id] = el; }}
                        onClick={() => handleMenuToggle(t.id)}
                        className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
                        aria-label="Transaction actions"
                      >
                        <MoreHorizontal size={18} />
                      </button>
                    </RoleGate>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Fixed-position dropdown — never clipped by table overflow */}
      {openMenuId && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpenMenuId(null)} />
          <div
            className="fixed z-50 w-40 rounded-xl bg-white dark:bg-slate-800 shadow-2xl ring-1 ring-black/10 dark:ring-white/10 overflow-hidden"
            style={{ top: menuPos.top, right: menuPos.right }}
          >
            <div className="p-1.5 flex flex-col gap-0.5">
              <button
                onClick={() => { const t = transactions.find(tx => tx.id === openMenuId); if (t) onEdit(t); setOpenMenuId(null); }}
                className="flex w-full items-center gap-3 px-3 py-2.5 text-sm font-semibold rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <Pencil className="h-4 w-4 text-brand-blue" />
                Edit
              </button>
              <RoleGate allowedRoles={[Role.ADMIN]}>
                <button
                  onClick={() => { const t = transactions.find(tx => tx.id === openMenuId); if (t) onDelete(t); setOpenMenuId(null); }}
                  className="flex w-full items-center gap-3 px-3 py-2.5 text-sm font-semibold rounded-lg text-brand-rose hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"
                >
                  <Trash2 className="h-4 w-4 text-brand-rose" />
                  Delete
                </button>
              </RoleGate>
            </div>
          </div>
        </>
      )}
    </>
  );
}

