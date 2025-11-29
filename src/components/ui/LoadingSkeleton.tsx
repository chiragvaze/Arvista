import { cn } from '@/lib/utils'

interface LoadingSkeletonProps {
  className?: string
  count?: number
}

export function LoadingSkeleton({ className, count = 1 }: LoadingSkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={cn('skeleton rounded-lg bg-neutral-200', className)}
        />
      ))}
    </>
  )
}

export function ArtworkCardSkeleton() {
  return (
    <div className="group relative overflow-hidden rounded-xl">
      <LoadingSkeleton className="aspect-[3/4] w-full" />
      <div className="absolute bottom-0 left-0 right-0 p-6 space-y-2">
        <LoadingSkeleton className="h-6 w-3/4" />
        <LoadingSkeleton className="h-4 w-1/2" />
      </div>
    </div>
  )
}

export function GallerySkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {Array.from({ length: 6 }).map((_, i) => (
        <ArtworkCardSkeleton key={i} />
      ))}
    </div>
  )
}
