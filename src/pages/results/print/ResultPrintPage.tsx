import { Button } from '@/shared/ui/Button';
import { Skeleton } from '@/shared/ui/Skeleton';
import { useResultPrint } from './hooks/useResultPrint';
import { PrintToolbar } from './components/PrintToolbar';
import { PrintDocument } from './components/PrintDocument';

function PrintSkeleton() {
  return (
    <div className="print-sheet flex flex-col gap-5">
      <Skeleton className="h-9 w-2/3" />
      {Array.from({ length: 5 }, (_, i) => (
        <div key={i} className="flex flex-col gap-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-20 w-full" />
        </div>
      ))}
    </div>
  );
}

function PrintFallback({ text, onBack }: { text: string; onBack: () => void }) {
  return (
    <div className="print-sheet flex flex-col items-center gap-4 text-center py-16">
      <p className="text-body text-secondary">{text}</p>
      <Button onClick={onBack}>К результатам</Button>
    </div>
  );
}

/**
 * Печатная версия результата (/results/print). Chrome-free on purpose —
 * same reasoning as /profile/certificates: this is a document view, not a
 * tab inside AppLayout, and the sidebar/nav would end up either printed or
 * hidden by a pile of print-only overrides.
 */
export default function ResultPrintPage() {
  const {
    report,
    isLoading,
    error,
    hasCompletedAssessment,
    ageGroup,
    goal,
    isJunior,
    profile,
    print,
    back,
  } = useResultPrint();

  return (
    <div className="print-shell px-4 py-6 sm:py-10">
      <div className="print-page-frame max-w-[210mm] mx-auto">
        <PrintToolbar onBack={back} onPrint={print} />

        {!hasCompletedAssessment ? (
          <PrintFallback text="Тест ещё не пройден — экспортировать пока нечего." onBack={back} />
        ) : isLoading ? (
          <PrintSkeleton />
        ) : error || !report ? (
          <PrintFallback text={error ?? 'Не удалось загрузить результаты.'} onBack={back} />
        ) : (
          <PrintDocument
            report={report}
            profile={profile}
            ageGroup={ageGroup}
            goal={goal}
            isJunior={isJunior}
          />
        )}
      </div>
    </div>
  );
}
