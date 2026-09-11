import './psychoemotional.css';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { Spinner } from '@/shared/ui/Spinner';
import { AssessmentRail } from '@/shared/ui/navigation/AssessmentRail';
import { AssessmentIntro } from '../components/AssessmentIntro';
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
const INTRO_AUTO_ADVANCE_MS = 2000;

/**
 * Блок психоэмоционального теста (PRO-306). `data-theme="light"` +
 * `.pe-block` (см. psychoemotional.css) принудительно держат светлую тему —
 * колориметрия §4 это приёмочный критерий; `.pe-block` переобъявляет токены
 * продукта их светлыми значениями, поэтому `AssessmentRail`/`AssessmentIntro`
 * ниже рендерятся корректно независимо от темы приложения.
 *
 * Вступительный экран — тот же `AssessmentIntro` (мимо кикер/тайтл/мета/CTA
 * + 2с авто-переход), что стоит перед основной батареей (AssessmentPage) и
 * перед мотивацией (MotivationHarterFlow) — 2026-09-11: раньше блока не
 * было (§5.1 старой версии тикета), и переход сюда выглядел резким обрывом
 * на фоне остального теста. Каждый заход — с чистого листа
 * (usePsychoEmotional), поэтому интро показывается при каждом входе, без
 * sessionStorage-пометки "уже видел".
 */
export default function PsychoEmotionalPage() {
  const navigate = useNavigate();
  const [introSeen, setIntroSeen] = useState(false);
  const introTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    introTimerRef.current = setTimeout(() => setIntroSeen(true), INTRO_AUTO_ADVANCE_MS);
    return () => {
      if (introTimerRef.current !== null) clearTimeout(introTimerRef.current);
    };
  }, []);

  function handleStartIntro() {
    if (introTimerRef.current !== null) {
      clearTimeout(introTimerRef.current);
      introTimerRef.current = null;
    }
    setIntroSeen(true);
  }

  const {
    step,
    pauseStartedAt,
    submitting,
    handleCheckin,
    handleCircle1,
    handlePauseContinue,
    handleCircle2,
  } = usePsychoEmotional();

  const progress = introSeen ? ((STEP_ORDER.indexOf(step) + 1) / STEP_ORDER.length) * 100 : 0;

  return (
    <div className="pe-block flex flex-col min-h-screen" data-theme="light">
      <AssessmentRail
        title={introSeen ? STEP_TITLE[step] : 'Психоэмоциональный срез'}
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
        {!introSeen ? (
          <AssessmentIntro
            kicker="Психоэмоциональный тест"
            title="Выбери, что откликается"
            subtitle="Пара вопросов, выбор цвета и короткая пауза — без правильных ответов"
            itemCountLabel="4 шага"
            durationLabel="~4 мин"
            ctaLabel="Начать"
            onStart={handleStartIntro}
          />
        ) : submitting ? (
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
