'use client';

import { cn, formatCurrency } from '@/lib/utils';
import { TrendingDown, TrendingUp } from 'lucide-react';

interface KpiCardProps {
  title: string;
  value: number;
  isCurrency?: boolean;
  trend?: number; // percentage
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export function KpiCard({ title, value, isCurrency = true, trend, isLoading, icon }: KpiCardProps) {
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-border animate-pulse">
        <div className="flex justify-between items-start mb-4">
          <div className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded"></div>
          <div className="h-5 w-5 bg-slate-200 dark:bg-slate-800 rounded"></div>
        </div>
        <div className="h-8 w-32 bg-slate-200 dark:bg-slate-800 rounded mb-2"></div>
        <div className="h-3 w-16 bg-slate-200 dark:bg-slate-800 rounded"></div>
      </div>
    );
  }

  const isPositive = trend && trend > 0;
  const isNegative = trend && trend < 0;

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-border transition-all hover:shadow-lg hover:-translate-y-1 relative overflow-hidden group">
      {/* Subtle background glow effect */}
      <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full opacity-10 group-hover:opacity-[0.15] transition-opacity bg-gradient-to-br from-brand-blue to-emerald-400 blur-2xl"></div>
      
      <div className="flex justify-between items-start mb-4 relative z-10">
        <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400">{title}</h3>
        {icon && <div className="text-slate-400 bg-slate-100 dark:bg-slate-800 p-2 rounded-lg">{icon}</div>}
      </div>
      
      <div className="relative z-10">
        <p className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {isCurrency ? formatCurrency(value) : value.toLocaleString()}
        </p>
        
        {trend !== undefined && (
          <div className={cn(
            "flex items-center gap-1 mt-3 text-sm font-bold",
            isPositive ? "text-brand-emerald" : isNegative ? "text-brand-rose" : "text-slate-500"
          )}>
            {isPositive ? <TrendingUp size={16} strokeWidth={3} /> : isNegative ? <TrendingDown size={16} strokeWidth={3} /> : null}
            <span>{Math.abs(trend)}%</span>
            <span className="text-slate-400 dark:text-slate-500 text-xs font-medium ml-1">vs last month</span>
          </div>
        )}
      </div>
    </div>
  );
}
