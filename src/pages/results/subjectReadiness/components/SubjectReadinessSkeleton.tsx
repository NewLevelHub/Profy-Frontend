import { PageContainer } from '@/shared/ui/PageContainer';
import { Skeleton } from '@/shared/ui/Skeleton';

export function SubjectReadinessSkeleton() {
  return (
    <PageContainer className="flex flex-col gap-6">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-5 w-full max-w-md" />
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-32 w-full rounded-[var(--radius)]" />
      ))}
    </PageContainer>
  );
}
