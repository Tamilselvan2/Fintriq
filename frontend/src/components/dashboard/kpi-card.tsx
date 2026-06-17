'use client';

import { cn, formatCompactCurrency } from '@/lib/utils';
import { TrendingDown, TrendingUp } from 'lucide-react';

interface KpiCardProps {
  title: string;
  value: number;
  isCurrency?: boolean;
  trend?: number; // percentage
  trendVariant?: 'positive' | 'negative' | 'neutral'; // 'positive' means increase is good (green), 'negative' means increase is bad (red)
  subtitle?: string;
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export function KpiCard({ title, value, isCurrency = true, trend, trendVariant = 'positive', subtitle, isLoading, icon }: KpiCardProps) {

  const isPositive = trend && trend > 0;
  const isNegative = trend && trend < 0;

  return (
    <div className="bg-card p-6 rounded-2xl shadow-xl border border-border/60 transition-all hover:shadow-2xl hover:-translate-y-1 relative overflow-hidden group flex flex-col min-w-0">
      {/* Subtle background glow effect - Restored to Blue/Indigo */}
      <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full opacity-10 group-hover:opacity-20 transition-opacity bg-gradient-to-br from-primary to-blue-600 blur-2xl"></div>
      
      <div className="flex justify-between items-start mb-4 relative z-10">
        <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider truncate mr-2">{title}</h3>
        {icon && <div className="text-muted-foreground bg-muted/50 p-2.5 rounded-xl border border-border/50 group-hover:text-primary transition-colors shrink-0">{icon}</div>}
      </div>
      
      <div className="relative z-10">
        <p className="text-3xl font-extrabold text-foreground tracking-tight truncate" title={value.toLocaleString()}>
          {isCurrency ? formatCompactCurrency(value) : value.toLocaleString()}
        </p>
        
        {subtitle && !trend && (
          <div className="flex items-center gap-1 mt-3 text-sm font-bold text-muted-foreground">
            <span>{subtitle}</span>
          </div>
        )}
        
        {trend !== undefined && (
          <div className={cn(
            "flex items-center gap-1 mt-3 text-sm font-bold truncate",
            trend > 0 
              ? (trendVariant === 'negative' ? "text-danger" : "text-success") 
              : trend < 0 
                ? (trendVariant === 'negative' ? "text-success" : "text-danger")
                : "text-muted-foreground"
          )}>
            {trend > 0 ? <TrendingUp size={16} strokeWidth={3} className="shrink-0" /> : trend < 0 ? <TrendingDown size={16} strokeWidth={3} className="shrink-0" /> : null}
            <span>{Math.abs(trend)}%</span>
            <span className="text-muted-foreground text-xs font-medium ml-1 truncate">vs last month</span>
          </div>
        )}
      </div>
    </div>
  );
}
