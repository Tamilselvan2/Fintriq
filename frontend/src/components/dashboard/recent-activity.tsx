'use client';

import { Transaction } from '@/types/models';
import { formatDistanceToNow } from 'date-fns';
import { formatCurrency } from '@/lib/utils';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

interface RecentActivityProps {
  transactions: Transaction[];
  isLoading?: boolean;
}

export function RecentActivity({ transactions, isLoading }: RecentActivityProps) {

  if (!transactions || transactions.length === 0) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center text-slate-500 py-10">
        <div className="w-16 h-16 bg-gradient-to-tr from-brand-blue/20 to-emerald-400/20 rounded-full flex items-center justify-center mb-4">
          <ArrowUpRight className="w-6 h-6 text-brand-blue" />
        </div>
        <p className="font-extrabold text-slate-900 dark:text-white">No recent activity</p>
        <p className="text-xs font-medium mt-1">Transactions will appear here.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white">Recent Activity</h3>
        <Link href="/transactions" className="text-sm text-brand-blue hover:text-blue-600 font-bold transition-colors">
          View All
        </Link>
      </div>
      
      <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
        {transactions.map((t) => {
          const isIncome = t.type === 'INCOME';
          return (
            <div key={t.id} className="group flex justify-between items-center p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-2xl transition-all cursor-default">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform ${isIncome ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/10' : 'bg-rose-500/10 text-rose-400 border border-rose-500/10'}`}>
                  {isIncome ? <ArrowDownRight size={24} strokeWidth={2.5} /> : <ArrowUpRight size={24} strokeWidth={2.5} />}
                </div>
                <div>
                  <p className="text-sm font-black text-white leading-none mb-1.5">{t.category}</p>
                  <p className="text-xs font-bold text-[#94a3b8] opacity-80">{t.description || 'General'}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-base font-black tracking-tight ${isIncome ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {isIncome ? '+' : '-'}{formatCurrency(t.amount)}
                </p>
                <p className="text-[11px] font-black uppercase tracking-[0.1em] text-[#64748b] mt-1.5">
                  {formatDistanceToNow(new Date(t.createdAt), { addSuffix: true })}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
