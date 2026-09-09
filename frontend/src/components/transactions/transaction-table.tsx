'use client';

import { Transaction } from '@/types/models';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';
import { MoreHorizontal, Pencil, Trash2, Receipt, ChevronDown } from 'lucide-react';
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
  const [openMenu, setOpenMenu] = useState<{ id: string, refId: string } | null>(null);
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);
  const [menuPos, setMenuPos] = useState<MenuPosition>({ top: 0, right: 0 });
  const buttonRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  // Close menu on scroll or resize so it doesn't drift
  useEffect(() => {
    const close = () => setOpenMenu(null);
    window.addEventListener('scroll', close, true);
    window.addEventListener('resize', close);
    return () => {
      window.removeEventListener('scroll', close, true);
      window.removeEventListener('resize', close);
    };
  }, []);

  const handleMenuToggle = (id: string, refId: string) => {
    if (openMenu?.id === id && openMenu?.refId === refId) {
      setOpenMenu(null);
      return;
    }
    const btn = buttonRefs.current[refId];
    if (btn) {
      const rect = btn.getBoundingClientRect();
      setMenuPos({
        top: rect.bottom + 6,
        right: window.innerWidth - rect.right,
      });
    }
    setOpenMenu({ id, refId });
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
      {/* Mobile Card List View */}
      <div className="md:hidden space-y-3 px-4 py-4">
        {transactions.map((t) => {
          const isIncome = t.type === 'INCOME';
          const isExpanded = expandedCardId === t.id;
          return (
            <div 
              key={t.id} 
              className="bg-white dark:bg-slate-900 border border-border p-4 rounded-xl flex flex-col shadow-sm cursor-pointer transition-all active:scale-[0.98]"
              onClick={() => setExpandedCardId(isExpanded ? null : t.id)}
            >
              <div className="flex justify-between items-center gap-2">
                <div className="min-w-0 flex-1">
                  <p className="font-extrabold text-foreground text-sm truncate">
                    {t.category}
                  </p>
                  <p className="text-xs font-bold text-muted-foreground mt-1">
                    {format(new Date(t.transactionDate ?? t.createdAt), 'MMM dd, yyyy')}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <p className={`text-base font-black tracking-tight text-right ${isIncome ? 'text-emerald-500 dark:text-emerald-400' : 'text-rose-500 dark:text-rose-400'}`}>
                    {isIncome ? '+' : '-'}{formatCurrency(t.amount)}
                  </p>
                  <div className="flex items-center gap-1">
                    <RoleGate allowedRoles={[Role.ADMIN, Role.ACCOUNTANT]}>
                      <button
                        ref={(el) => { buttonRefs.current[`mob-${t.id}`] = el; }}
                        onClick={(e) => { e.stopPropagation(); handleMenuToggle(t.id, `mob-${t.id}`); }}
                        className="p-1.5 -mr-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                        aria-label="Transaction actions"
                      >
                        <MoreHorizontal size={18} />
                      </button>
                    </RoleGate>
                    <ChevronDown size={18} className={`text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                  </div>
                </div>
              </div>
              
              {isExpanded && (
                <div className="mt-3 pt-3 border-t border-border grid grid-cols-2 gap-y-3 gap-x-4 animate-in slide-in-from-top-2 fade-in duration-200 text-sm">
                  <div>
                    <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Type</span>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] uppercase tracking-widest font-black border ${isIncome ? 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' : 'bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20'}`}>
                      {t.type}
                    </span>
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Category</span>
                    <span className="font-semibold text-slate-900 dark:text-slate-100">{t.category}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Date & Time</span>
                    <span className="font-semibold text-slate-900 dark:text-slate-100">
                      {format(new Date(t.transactionDate ?? t.createdAt), 'MMM dd, yyyy hh:mm a')}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Description</span>
                    <span className="font-medium text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                      {t.description || <span className="text-slate-400 italic font-normal">No description</span>}
                    </span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto bg-card rounded-t-2xl">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-border text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
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
                <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 border-b border-border transition-colors group">
                  <td className="px-6 py-5 whitespace-nowrap text-sm font-bold text-muted-foreground/80">
                    {format(new Date(t.transactionDate ?? t.createdAt), 'MMM dd, yyyy')}
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap text-sm text-muted-foreground">
                    <span className="bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg text-xs font-bold border border-border text-slate-500 dark:text-slate-400 group-hover:border-slate-300 dark:group-hover:border-slate-600 transition-all">
                      {t.category}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-sm font-extrabold text-foreground max-w-[250px] truncate group-hover:text-brand-blue dark:group-hover:text-blue-400 transition-colors">
                    {t.description || <span className="text-muted-foreground/60 font-normal italic">No description</span>}
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <span className={`inline-flex items-center px-3 py-1.5 rounded-xl text-[10px] uppercase tracking-widest font-black border ${isIncome ? 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' : 'bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20'}`}>
                      {t.type}
                    </span>
                  </td>
                  <td className={`px-6 py-5 whitespace-nowrap text-base font-black tracking-tight text-right ${isIncome ? 'text-emerald-500 dark:text-emerald-400' : 'text-rose-500 dark:text-rose-400'}`}>
                    {isIncome ? '+' : '-'}{formatCurrency(t.amount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <RoleGate allowedRoles={[Role.ADMIN, Role.ACCOUNTANT]}>
                      <button
                        ref={(el) => { buttonRefs.current[`desk-${t.id}`] = el; }}
                        onClick={() => handleMenuToggle(t.id, `desk-${t.id}`)}
                        className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
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
      {openMenu && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpenMenu(null)} />
          <div
            className="fixed z-50 w-40 rounded-xl bg-white dark:bg-slate-800 shadow-2xl ring-1 ring-black/10 dark:ring-white/10 overflow-hidden animate-in fade-in zoom-in-95 duration-100"
            style={{ top: menuPos.top, right: menuPos.right }}
          >
            <div className="p-1.5 flex flex-col gap-0.5">
              <button
                onClick={() => { const t = transactions.find(tx => tx.id === openMenu.id); if (t) onEdit(t); setOpenMenu(null); }}
                className="flex w-full items-center gap-3 px-3 py-2.5 text-sm font-semibold rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <Pencil className="h-4 w-4 text-brand-blue dark:text-blue-400" />
                Edit
              </button>
              <RoleGate allowedRoles={[Role.ADMIN]}>
                <button
                  onClick={() => { const t = transactions.find(tx => tx.id === openMenu.id); if (t) onDelete(t); setOpenMenu(null); }}
                  className="flex w-full items-center gap-3 px-3 py-2.5 text-sm font-semibold rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"
                >
                  <Trash2 className="h-4 w-4 text-rose-600 dark:text-rose-400" />
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

