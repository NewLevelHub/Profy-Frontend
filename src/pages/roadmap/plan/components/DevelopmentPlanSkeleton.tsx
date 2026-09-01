import { Skeleton } from '@/shared/ui/Skeleton';

export function DevelopmentPlanSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <Skeleton className="h-32 w-full rounded-[var(--radius)]" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Skeleton className="h-28 w-full rounded-[var(--radius)]" />
        <Skeleton className="h-28 w-full rounded-[var(--radius)]" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-64 w-full rounded-[var(--radius)]" />
        ))}
      </div>
    </div>
  );
}
