import { useParams } from 'react-router';
import { PageContainer } from '@/shared/ui/PageContainer';
import { ProgressBar } from '@/shared/ui/ProgressBar';
import { Spinner } from '@/shared/ui/Spinner';
import { Text } from '@/shared/ui/typography/Text';
import { useAsturAssessment } from './hooks/useAsturAssessment';
import { SubtestIntro } from './components/SubtestIntro';
import { SubtestRunner } from './components/SubtestRunner';
import { LabilityRunner } from './components/LabilityRunner';
import { AsturDone } from './components/AsturDone';

/**
 * PRO-338 Ф3.6 — АСТУР ("Характеристики интеллекта"), 7 субтестов
 * (8-й — «Геометрические фигуры» — ждёт визуального материала, Ф3.1, не
 * включён в поток). Отдельный маршрут вне обычного `/assessment` (как
 * Belbin, Ф2.6): запускается только по прямой ссылке из кабинета
 * психолога.
 */
export default function AsturPage() {
  const { assessmentId = '' } = useParams<{ assessmentId: string }>();
  const {
    isLoading,
    loadError,
    subtest,
    subtestIndex,
    subtestCount,
    stepPhase,
    allDone,
    labilityItemLimitMs,
    beginSubtest,
    completeSubtest,
    submitting,
    submitError,
  } = useAsturAssessment(assessmentId);

  return (
    <div className="min-h-screen bg-page">
      <PageContainer size="content" className="py-10 flex flex-col gap-6">
        {!allDone && subtestCount > 0 && (
          <ProgressBar
            value={(subtestIndex / subtestCount) * 100}
            label={`Субтест ${Math.min(subtestIndex + 1, subtestCount)} из ${subtestCount}`}
          />
        )}

        {isLoading && (
          <div className="flex justify-center py-16">
            <Spinner size="lg" />
          </div>
        )}

        {loadError && (
          <Text variant="body-md" className="text-danger text-center py-16">
            {loadError}
          </Text>
        )}

        {!isLoading && !loadError && subtest && stepPhase === 'instruction' && (
          <SubtestIntro subtest={subtest} index={subtestIndex} count={subtestCount} onStart={beginSubtest} />
        )}

        {!isLoading && !loadError && subtest && stepPhase === 'running' && subtest.key === 'lability' && (
          <LabilityRunner
            subtest={subtest}
            itemLimitMs={labilityItemLimitMs}
            submitting={submitting}
            submitError={submitError}
            onSubmit={(answers, elapsed_ms) => completeSubtest({ answers, elapsed_ms })}
          />
        )}

        {!isLoading && !loadError && subtest && stepPhase === 'running' && subtest.key !== 'lability' && (
          <SubtestRunner
            subtest={subtest}
            submitting={submitting}
            submitError={submitError}
            onSubmit={(answers) => completeSubtest({ answers })}
          />
        )}

        {!isLoading && !loadError && allDone && <AsturDone />}
      </PageContainer>
    </div>
  );
}
