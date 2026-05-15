import React from 'react';

export default function DashboardLoading() {
  return (
    <div className="flex h-screen bg-slate-50/50 dark:bg-slate-950 overflow-hidden">
      {/* Sidebar Skeleton */}
      <div className="hidden md:flex flex-col h-full bg-white dark:bg-slate-900 border-r border-border w-64">
        <div className="p-6 border-b border-border h-20 shrink-0 flex items-center">
          <div className="h-6 w-32 bg-slate-200 dark:bg-slate-800 rounded animate-pulse"></div>
        </div>
        <div className="p-4 space-y-3 flex-1">
          <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse"></div>
          <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse"></div>
        </div>
      </div>

      {/* Main Content Skeleton */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header Skeleton */}
        <div className="h-20 bg-white/60 dark:bg-slate-950/60 border-b border-border flex items-center justify-between px-6 lg:px-10">
          <div className="h-8 w-40 bg-slate-200 dark:bg-slate-800 rounded animate-pulse"></div>
          <div className="flex gap-5 items-center">
            <div className="h-10 w-10 bg-slate-200 dark:bg-slate-800 rounded-full animate-pulse"></div>
            <div className="h-10 w-10 bg-slate-200 dark:bg-slate-800 rounded-full animate-pulse"></div>
          </div>
        </div>

        {/* Page Content Skeleton */}
        <div className="flex-1 p-4 sm:p-6 lg:p-10">
          <div className="max-w-[1400px] mx-auto w-full animate-pulse">
            <div className="h-32 sm:h-40 bg-slate-200 dark:bg-slate-800 rounded-2xl mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="h-96 bg-slate-200 dark:bg-slate-800 rounded-2xl lg:col-span-2"></div>
              <div className="h-96 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
