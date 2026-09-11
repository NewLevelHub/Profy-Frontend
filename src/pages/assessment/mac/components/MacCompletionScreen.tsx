import { Button } from '@/shared/ui/Button';
import { Mascot } from '@/shared/ui/Mascot';
import { Heading } from '@/shared/ui/typography/Heading';

interface MacCompletionScreenProps {
  onContinue: () => void;
}

/**
 * Экран сразу после блока МАК (PRO-317) — нейтрально, без метрик и намёка
 * на разбор. Интерпретация собирается в `/result` в конце всей батареи.
 * Та же карточка-на-Fog, что у PraisePage/RestStopPage/ExitAssessmentModal,
 * чтобы этот bookend-экран не выпадал по стилю из остального теста.
 */
export function MacCompletionScreen({ onContinue }: MacCompletionScreenProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-page px-6 py-10">
      <div
        className="flex w-full max-w-sm flex-col items-center gap-5 rounded-[var(--radius-lg)] bg-surface p-7 text-center shadow-pop sm:p-8"
        style={{ animation: 'fade-in-up 0.5s ease both' }}
      >
        <Mascot state="completion" size={96} />
        <Heading level="display-sm" as="h2" className="text-primary">
          Спасибо. Специалист подготовит разбор и обсудит его с тобой.
        </Heading>
        <Button onClick={onContinue} size="lg" className="w-full rounded-pill">
          Продолжить
        </Button>
      </div>
    </div>
  );
}
