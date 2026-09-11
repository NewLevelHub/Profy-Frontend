import './psychoemotional.css';
import { useNavigate } from 'react-router';
import { Spinner } from '@/shared/ui/Spinner';
import { AssessmentRail } from '@/shared/ui/navigation/AssessmentRail';
import { usePsychoEmotional } from './hooks/usePsychoEmotional';
import { CheckInStep } from './components/CheckInStep';
import { ColorCircleStep } from './components/ColorCircleStep';
import { PauseStep } from './components/PauseStep';
import type { PsychoStep } from '@/shared/store/psychoemotional';

const STEP_ORDER: readonly PsychoStep[] = ['checkin', 'circle1', 'pause', 'circle2'];
const STEP_TITLE: Record<PsychoStep, string> = {
  checkin: 'Пара вопросов',
  circle1: 'Выбор цвета · 1',
  pause: 'Пауза',
  circle2: 'Выбор цвета · 2',
};

/**
 * Блок психоэмоционального теста (PRO-306). Вступительного экрана нет
 * (§5.1): пользователь сразу попадает в check-in. `data-theme="light"`
 * + `.pe-block` (см. psychoemotional.css) принудительно держат светлую тему
 * — колориметрия §4 это приёмочный критерий; `.pe-block` переобъявляет
 * токены продукта их светлыми значениями, поэтому `AssessmentRail` ниже
 * рендерится корректно независимо от темы приложения.
 *
 * Использует ТОТ ЖЕ `AssessmentRail`, что и AssessmentPage/MotivationHarterFlow
 * (2026-09-11 rework) — раньше блок был отдельной "плавающей карточкой" без
 * рейла и без выхода, что выглядело чужеродно рядом с остальным тестом и не
 * давало уйти со страницы. Прогресс/выход теперь идентичны остальной батарее.
 */
export default function PsychoEmotionalPage() {
  const navigate = useNavigate();
  const {
    step,
    pauseStartedAt,
    submitting,
    handleCheckin,
    handleCircle1,
    handlePauseContinue,
    handleCircle2,
  } = usePsychoEmotional();

  const progress = ((STEP_ORDER.indexOf(step) + 1) / STEP_ORDER.length) * 100;

  return (
    <div className="pe-block flex flex-col min-h-screen" data-theme="light">
      <AssessmentRail
        title={STEP_TITLE[step]}
        sectionLabel="Психоэмоциональный срез"
        progressAriaLabel="Прогресс психоэмоционального блока"
        progress={progress}
        // Ничего не персистится между заходами (см. usePsychoEmotional —
        // "чистого листа"), поэтому выйти — не "бросить прогресс", а просто
        // уйти; никакого save-and-exit флоу здесь нет, в отличие от основной
        // батареи, и лишнее диалоговое окно с обещанием "прогресс сохранён"
        // было бы неправдой для этого блока.
        onExit={() => navigate('/results')}
      />

      <div className="flex-1 flex flex-col w-full max-w-2xl mx-auto">
        {submitting ? (
          <div className="flex-1 flex items-center justify-center">
            <Spinner size="lg" />
          </div>
        ) : (
          <div className="flex-1 flex flex-col justify-center px-4 py-8 sm:px-6">
            {step === 'checkin' && <CheckInStep onSubmit={handleCheckin} />}
            {step === 'circle1' && (
              <ColorCircleStep
                instruction="Выбери цвет, который приятнее всего прямо сейчас"
                onComplete={handleCircle1}
              />
            )}
            {step === 'pause' && (
              <PauseStep
                startedAt={pauseStartedAt ?? Date.now()}
                onContinue={handlePauseContinue}
              />
            )}
            {step === 'circle2' && (
              <ColorCircleStep
                instruction="Выбери заново, как будто в первый раз. Не старайся вспомнить прошлый порядок"
                onComplete={handleCircle2}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
