import { DashboardRepository } from './dashboard.repository';

export class DashboardService {
  private repository = new DashboardRepository();

  async getDashboardData(orgId: string, startDateStr?: string, endDateStr?: string) {
    const startDate = startDateStr ? new Date(startDateStr) : undefined;
    const endDate = endDateStr ? new Date(endDateStr) : undefined;

    // Calculate current and previous month boundaries for KPI comparison
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

      let chartStartDate = startDate;
      if (!chartStartDate) {
        chartStartDate = new Date();
        chartStartDate.setMonth(chartStartDate.getMonth() - 5);
        chartStartDate.setDate(1);
        chartStartDate.setHours(0, 0, 0, 0);
      }

      const [
        aggregates, 
        incomeCategories, 
        expenseCategories, 
        monthlyData, 
        recentTransactions,
        currentMonthAggregates,
        previousMonthAggregates
      ] = await Promise.all([
        this.repository.getAggregates(orgId, startDate, endDate),
        this.repository.getCategorySummaries(orgId, 'INCOME', startDate, endDate),
        this.repository.getCategorySummaries(orgId, 'EXPENSE', startDate, endDate),
        this.repository.getMonthlyAnalytics(orgId, chartStartDate, endDate),
      this.repository.getRecentTransactions(orgId, 5),
      this.repository.getAggregates(orgId, currentMonthStart, now),
      this.repository.getAggregates(orgId, previousMonthStart, previousMonthEnd)
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

    // Process KPI Comparison
    let currentMonthIncome = 0, currentMonthExpense = 0;
    let previousMonthIncome = 0, previousMonthExpense = 0;

    for (const agg of currentMonthAggregates) {
      if (agg.type === 'INCOME') currentMonthIncome += agg._sum.amount || 0;
      else if (agg.type === 'EXPENSE') currentMonthExpense += agg._sum.amount || 0;
    }

    for (const agg of previousMonthAggregates) {
      if (agg.type === 'INCOME') previousMonthIncome += agg._sum.amount || 0;
      else if (agg.type === 'EXPENSE') previousMonthExpense += agg._sum.amount || 0;
    }

    const currentBalance = currentMonthIncome - currentMonthExpense;
    const previousBalance = previousMonthIncome - previousMonthExpense;

    const safeDivide = (a: number, b: number) => b === 0 ? (a > 0 ? 100 : 0) : (a / b) * 100;
    
    const incomeGrowth = previousMonthIncome === 0 && currentMonthIncome > 0 ? 100 : 
      previousMonthIncome === 0 ? 0 : ((currentMonthIncome - previousMonthIncome) / previousMonthIncome) * 100;
      
    const expenseGrowth = previousMonthExpense === 0 && currentMonthExpense > 0 ? 100 : 
      previousMonthExpense === 0 ? 0 : ((currentMonthExpense - previousMonthExpense) / previousMonthExpense) * 100;
      
    const balanceGrowth = previousBalance === 0 && currentBalance > 0 ? 100 : 
      previousBalance === 0 ? 0 : ((currentBalance - previousBalance) / Math.abs(previousBalance)) * 100;

    return {
      overview: {
        totalIncome,
        totalExpense,
        balance,
        transactionCount,
        kpi: {
          currentMonthIncome,
          previousMonthIncome,
          incomeGrowth,
          currentMonthExpense,
          previousMonthExpense,
          expenseGrowth,
          balanceGrowth
        }
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
