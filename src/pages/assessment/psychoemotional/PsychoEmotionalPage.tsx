import './psychoemotional.css';
import { Spinner } from '@/shared/ui/Spinner';
import { usePsychoEmotional } from './hooks/usePsychoEmotional';
import { CheckInStep } from './components/CheckInStep';
import { ColorCircleStep } from './components/ColorCircleStep';
import { PauseStep } from './components/PauseStep';

/**
 * Блок психоэмоционального теста (PRO-306) — assembly-only. Вступительного
 * экрана нет (§5.1): пользователь сразу попадает в check-in. `data-theme="light"`
 * + `.pe-block` (см. psychoemotional.css) принудительно держат светлую тему
 * — колориметрия §4 это приёмочный критерий.
 */
export default function PsychoEmotionalPage() {
  const {
    step,
    pauseStartedAt,
    submitting,
    handleCheckin,
    handleCircle1,
    handlePauseContinue,
    handleCircle2,
  } = usePsychoEmotional();

  return (
    <div className="pe-block" data-theme="light">
      {submitting ? (
        <div className="flex min-h-[100dvh] items-center justify-center">
          <Spinner />
        </div>
      ) : step === 'checkin' ? (
        <CheckInStep onSubmit={handleCheckin} />
      ) : step === 'circle1' ? (
        <ColorCircleStep
          instruction="Выбери цвет, который приятнее всего прямо сейчас"
          onComplete={handleCircle1}
        />
      ) : step === 'pause' ? (
        <PauseStep
          startedAt={pauseStartedAt ?? Date.now()}
          onContinue={handlePauseContinue}
        />
      ) : (
        <ColorCircleStep
          instruction="Выбери заново, как будто в первый раз. Не старайся вспомнить прошлый порядок"
          onComplete={handleCircle2}
        />
      )}
    </div>
  );
}
