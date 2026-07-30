import { Skeleton } from '@/shared/ui/Skeleton';

export function DirectionRoadmapSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3.5 flex-wrap">
        <Skeleton className="h-10 w-28 rounded-pill" />
        <Skeleton className="h-10 w-56" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Skeleton className="h-44 w-full rounded-[22px]" />
        <Skeleton className="h-44 w-full rounded-[22px]" />
      </div>

      <div className="flex flex-col gap-3.5 rounded-[22px] border-2 border-[#DDD6FE] bg-surface p-[26px]">
        <Skeleton className="h-6 w-56" />
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-[72px] w-full rounded-2xl" />
        ))}
      </div>

      <div className="flex flex-col gap-[18px] rounded-[22px] border-2 border-[#DDD6FE] bg-surface p-[26px]">
        <Skeleton className="h-6 w-48" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-1.5">
            <div className="flex justify-between">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-10" />
            </div>
            <Skeleton className="h-3 w-full rounded-full" />
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3.5">
        <Skeleton className="h-6 w-56" />
        <div className="flex flex-wrap gap-2.5">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-7 w-32 rounded-full" />
          ))}
        </div>
      </div>

      <Skeleton className="h-14 w-80 rounded-2xl" />
    </div>
  );
}
