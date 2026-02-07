import { cn } from '@/lib/utils'

interface SkeletonProps {
  className?: string
}

export function Skeleton({ className }: SkeletonProps) {
  return <div className={cn('skeleton', className)} />
}

export function SkeletonCard() {
  return (
    <div className="card p-5 space-y-4">
      <div className="flex items-center gap-4">
        <Skeleton className="w-12 h-12 rounded-2xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
    </div>
  )
}

export function SkeletonAppItem() {
  return (
    <div className="card p-4 flex items-center gap-4">
      <Skeleton className="w-14 h-14 rounded-2xl flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-36" />
        <Skeleton className="h-3 w-48" />
        <Skeleton className="h-3 w-24" />
      </div>
    </div>
  )
}

export function SkeletonStats() {
  return (
    <div className="grid grid-cols-2 gap-4">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="card p-5 space-y-3">
          <Skeleton className="w-12 h-12 rounded-2xl" />
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-3 w-24" />
        </div>
      ))}
    </div>
  )
}

export function SkeletonPage() {
  return (
    <div className="flex-1 overflow-auto p-4 space-y-4">
      <Skeleton className="h-8 w-48 mb-6" />
      <SkeletonStats />
      <div className="space-y-3 mt-6">
        {[1, 2, 3].map(i => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  )
}
