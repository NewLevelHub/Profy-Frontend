import { PageContainer } from '@/shared/ui/PageContainer';
import { Skeleton } from '@/shared/ui/Skeleton';

export function ResultSkeleton() {
  return (
    <PageContainer className="flex flex-col gap-6">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-44 w-full rounded-[24px]" />
      <div className="flex flex-col gap-3">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-20 w-full" />
      </div>
    </PageContainer>
  );
}
