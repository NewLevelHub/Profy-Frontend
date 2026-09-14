import './psychoemotional.css';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Spinner } from '@/shared/ui/Spinner';
import { AssessmentRail } from '@/shared/ui/navigation/AssessmentRail';
import { AssessmentIntro } from '../components/AssessmentIntro';
import { usePsychoEmotional } from './hooks/usePsychoEmotional';
import { CheckInStep } from './components/CheckInStep';
import { ColorCircleStep } from './components/ColorCircleStep';
import type { PsychoFinishStep } from '@/shared/store/psychoemotional';

const STEP_ORDER: readonly PsychoFinishStep[] = ['checkin', 'circle2'];
const STEP_TITLE_KEY: Record<PsychoFinishStep, string> = {
  checkin: 'psychoemotional.circle2.stepTitleCheckin',
  circle2: 'psychoemotional.circle2.stepTitleCircle2',
};
const INTRO_AUTO_ADVANCE_MS = 2000;

/**
 * Финальный экран психоэмоционального блока (PRO-3xx redesign): check-in +
 * повторный выбор цвета (круг 2), в конце всего прохождения — после круга 1
 * (`/assessment/psychoemotional-start`, перед основной батареей) и после всех
 * тестов. Реальное время между кругами (вся батарея + pairs + motivation)
 * заменяет прежнюю искусственную 120с-паузу — `pause_actual_sec` считает
 * бэкенд на finish. `data-theme="light"` + `.pe-block` (см.
 * psychoemotional.css) принудительно держат светлую тему — колориметрия §4
 * это приёмочный критерий.
 */
export default function PsychoEmotionalPage() {
  const navigate = useNavigate();
  const { t } = useTranslation('assessment');
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

  const { step, submitting, handleCheckin, handleCircle2 } = usePsychoEmotional();

  const progress = introSeen ? ((STEP_ORDER.indexOf(step) + 1) / STEP_ORDER.length) * 100 : 0;

  return (
    <div className="pe-block flex flex-col min-h-screen" data-theme="light">
      <AssessmentRail
        title={introSeen ? t(STEP_TITLE_KEY[step]) : t('psychoemotional.circle1.railTitleIntro')}
        sectionLabel={t('psychoemotional.sectionLabel')}
        progressAriaLabel={t('psychoemotional.progressAriaLabel')}
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
            kicker={t('psychoemotional.circle2.introKicker')}
            title={t('psychoemotional.circle2.introTitle')}
            subtitle={t('psychoemotional.circle2.introSubtitle')}
            itemCountLabel={t('psychoemotional.circle2.introItemCount')}
            durationLabel={t('psychoemotional.circle2.introDuration')}
            ctaLabel={t('psychoemotional.circle2.introCta')}
            onStart={handleStartIntro}
          />
        ) : submitting ? (
          <div className="flex-1 flex items-center justify-center">
            <Spinner size="lg" />
          </div>
        ) : (
          <div className="flex-1 flex flex-col justify-center px-4 py-8 sm:px-6">
            {step === 'checkin' && <CheckInStep onSubmit={handleCheckin} />}
            {step === 'circle2' && (
              <ColorCircleStep
                instruction={t('psychoemotional.circle2.instruction')}
                onComplete={handleCircle2}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
