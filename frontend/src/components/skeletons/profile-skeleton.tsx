import { Skeleton } from "@/components/ui/skeleton";

export function ProfileSkeleton() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <Skeleton className="h-7 w-24 mb-2" />
        <Skeleton className="h-4 w-64" />
      </div>
      
      <div className="bg-white dark:bg-slate-950 border border-border rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 sm:p-8 space-y-8">
          
          {/* Avatar Section */}
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <Skeleton className="w-24 h-24 rounded-full shrink-0" />
            
            <div className="flex flex-col items-center sm:items-start w-full sm:w-auto">
              <Skeleton className="h-6 w-32 mb-2" />
              <Skeleton className="h-4 w-20 mb-4" />
              <Skeleton className="h-9 w-36 rounded-lg" />
            </div>
          </div>

          <div className="h-px bg-border w-full"></div>

          {/* Details Section */}
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2 col-span-full sm:col-span-1">
              <Skeleton className="h-4 w-24" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-12 flex-1 rounded-xl" />
                <Skeleton className="h-12 w-20 rounded-xl" />
              </div>
            </div>

            <div className="space-y-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-12 w-full rounded-xl" />
            </div>

            <div className="space-y-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-12 w-full rounded-xl" />
            </div>

            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-12 w-full rounded-xl" />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
