'use client';

import { Search } from 'lucide-react';
import { useState, useEffect } from 'react';

interface FilterBarProps {
  onFilterChange: (filters: { search?: string; type?: 'INCOME' | 'EXPENSE' | ''; category?: string }) => void;
}

export function FilterBar({ onFilterChange }: FilterBarProps) {
  const [search, setSearch] = useState('');
  const [type, setType] = useState<'INCOME' | 'EXPENSE' | ''>('');
  const [category, setCategory] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      onFilterChange({ search, type, category });
    }, 400);
    return () => clearTimeout(timer);
  }, [search, type, category, onFilterChange]);

  return (
    <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-border flex flex-col sm:flex-row gap-4 items-center transition-all">
      <div className="relative flex-1 w-full">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input 
          type="text" 
          placeholder="Search descriptions..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-border rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-blue/50 transition-shadow text-slate-900 dark:text-white placeholder-slate-400"
        />
      </div>
      
      <div className="flex gap-4 w-full sm:w-auto">
        <select 
          value={type}
          onChange={(e) => setType(e.target.value as any)}
          className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-border rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-blue/50 flex-1 sm:w-40 text-slate-700 dark:text-slate-300"
        >
          <option value="">All Types</option>
          <option value="INCOME">Income</option>
          <option value="EXPENSE">Expense</option>
        </select>

        <select 
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-border rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-blue/50 flex-1 sm:w-40 text-slate-700 dark:text-slate-300"
        >
          <option value="">All Categories</option>
          <option value="Software">Software</option>
          <option value="Payroll">Payroll</option>
          <option value="Consulting">Consulting</option>
          <option value="Marketing">Marketing</option>
          <option value="Office Supplies">Office Supplies</option>
          <option value="Travel">Travel</option>
        </select>
      </div>
    </div>
  );
}
