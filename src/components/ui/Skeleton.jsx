import { cn } from '@/lib/utils'

export function Skeleton({ className }) {
  return (
    <div className={cn('animate-pulse rounded-xl bg-muted', className)} />
  )
}

export function TaskSkeleton() {
  return (
    <div className="rounded-xl p-4 mb-2 border border-border bg-muted/30">
      <div className="flex items-start gap-3">
        <Skeleton className="w-5 h-5 rounded-full flex-shrink-0 mt-0.5" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4 rounded-lg" />
          <div className="flex gap-2">
            <Skeleton className="h-3 w-12 rounded-md" />
            <Skeleton className="h-3 w-16 rounded-md" />
          </div>
        </div>
      </div>
    </div>
  )
}

export function SubSkeleton() {
  return (
    <div className="rounded-xl p-4 mb-3 border border-border bg-muted/30">
      <div className="flex items-center gap-3">
        <Skeleton className="w-10 h-10 rounded-xl flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-1/2 rounded-lg" />
          <Skeleton className="h-3 w-1/3 rounded-md" />
        </div>
        <div className="space-y-1 text-right">
          <Skeleton className="h-4 w-14 rounded-lg" />
          <Skeleton className="h-3 w-10 rounded-md ml-auto" />
        </div>
      </div>
    </div>
  )
}
