import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { ApiResponse } from '@/types/api';
import { Transaction } from '@/types/models';

export interface DashboardData {
  overview: {
    totalIncome: number;
    totalExpense: number;
    balance: number;
    transactionCount: number;
  };
  categorySummaries: {
    income: { category: string; total: number }[];
    expense: { category: string; total: number }[];
  };
  monthlyAnalytics: {
    month: string;
    income: number;
    expense: number;
  }[];
  recentTransactions: Transaction[];
}

export function useDashboard(startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: ['dashboard', startDate, endDate],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      
      const res = await api.get<ApiResponse<DashboardData>>(`/dashboard?${params.toString()}`);
      return res.data.data;
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
    refetchInterval: 1000 * 60 * 5, // auto background sync every 5 mins
  });
}
