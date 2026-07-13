import { Skeleton } from '@/shared/ui/Skeleton';

export function InquirySkeleton() {
  return (
    <div className="flex flex-col gap-8">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex flex-col gap-3">
          <Skeleton className="h-5 w-3/4" />
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 5 }).map((_, j) => (
              <Skeleton key={j} className="h-8 w-24" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
