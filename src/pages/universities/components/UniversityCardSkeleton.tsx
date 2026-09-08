import { Skeleton } from '@/shared/ui/Skeleton';

export function UniversityCardSkeleton() {
  return (
    <div className="bg-surface border border-default rounded-[var(--radius)] p-5 sm:p-6 flex flex-col gap-3">
      <Skeleton className="h-36 w-full rounded-2xl" />
      <Skeleton className="h-6 w-4/5" />
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-4 w-2/5" />
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-[48px] w-full rounded-[var(--radius)] mt-1" />
    </div>
  );
}
