import { Skeleton } from "@/components/ui/skeleton";
import { ChartSkeleton } from "./chart-skeleton";

export function KpiSkeleton() {
  return (
    <div className="bg-card p-6 rounded-2xl shadow-sm border border-border">
      <div className="flex justify-between items-start mb-4">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-8 rounded-xl" />
      </div>
      <div className="relative z-10">
        <Skeleton className="h-9 w-32 mb-4 mt-2" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-10">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {Array.from({ length: 4 }).map((_, i) => (
          <KpiSkeleton key={i} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-[450px] bg-card dark:bg-slate-900 border border-border rounded-3xl shadow-sm p-6 sm:p-8 flex flex-col">
          <ChartSkeleton />
        </div>
        <div className="h-[450px] bg-card dark:bg-slate-900 border border-border rounded-3xl shadow-sm p-6 sm:p-8 flex flex-col items-center justify-center">
          <Skeleton className="h-6 w-40 mb-8 self-start" />
          <Skeleton className="h-48 w-48 rounded-full mb-8" />
          <div className="w-full space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/6" />
          </div>
        </div>
      </div>

      <div className="bg-card dark:bg-slate-900 border border-border rounded-3xl shadow-sm p-6 sm:p-8 h-[400px]">
        <Skeleton className="h-6 w-40 mb-6" />
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
              <Skeleton className="h-5 w-16" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
