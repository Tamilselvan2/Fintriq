'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { formatCurrency } from '@/lib/utils';

interface CategoryBreakdownProps {
  data: { category: string; total: number }[];
  isLoading?: boolean;
}

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#f43f5e', '#8b5cf6', '#06b6d4'];

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

  return (
    <div className="h-full w-full flex flex-col">
      <h3 className="text-lg font-black text-white mb-6 uppercase tracking-wider">Top Expenses</h3>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={95}
              paddingAngle={5}
              dataKey="total"
              nameKey="category"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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
            <Legend 
              verticalAlign="bottom" 
              height={40} 
              iconType="circle" 
              wrapperStyle={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }} 
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
