import { useParams } from 'react-router';
import { PageContainer } from '@/shared/ui/PageContainer';
import { Spinner } from '@/shared/ui/Spinner';
import { Text } from '@/shared/ui/typography/Text';
import { useBelbinAssessment } from './hooks/useBelbinAssessment';
import { BelbinIntro } from './components/BelbinIntro';
import { BelbinBlock } from './components/BelbinBlock';
import { BelbinDone } from './components/BelbinDone';

/**
 * PRO-338 Ф2.6 — Belbin BTRSPI ("Кто вы в организации"), 7 ипсативных
 * блоков. Отдельный маршрут вне обычного `/assessment` потока
 * (01-Фаза0-Фундамент.md Ф0.8): запускается только по прямой ссылке из
 * кабинета психолога ("назначить расширенный блок"), не идёт следом за
 * MI/RIASEC/BigFive и не показывается в обычной навигации.
 */
export default function BelbinPage() {
  const { assessmentId = '' } = useParams<{ assessmentId: string }>();
  const {
    isLoading,
    loadError,
    instruction,
    phase,
    section,
    sectionIndex,
    sectionCount,
    allocation,
    blockTotal,
    isBlockValid,
    isLastBlock,
    setAllocationValue,
    start,
    goBack,
    goNext,
    submitting,
    submitError,
  } = useBelbinAssessment(assessmentId);

  return (
    <div className="min-h-screen bg-page">
      <PageContainer size="content" className="py-10">
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

        {!isLoading && !loadError && phase === 'intro' && (
          <BelbinIntro instruction={instruction} onStart={start} />
        )}

        {!isLoading && !loadError && phase === 'block' && section && (
          <BelbinBlock
            section={section}
            sectionIndex={sectionIndex}
            sectionCount={sectionCount}
            allocation={allocation}
            blockTotal={blockTotal}
            isValid={isBlockValid}
            isLastBlock={isLastBlock}
            submitting={submitting}
            submitError={submitError}
            onChange={setAllocationValue}
            onBack={goBack}
            onNext={goNext}
          />
        )}

        {phase === 'done' && <BelbinDone />}
      </PageContainer>
    </div>
  );
}
