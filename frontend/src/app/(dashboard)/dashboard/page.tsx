'use client';

import { useDashboard } from '@/hooks/use-dashboard';
import { KpiCard } from '@/components/dashboard/kpi-card';
import { RevenueChart } from '@/components/dashboard/revenue-chart';
import { CategoryBreakdown } from '@/components/dashboard/category-breakdown';
import { RecentActivity } from '@/components/dashboard/recent-activity';
import { Wallet, TrendingUp, TrendingDown, PiggyBank } from 'lucide-react';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { DashboardSkeleton } from '@/components/skeletons/dashboard-skeleton';
import { useState } from 'react';
import { FloatingAddTransaction } from '@/components/transactions/floating-add-transaction';
import { TransactionModal } from '@/components/transactions/transaction-modal';

export default function DashboardPage() {
  const { data, isLoading, isError, error } = useDashboard();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <ErrorBoundary>
      <div className="space-y-10 animate-in fade-in duration-1000">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight">Dashboard Overview</h2>
          <p className="text-[#94a3b8] mt-1.5 font-bold text-sm uppercase tracking-wider opacity-70">Here is what's happening in your organization today</p>
        </div>
      </div>

      {(isLoading && !data) ? (
        <DashboardSkeleton />
      ) : isError ? (
        <div className="bg-card border border-border rounded-3xl p-8 sm:p-12 shadow-sm">
          <h3 className="text-2xl font-bold text-foreground">Dashboard unavailable</h3>
          <p className="mt-3 text-slate-500 dark:text-slate-400">{(error as any)?.message || 'Please refresh the page or try again later.'}</p>
        </div>
      ) : !isLoading && data?.overview.transactionCount === 0 ? (
        <div className="bg-card border border-border rounded-3xl p-8 sm:p-12 shadow-sm relative overflow-hidden">
          {/* Subtle accent glow - only visible in dark mode or very subtle in light */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 dark:bg-primary/20 rounded-full -mr-24 -mt-24 blur-[100px] pointer-events-none"></div>
          
          <div className="relative z-10 max-w-2xl">
            <h3 className="text-2xl sm:text-4xl font-black text-foreground tracking-tight mb-4">Welcome to Fintriq</h3>
            <p className="text-muted-foreground text-lg mb-8 leading-relaxed">Your financial clarity journey begins here. It looks like you haven't added any transactions yet. Let's get your dashboard set up.</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <a href="/transactions" className="group flex items-start gap-4 bg-background dark:bg-slate-900/50 p-6 rounded-2xl border border-border hover:border-primary/50 hover:shadow-md transition-all">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Wallet size={20} className="text-primary group-hover:scale-110 transition-transform" />
                </div>
                <div>
                  <h4 className="font-bold text-foreground">Add First Transaction</h4>
                  <p className="text-xs text-muted-foreground mt-1">Record income or expenses to see analytics.</p>
                </div>
              </a>
              <a href="/team" className="group flex items-start gap-4 bg-background dark:bg-slate-900/50 p-6 rounded-2xl border border-border hover:border-emerald-500/50 hover:shadow-md transition-all">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                  <PiggyBank size={20} className="text-emerald-500 group-hover:scale-110 transition-transform" />
                </div>
                <div>
                  <h4 className="font-bold text-foreground">Invite Teammates</h4>
                  <p className="text-xs text-muted-foreground mt-1">Add accountants or admins to your org.</p>
                </div>
              </a>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <KpiCard 
          title="Total Balance" 
          value={data?.overview.balance || 0} 
          trend={data?.overview.kpi?.balanceGrowth !== undefined ? Number(data.overview.kpi.balanceGrowth.toFixed(1)) : undefined}
          isLoading={isLoading} 
          icon={<Wallet size={20} className="text-brand-blue" />}
        />
        <KpiCard 
          title="Total Income" 
          value={data?.overview.totalIncome || 0} 
          trend={data?.overview.kpi?.incomeGrowth !== undefined ? Number(data.overview.kpi.incomeGrowth.toFixed(1)) : undefined}
          isLoading={isLoading} 
          icon={<TrendingUp size={20} className="text-brand-emerald" />}
        />
        <KpiCard 
          title="Total Expenses" 
          value={data?.overview.totalExpense || 0} 
          trend={data?.overview.kpi?.expenseGrowth !== undefined ? Number(data.overview.kpi.expenseGrowth.toFixed(1)) : undefined}
          trendVariant="negative"
          isLoading={isLoading} 
          icon={<TrendingDown size={20} className="text-brand-rose" />}
        />
        <KpiCard 
          title="Transactions" 
          value={data?.overview.transactionCount || 0} 
          isCurrency={false} 
          isLoading={isLoading} 
          icon={<PiggyBank size={20} className="text-purple-500" />}
          subtitle="All-time recorded"
        />
      </div>

      {/* Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-[450px] bg-card dark:bg-slate-900 border border-border rounded-3xl shadow-sm hover:shadow-md transition-shadow p-6 sm:p-8">
           <RevenueChart data={data?.monthlyAnalytics || []} isLoading={isLoading} />
        </div>
        <div className="h-[450px] bg-card dark:bg-slate-900 border border-border rounded-3xl shadow-sm hover:shadow-md transition-shadow p-6 sm:p-8">
           <CategoryBreakdown data={data?.categorySummaries?.expense || []} isLoading={isLoading} />
        </div>
      </div>

      {/* Recent Activity List */}
      <div className="bg-card dark:bg-slate-900 border border-border rounded-3xl shadow-sm hover:shadow-md transition-shadow p-6 sm:p-8 h-[400px]">
         <RecentActivity transactions={data?.recentTransactions || []} isLoading={isLoading} />
      </div>
      </>
      )}
      <FloatingAddTransaction onClick={() => setIsModalOpen(true)} />
      <TransactionModal isOpen={isModalOpen} onOpenChange={setIsModalOpen} />
    </div>
    </ErrorBoundary>
  );
}
