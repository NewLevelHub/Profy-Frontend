import { Skeleton } from '@/shared/ui/Skeleton';

/** Mirrors InviteForm's layout while the invitation loads. */
export function InviteSkeleton() {
  return (
    <div aria-busy="true">
      <Skeleton className="h-8 w-2/3" />
      <Skeleton className="h-4 w-full mt-[14px]" />
      <Skeleton className="h-4 w-4/5 mt-[8px]" />
      {[0, 1, 2].map(i => (
        <div key={i} className="mt-[28px]">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-9 w-full mt-[8px]" />
        </div>
      ))}
      <Skeleton className="h-12 w-full mt-[30px]" />
    </div>
  );
}
