'use client';

import { Search, Calendar as CalendarIcon, X } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { format, subDays, startOfMonth, endOfMonth, subMonths, startOfQuarter, startOfYear } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { useCategories } from '@/hooks/use-categories';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FilterBarProps {
  initialSearch?: string;
  initialType?: 'INCOME' | 'EXPENSE' | '';
  initialCategory?: string;
  initialStartDate?: string;
  initialEndDate?: string;
  onFilterChange: (filters: { search?: string; type?: 'INCOME' | 'EXPENSE' | ''; category?: string; startDate?: string; endDate?: string }) => void;
}

const presets = [
  { label: 'Today', getValue: () => ({ from: new Date(), to: new Date() }) },
  { label: 'Last 7 Days', getValue: () => ({ from: subDays(new Date(), 6), to: new Date() }) },
  { label: 'Last 30 Days', getValue: () => ({ from: subDays(new Date(), 29), to: new Date() }) },
  { label: 'This Month', getValue: () => ({ from: startOfMonth(new Date()), to: endOfMonth(new Date()) }) },
  {
    label: 'Last Month', getValue: () => {
      const start = startOfMonth(subMonths(new Date(), 1));
      const end = endOfMonth(start);
      return { from: start, to: end };
    }
  },
  { label: 'This Quarter', getValue: () => ({ from: startOfQuarter(new Date()), to: new Date() }) },
  { label: 'This Year', getValue: () => ({ from: startOfYear(new Date()), to: new Date() }) },
];

export function FilterBar({ initialSearch = '', initialType = '', initialCategory = '', initialStartDate, initialEndDate, onFilterChange }: FilterBarProps) {
  const [search, setSearch] = useState(initialSearch);
  const [type, setType] = useState<'INCOME' | 'EXPENSE' | ''>(initialType);
  const [category, setCategory] = useState(initialCategory);
  const [popoverOpen, setPopoverOpen] = useState(false);

  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: initialStartDate ? new Date(initialStartDate) : undefined,
    to: initialEndDate ? new Date(initialEndDate) : undefined,
  });

  const { data: categories = [] } = useCategories();

  // Sync if parent-provided URL params change (e.g. back/forward navigation or clear all)
  useEffect(() => { setSearch(initialSearch); }, [initialSearch]);
  useEffect(() => { setType(initialType); }, [initialType]);
  useEffect(() => { setCategory(initialCategory); }, [initialCategory]);
  useEffect(() => {
    setDateRange({
      from: initialStartDate ? new Date(initialStartDate) : undefined,
      to: initialEndDate ? new Date(initialEndDate) : undefined,
    });
  }, [initialStartDate, initialEndDate]);

  const onFilterChangeRef = useRef(onFilterChange);
  useEffect(() => {
    onFilterChangeRef.current = onFilterChange;
  }, [onFilterChange]);

  useEffect(() => {
    const timer = setTimeout(() => {
      onFilterChangeRef.current({
        search,
        type,
        category,
        startDate: dateRange?.from ? format(dateRange.from, 'yyyy-MM-dd') : undefined,
        endDate: dateRange?.to ? format(dateRange.to, 'yyyy-MM-dd') : undefined,
      });
    }, 400);
    return () => clearTimeout(timer);
  }, [search, type, category, dateRange]);

  let triggerText = "Date";
  if (dateRange?.from) {
    if (dateRange.to) {
      triggerText = `${format(dateRange.from, "MMM dd, yyyy")} → ${format(dateRange.to, "MMM dd, yyyy")}`;
    } else {
      triggerText = `${format(dateRange.from, "MMM dd, yyyy")} → Present`;
    }
  } else if (dateRange?.to) {
    triggerText = `Beginning → ${format(dateRange.to, "MMM dd, yyyy")}`;
  }

  return (
    <div className="bg-card p-4 rounded-2xl shadow-sm border border-border flex flex-col lg:flex-row gap-4 items-center transition-all">
      <div className="relative w-full lg:w-[40%]">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
        <input
          type="text"
          placeholder="Search description..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-10 py-2.5 bg-muted/50 border border-border rounded-xl text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow placeholder-muted-foreground/60"
        />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
            <X size={16} />
          </button>
        )}
      </div>

      <select
        value={type}
        onChange={(e) => setType(e.target.value as any)}
        className="w-full lg:w-[20%] px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-border rounded-xl text-sm font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-blue/50"
      >
        <option value="">All Types</option>
        <option value="INCOME">Income</option>
        <option value="EXPENSE">Expense</option>
      </select>

      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className="w-full lg:w-[20%] px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-border rounded-xl text-sm font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-blue/50"
      >
        <option value="">All Categories</option>
        {categories.map((c) => (
          <option key={c.id} value={c.name}>{c.name}</option>
        ))}
      </select>

      <div className="w-full lg:w-[20%]">
        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full h-[42px] justify-start text-left font-medium rounded-xl border border-border bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 truncate",
                !dateRange && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
              <span className="truncate">{triggerText}</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 flex flex-col sm:flex-row" align="end">
            <div className="flex flex-col border-b sm:border-b-0 sm:border-r border-border p-3 space-y-1 w-full sm:w-[160px]">
              <span className="text-xs font-semibold text-muted-foreground mb-1 px-2 uppercase tracking-wider">Presets</span>
              {presets.map(p => (
                <Button
                  key={p.label}
                  variant="ghost"
                  className="justify-start font-medium text-sm h-8"
                  onClick={() => {
                    setDateRange(p.getValue());
                    setPopoverOpen(false);
                  }}
                >
                  {p.label}
                </Button>
              ))}
            </div>
            <div className="p-2">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange?.from}
                selected={dateRange}
                onSelect={setDateRange}
                numberOfMonths={1}
              />
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
