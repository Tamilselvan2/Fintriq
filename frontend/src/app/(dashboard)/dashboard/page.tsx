'use client';

import { useDashboard } from '@/hooks/use-dashboard';
import { KpiCard } from '@/components/dashboard/kpi-card';
import { RevenueChart } from '@/components/dashboard/revenue-chart';
import { CategoryBreakdown } from '@/components/dashboard/category-breakdown';
import { RecentActivity } from '@/components/dashboard/recent-activity';
import { Wallet, TrendingUp, TrendingDown, PiggyBank } from 'lucide-react';

export default function DashboardPage() {
  const { data, isLoading } = useDashboard();

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Dashboard Overview</h2>
          <p className="text-slate-500 mt-1">Here is what's happening in your organization today.</p>
        </div>
      </div>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <KpiCard 
          title="Total Balance" 
          value={data?.overview.balance || 0} 
          isLoading={isLoading} 
          icon={<Wallet size={20} className="text-brand-blue" />}
        />
        <KpiCard 
          title="Total Income" 
          value={data?.overview.totalIncome || 0} 
          isLoading={isLoading} 
          icon={<TrendingUp size={20} className="text-brand-emerald" />}
        />
        <KpiCard 
          title="Total Expenses" 
          value={data?.overview.totalExpense || 0} 
          isLoading={isLoading} 
          icon={<TrendingDown size={20} className="text-brand-rose" />}
        />
        <KpiCard 
          title="Transactions" 
          value={data?.overview.transactionCount || 0} 
          isCurrency={false} 
          isLoading={isLoading} 
          icon={<PiggyBank size={20} className="text-purple-500" />}
        />
      </div>

      {/* Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-[450px] bg-white dark:bg-slate-900 border border-border rounded-3xl shadow-sm hover:shadow-md transition-shadow p-6 sm:p-8">
           <RevenueChart data={data?.monthlyAnalytics || []} isLoading={isLoading} />
        </div>
        <div className="h-[450px] bg-white dark:bg-slate-900 border border-border rounded-3xl shadow-sm hover:shadow-md transition-shadow p-6 sm:p-8">
           <CategoryBreakdown data={data?.categorySummaries?.expense || []} isLoading={isLoading} />
        </div>
      </div>

      {/* Recent Activity List */}
      <div className="bg-white dark:bg-slate-900 border border-border rounded-3xl shadow-sm hover:shadow-md transition-shadow p-6 sm:p-8 h-[400px]">
         <RecentActivity transactions={data?.recentTransactions || []} isLoading={isLoading} />
      </div>
    </div>
  );
}
