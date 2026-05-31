import { Skeleton } from "@/components/ui/skeleton";

export function ChartSkeleton() {
  return (
    <div className="flex flex-col h-full w-full">
      <div className="flex justify-between items-center mb-8">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-5 w-24" />
      </div>
      
      <div className="flex-1 flex items-end gap-2 sm:gap-4 relative pt-4">
        {/* Y-Axis mock */}
        <div className="absolute left-0 top-0 bottom-8 w-10 flex flex-col justify-between items-end pr-2 py-4">
          <Skeleton className="h-3 w-6" />
          <Skeleton className="h-3 w-8" />
          <Skeleton className="h-3 w-6" />
          <Skeleton className="h-3 w-4" />
          <Skeleton className="h-3 w-4" />
        </div>
        
        {/* Zero baseline line */}
        <div className="absolute left-10 right-0 bottom-[40%] h-px bg-slate-200 dark:bg-slate-800 z-0"></div>
        <div className="absolute left-10 right-0 bottom-8 h-px bg-slate-200 dark:bg-slate-800 z-0"></div>

        {/* Bars and X-Axis mock */}
        <div className="flex-1 flex justify-around items-end h-full ml-10 mb-8 relative z-10 pb-[40%]">
          {/* Month 1 */}
          <div className="flex gap-1 h-full items-end pb-1 w-full justify-center">
            <Skeleton className="w-4 sm:w-8 h-[60%] rounded-t-sm" />
            <Skeleton className="w-4 sm:w-8 h-[20%] rounded-t-sm" />
          </div>
          {/* Month 2 */}
          <div className="flex gap-1 h-full items-end pb-1 w-full justify-center">
            <Skeleton className="w-4 sm:w-8 h-[80%] rounded-t-sm" />
            <Skeleton className="w-4 sm:w-8 h-[30%] rounded-t-sm" />
          </div>
          {/* Month 3 */}
          <div className="flex gap-1 h-full items-end pb-1 w-full justify-center">
            <Skeleton className="w-4 sm:w-8 h-[40%] rounded-t-sm" />
            <Skeleton className="w-4 sm:w-8 h-[50%] rounded-t-sm" />
          </div>
          {/* Month 4 */}
          <div className="flex gap-1 h-full items-end pb-1 w-full justify-center">
            <Skeleton className="w-4 sm:w-8 h-[70%] rounded-t-sm" />
            <Skeleton className="w-4 sm:w-8 h-[10%] rounded-t-sm" />
          </div>
          {/* Month 5 */}
          <div className="flex gap-1 h-full items-end pb-1 w-full justify-center">
            <Skeleton className="w-4 sm:w-8 h-[90%] rounded-t-sm" />
            <Skeleton className="w-4 sm:w-8 h-[40%] rounded-t-sm" />
          </div>
          {/* Month 6 */}
          <div className="flex gap-1 h-full items-end pb-1 w-full justify-center">
            <Skeleton className="w-4 sm:w-8 h-[50%] rounded-t-sm" />
            <Skeleton className="w-4 sm:w-8 h-[60%] rounded-t-sm" />
          </div>
        </div>

        {/* X-Axis labels */}
        <div className="absolute left-10 right-0 bottom-0 h-8 flex justify-around items-center">
          <Skeleton className="h-3 w-10" />
          <Skeleton className="h-3 w-10" />
          <Skeleton className="h-3 w-10" />
          <Skeleton className="h-3 w-10" />
          <Skeleton className="h-3 w-10" />
          <Skeleton className="h-3 w-10" />
        </div>
      </div>
    </div>
  );
}
