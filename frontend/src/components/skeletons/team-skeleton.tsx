import { Skeleton } from "@/components/ui/skeleton";

export function TeamSkeleton() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <Skeleton className="h-9 w-64 mb-2" />
          <Skeleton className="h-4 w-80" />
        </div>
        <Skeleton className="h-10 w-36 rounded-xl" />
      </div>

      {/* Team Members Section */}
      <div className="bg-white dark:bg-slate-950 border border-border rounded-2xl shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <div className="min-w-full inline-block align-middle">
            <div className="border-b border-border bg-slate-50/50 dark:bg-slate-900/50 flex">
              <div className="px-6 py-4 w-1/2">
                <Skeleton className="h-4 w-24" />
              </div>
              <div className="px-6 py-4 w-1/4">
                <Skeleton className="h-4 w-16" />
              </div>
              <div className="px-6 py-4 w-1/4">
                <Skeleton className="h-4 w-16" />
              </div>
            </div>
            <div className="divide-y divide-border">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex bg-white dark:bg-slate-950">
                  <div className="px-6 py-4 w-1/2 flex items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded-full shrink-0" />
                    <div className="flex flex-col gap-2 w-full">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                  </div>
                  <div className="px-6 py-4 w-1/4 flex items-center">
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </div>
                  <div className="px-6 py-4 w-1/4 flex justify-end items-center">
                    <Skeleton className="h-8 w-8 rounded-lg" />
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

      <PendingInvitationsSkeleton />
    </div>
  );
}

export function PendingInvitationsSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-950 border border-border rounded-2xl shadow-sm overflow-hidden flex flex-col mt-8">
      <div className="px-6 py-5 border-b border-border bg-slate-50/50 dark:bg-slate-900/50 flex justify-between items-center">
         <Skeleton className="h-5 w-40" />
      </div>
      <div className="overflow-x-auto">
        <div className="min-w-full inline-block align-middle">
          <div className="border-b border-border bg-slate-50/50 dark:bg-slate-900/50 flex">
            <div className="px-6 py-4 w-1/2">
              <Skeleton className="h-4 w-16" />
            </div>
            <div className="px-6 py-4 w-1/4">
              <Skeleton className="h-4 w-16" />
            </div>
            <div className="px-6 py-4 w-1/4">
              <Skeleton className="h-4 w-16" />
            </div>
          </div>
          <div className="divide-y divide-border">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="flex bg-white dark:bg-slate-950">
                <div className="px-6 py-4 w-1/2 flex flex-col gap-2 justify-center">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <div className="px-6 py-4 w-1/4 flex items-center">
                  <Skeleton className="h-4 w-24" />
                </div>
                <div className="px-6 py-4 w-1/4 flex justify-end items-center gap-2">
                  <Skeleton className="h-8 w-20 rounded-lg" />
                  <Skeleton className="h-8 w-8 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
