import { Skeleton } from "@/components/ui/skeleton";

export function AuditLogSkeleton() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <Skeleton className="h-9 w-40 mb-2" />
          <Skeleton className="h-4 w-72" />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <Skeleton className="h-10 w-full sm:w-64 rounded-xl" />
        <Skeleton className="h-10 w-full sm:w-40 rounded-xl" />
      </div>

      <div className="bg-white dark:bg-slate-950 border border-border rounded-2xl shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <div className="min-w-full inline-block align-middle">
            {/* Table Header */}
            <div className="border-b border-border bg-slate-50/50 dark:bg-slate-900/50 flex">
              <div className="px-6 py-4 w-1/5">
                <Skeleton className="h-4 w-20" />
              </div>
              <div className="px-6 py-4 w-1/5">
                <Skeleton className="h-4 w-24" />
              </div>
              <div className="px-6 py-4 w-1/5">
                <Skeleton className="h-4 w-24" />
              </div>
              <div className="px-6 py-4 w-2/5">
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
            {/* Table Rows */}
            <div className="divide-y divide-border">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex bg-white dark:bg-slate-950">
                  <div className="px-6 py-4 w-1/5 flex flex-col gap-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                  <div className="px-6 py-4 w-1/5 flex items-center">
                    <Skeleton className="h-6 w-24 rounded-full" />
                  </div>
                  <div className="px-6 py-4 w-1/5 flex items-center">
                    <Skeleton className="h-4 w-32" />
                  </div>
                  <div className="px-6 py-4 w-2/5 flex items-center">
                    <Skeleton className="h-4 w-full max-w-[200px]" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Pagination Skeleton */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 dark:bg-slate-900 border-t border-border rounded-b-2xl">
          <Skeleton className="h-4 w-40" />
          <div className="flex gap-2">
            <Skeleton className="h-9 w-24 rounded-xl" />
            <Skeleton className="h-9 w-24 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
