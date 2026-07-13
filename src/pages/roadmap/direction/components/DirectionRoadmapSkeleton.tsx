import { Skeleton } from '@/shared/ui/Skeleton';

export function DirectionRoadmapSkeleton() {
  return (
    <div className="flex flex-col gap-8">
      <Skeleton className="h-40 w-full rounded-[var(--radius)]" />
      <Skeleton className="h-28 w-full rounded-[var(--radius)]" />

      {Array.from({ length: 2 }).map((_, i) => (
        <div key={i} className="flex flex-col gap-3">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-7 w-2/3" />
          <Skeleton className="h-16 w-full rounded-[var(--radius)]" />
          {Array.from({ length: 3 }).map((_, j) => (
            <div key={j} className="flex gap-3">
              <Skeleton className="h-7 w-7 rounded-full flex-shrink-0" />
              <div className="flex flex-col gap-2 flex-1">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-12 w-full" />
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
