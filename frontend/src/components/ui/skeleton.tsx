import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-md bg-slate-200/50 dark:bg-slate-800/50",
        "after:absolute after:inset-0 after:-translate-x-full after:animate-shimmer after:bg-gradient-to-r after:from-transparent after:via-slate-200 after:to-transparent dark:after:via-slate-700/50",
        className
      )}
      {...props}
    />
  )
}

export { Skeleton }
