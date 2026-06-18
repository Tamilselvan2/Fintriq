'use client';

import { cn, formatCompactCurrency, formatCurrency } from '@/lib/utils';
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
    <div className="bg-card p-6 rounded-2xl shadow-xl border border-border/60 transition-all hover:shadow-2xl hover:-translate-y-1 relative overflow-hidden group flex flex-col h-full min-w-0">
      {/* Subtle background glow effect - Restored to Blue/Indigo */}
      <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full opacity-10 group-hover:opacity-20 transition-opacity bg-gradient-to-br from-primary to-blue-600 blur-2xl"></div>

      <div className="mb-1 relative z-10 pr-12 md:pr-14 lg:pr-16">
        <h3 className="text-xs md:text-sm font-bold text-muted-foreground uppercase tracking-wider">{title}</h3>
      </div>

      {icon && (
        <div className="absolute top-6 right-6 text-muted-foreground bg-muted/50 flex items-center justify-center rounded-xl border border-border/50 group-hover:text-primary transition-colors z-20 w-10 h-10 md:w-12 md:h-12 lg:w-11 lg:h-11 [&_svg]:w-5 [&_svg]:h-5 md:[&_svg]:w-6 md:[&_svg]:h-6 lg:[&_svg]:w-[18px] lg:[&_svg]:h-[18px]">
          {icon}
        </div>
      )}

      <div className="relative z-10 flex flex-col flex-1">
        <div className="flex flex-col gap-0.5 pr-10 md:pr-14 lg:pr-16">
          <p className="text-3xl font-extrabold text-foreground tracking-tight">
            {isCurrency ? formatCompactCurrency(value) : value.toLocaleString()}
          </p>
          {isCurrency ? (
            <p className="text-xs font-medium text-muted-foreground">
              {formatCurrency(value)}
            </p>
          ) : (
            <p className="text-xs font-medium text-muted-foreground">
              Recorded entries
            </p>
          )}
        </div>

        <div className="flex-1" />

        {subtitle && !trend && (
          <div className="flex flex-col mt-4">
            <div className="flex items-center gap-1 text-sm font-bold text-muted-foreground">
              <span>{subtitle}</span>
            </div>
            <span className="text-muted-foreground text-xs font-medium mt-0.5">Updated in real-time</span>
          </div>
        )}

        {trend !== undefined && (
          <div className="flex flex-col mt-4">
            <div className={cn(
              "flex items-center gap-1 text-sm font-bold",
              trend > 0
                ? (trendVariant === 'negative' ? "text-danger" : "text-success")
                : trend < 0
                  ? (trendVariant === 'negative' ? "text-success" : "text-danger")
                  : "text-muted-foreground"
            )}>
              {trend > 0 ? <TrendingUp size={16} strokeWidth={3} className="shrink-0" /> : trend < 0 ? <TrendingDown size={16} strokeWidth={3} className="shrink-0" /> : null}
              <span>{Math.abs(trend)}%</span>
            </div>
            <span className="text-muted-foreground text-xs font-medium mt-0.5">vs last month</span>
          </div>
        )}
      </div>
    </div>
  );
}
