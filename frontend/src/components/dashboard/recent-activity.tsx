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
  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="flex justify-between items-center mb-6">
          <div className="w-32 h-6 bg-slate-200 dark:bg-slate-800 rounded"></div>
          <div className="w-16 h-4 bg-slate-200 dark:bg-slate-800 rounded"></div>
        </div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex justify-between items-center p-3">
            <div className="flex gap-4 items-center">
              <div className="w-12 h-12 rounded-2xl bg-slate-200 dark:bg-slate-800"></div>
              <div>
                <div className="w-24 h-4 bg-slate-200 dark:bg-slate-800 rounded mb-2.5"></div>
                <div className="w-16 h-3 bg-slate-200 dark:bg-slate-800 rounded"></div>
              </div>
            </div>
            <div className="w-20 h-5 bg-slate-200 dark:bg-slate-800 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!transactions || transactions.length === 0) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center text-slate-500 py-10">
        <p className="font-medium">No recent activity</p>
        <p className="text-sm mt-1">When transactions occur, they will appear here.</p>
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
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform ${isIncome ? 'bg-brand-emerald/10 text-brand-emerald' : 'bg-brand-rose/10 text-brand-rose'}`}>
                  {isIncome ? <ArrowDownRight size={24} strokeWidth={2.5} /> : <ArrowUpRight size={24} strokeWidth={2.5} />}
                </div>
                <div>
                  <p className="text-sm font-extrabold text-slate-900 dark:text-white leading-none mb-1">{t.category}</p>
                  <p className="text-xs font-medium text-slate-500">{t.description || 'General'}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-base font-extrabold tracking-tight ${isIncome ? 'text-brand-emerald' : 'text-slate-900 dark:text-white'}`}>
                  {isIncome ? '+' : '-'}{formatCurrency(t.amount)}
                </p>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mt-1">
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
