'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { formatCurrency, formatCompactCurrency } from '@/lib/utils';

interface CategoryBreakdownProps {
  data: { category: string; total: number }[];
  isLoading?: boolean;
}

const COLORS = [
  '#2563eb', // Blue
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#f43f5e', // Rose
  '#8b5cf6', // Purple
  '#06b6d4', // Cyan
];
const OTHERS_COLOR = '#64748b'; // Slate

export function CategoryBreakdown({ data, isLoading }: CategoryBreakdownProps) {

  if (!data || data.length === 0) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center text-slate-500">
        <div className="w-16 h-16 bg-gradient-to-tr from-brand-rose/20 to-orange-400/20 rounded-full flex items-center justify-center mb-4 relative shadow-sm">
           <svg className="w-8 h-8 text-brand-rose relative z-10" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" /><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" /></svg>
        </div>
        <p className="font-extrabold text-slate-900 dark:text-white">No expenses yet</p>
        <p className="text-sm mt-1 font-medium">Add expense transactions to categorize them</p>
      </div>
    );
  }

  // 1. Data Transformation
  const sortedData = [...data].sort((a, b) => b.total - a.total);
  
  let transformedData: { category: string; total: number; color: string; percentage?: number }[] = [];
  
  if (sortedData.length > 5) {
    const top5 = sortedData.slice(0, 5);
    const othersTotal = sortedData.slice(5).reduce((sum, item) => sum + item.total, 0);
    transformedData = [
      ...top5.map((item, i) => ({ ...item, color: COLORS[i] })),
      { category: 'Others', total: othersTotal, color: OTHERS_COLOR }
    ];
  } else {
    transformedData = sortedData.map((item, i) => ({ ...item, color: COLORS[i % COLORS.length] }));
  }

  // 2. Percentage Calculation
  const totalSum = transformedData.reduce((sum, item) => sum + item.total, 0);
  
  const dataWithPercentages = transformedData.map(item => ({
    ...item,
    percentage: totalSum > 0 ? Math.round((item.total / totalSum) * 100) : 0
  }));

  // Force exactly 100% total
  if (totalSum > 0 && dataWithPercentages.length > 0) {
    const percentageSum = dataWithPercentages.reduce((sum, item) => sum + item.percentage, 0);
    if (percentageSum !== 100) {
      const difference = 100 - percentageSum;
      dataWithPercentages[0].percentage += difference;
    }
  }

  return (
    <div className="h-full w-full flex flex-col">
      <div className="mb-4">
        <h3 className="text-lg font-black text-white uppercase tracking-wider">Top Expenses</h3>
        <div className="mt-3">
          <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">Total Expenses</p>
          <p className="text-2xl font-extrabold text-foreground tracking-tight">{formatCompactCurrency(totalSum)}</p>
        </div>
      </div>
      
      <div className="flex-1 min-h-0 flex flex-col">
        <div className="flex-1 min-h-[140px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={dataWithPercentages}
                cx="50%"
                cy="50%"
                innerRadius="65%"
                outerRadius="95%"
                paddingAngle={4}
                dataKey="total"
                nameKey="category"
                stroke="none"
              >
                {dataWithPercentages.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number) => formatCurrency(value)}
                contentStyle={{ 
                  borderRadius: '16px', 
                  border: '1px solid #334155', 
                  boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.5)', 
                  backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                  backdropFilter: 'blur(12px)',
                  padding: '12px',
                  color: 'white',
                  fontWeight: 800
                }}
                itemStyle={{ color: 'white' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        {/* Custom Responsive Legend */}
        <div className="mt-4 flex flex-col gap-2.5 overflow-y-auto pr-1 shrink-0 max-h-[150px] custom-scrollbar">
          {dataWithPercentages.map((item, index) => (
            <div key={`legend-${index}`} className="flex items-center justify-between group">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }}></div>
                <span className="text-sm font-bold text-slate-300 truncate">{item.category}</span>
              </div>
              <div className="flex items-center gap-4 shrink-0 pl-3">
                <span className="text-sm font-bold text-white tabular-nums">{formatCompactCurrency(item.total)}</span>
                <span className="text-xs font-black text-slate-400 w-8 text-right tabular-nums">{item.percentage}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
