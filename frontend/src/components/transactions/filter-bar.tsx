'use client';

import { Search } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useCategories } from '@/hooks/use-categories';

interface FilterBarProps {
  initialSearch?: string;
  initialType?: 'INCOME' | 'EXPENSE' | '';
  initialCategory?: string;
  onFilterChange: (filters: { search?: string; type?: 'INCOME' | 'EXPENSE' | ''; category?: string }) => void;
}

export function FilterBar({ initialSearch = '', initialType = '', initialCategory = '', onFilterChange }: FilterBarProps) {
  const [search, setSearch] = useState(initialSearch);
  const [type, setType] = useState<'INCOME' | 'EXPENSE' | ''>(initialType);
  const [category, setCategory] = useState(initialCategory);
  
  const { data: categories = [] } = useCategories();

  // Sync if parent-provided URL params change (e.g. back/forward navigation)
  useEffect(() => { setSearch(initialSearch); }, [initialSearch]);
  useEffect(() => { setType(initialType); }, [initialType]);
  useEffect(() => { setCategory(initialCategory); }, [initialCategory]);

  useEffect(() => {
    const timer = setTimeout(() => {
      onFilterChange({ search, type, category });
    }, 400);
    return () => clearTimeout(timer);
  }, [search, type, category, onFilterChange]);

  return (
    <div className="bg-card p-4 rounded-2xl shadow-sm border border-border flex flex-col sm:flex-row gap-4 items-center transition-all">
      <div className="relative flex-1 w-full">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
        <input
          type="text"
          placeholder="Search descriptions..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-muted/50 border border-border rounded-xl text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow placeholder-muted-foreground/60"
        />
      </div>

      <div className="flex gap-4 w-full sm:w-auto">
        <select
          value={type}
          onChange={(e) => setType(e.target.value as any)}
          className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-border rounded-xl text-sm font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-blue/50 flex-1 sm:w-40"
        >
          <option value="">All Types</option>
          <option value="INCOME">Income</option>
          <option value="EXPENSE">Expense</option>
        </select>

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-border rounded-xl text-sm font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-blue/50 flex-1 sm:w-40"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.name}>{c.name}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
