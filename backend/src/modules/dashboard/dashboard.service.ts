import { DashboardRepository } from './dashboard.repository';

export class DashboardService {
  private repository = new DashboardRepository();

  async getDashboardData(orgId: string, startDateStr?: string, endDateStr?: string) {
    const startDate = startDateStr ? new Date(startDateStr) : undefined;
    const endDate = endDateStr ? new Date(endDateStr) : undefined;

    // Run aggregations in parallel to avoid N+1 and minimize latency
    const [
      aggregates, 
      incomeCategories, 
      expenseCategories, 
      monthlyData, 
      recentTransactions
    ] = await Promise.all([
      this.repository.getAggregates(orgId, startDate, endDate),
      this.repository.getCategorySummaries(orgId, 'INCOME', startDate, endDate),
      this.repository.getCategorySummaries(orgId, 'EXPENSE', startDate, endDate),
      this.repository.getMonthlyAnalytics(orgId, startDate, endDate),
      this.repository.getRecentTransactions(orgId, 5)
    ]);

    // Process Aggregates
    let totalIncome = 0;
    let totalExpense = 0;
    let transactionCount = 0;

    for (const agg of aggregates) {
      transactionCount += agg._count.id;
      if (agg.type === 'INCOME') {
        totalIncome += agg._sum.amount || 0;
      } else if (agg.type === 'EXPENSE') {
        totalExpense += agg._sum.amount || 0;
      }
    }

    const balance = totalIncome - totalExpense;

    // Process Category Summaries
    const formatCategory = (cat: any) => ({
      category: cat.category,
      total: cat._sum.amount || 0
    });

    // Process Monthly Analytics
    const monthlyMap = new Map<string, { month: string; income: number; expense: number }>();
    
    for (const row of monthlyData) {
      // row.month is a Date object. Convert to YYYY-MM
      const monthStr = row.month.toISOString().substring(0, 7);
      
      if (!monthlyMap.has(monthStr)) {
        monthlyMap.set(monthStr, { month: monthStr, income: 0, expense: 0 });
      }
      
      const entry = monthlyMap.get(monthStr)!;
      // PostgreSQL might return SUM as a string depending on driver settings, so cast safely
      const totalAmount = Number(row.total); 
      
      if (row.type === 'INCOME') {
        entry.income += totalAmount;
      } else {
        entry.expense += totalAmount;
      }
    }

    const monthlyAnalytics = Array.from(monthlyMap.values()).sort((a, b) => a.month.localeCompare(b.month));

    return {
      overview: {
        totalIncome,
        totalExpense,
        balance,
        transactionCount
      },
      categorySummaries: {
        income: incomeCategories.map(formatCategory),
        expense: expenseCategories.map(formatCategory)
      },
      monthlyAnalytics,
      recentTransactions
    };
  }
}
