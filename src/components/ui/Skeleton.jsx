import { cn } from '@/lib/utils'

/* taste-skill: "Skeleton Shimmer" — shifting light reflection, not generic spinner */
export function Skeleton({ className }) {
  return (
    <div className={cn('shimmer rounded-xl', className)} />
  )
}

export function TaskSkeleton() {
  return (
    <div className="rounded-2xl px-4 py-4 mb-3 border border-border bg-card">
      <div className="flex items-center gap-3">
        <div className="flex-1 space-y-2.5">
          {/* priority pill stub */}
          <Skeleton className="h-4 w-10 rounded-full" />
          {/* title */}
          <Skeleton className="h-4 w-3/4 rounded-lg" />
          {/* note */}
          <Skeleton className="h-3 w-1/2 rounded-md" />
          {/* meta row */}
          <div className="flex justify-between pt-0.5">
            <Skeleton className="h-3 w-14 rounded-md" />
            <Skeleton className="h-3 w-10 rounded-md" />
          </div>
        </div>
        {/* checkbox stub — right side */}
        <Skeleton className="w-6 h-6 rounded-full flex-shrink-0" />
      </div>
    </div>
  )
}

export function SubSkeleton() {
  return (
    <div className="rounded-2xl p-4 mb-3 border border-border bg-card">
      <div className="flex items-center gap-3">
        <Skeleton className="w-10 h-10 rounded-xl flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-1/2 rounded-lg" />
          <Skeleton className="h-3 w-1/3 rounded-md" />
        </div>
        <div className="space-y-1.5 text-right">
          <Skeleton className="h-4 w-14 rounded-lg" />
          <Skeleton className="h-3 w-10 rounded-md ml-auto" />
        </div>
      </div>
    </div>
  )
}
