import './psychoemotional.css';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Spinner } from '@/shared/ui/Spinner';
import { AssessmentRail } from '@/shared/ui/navigation/AssessmentRail';
import { AssessmentIntro } from '../components/AssessmentIntro';
import { usePsychoColorStart } from './hooks/usePsychoColorStart';
import { CheckInStep } from './components/CheckInStep';
import { ColorCircleStep } from './components/ColorCircleStep';
import type { PsychoStartStep } from '@/shared/store/psychoemotional';

const STEP_ORDER: readonly PsychoStartStep[] = ['checkin', 'circle1'];
const STEP_TITLE_KEY: Record<PsychoStartStep, string> = {
  checkin: 'psychoemotional.circle1.stepTitleCheckin',
  circle1: 'psychoemotional.circle1.stepTitleCircle1',
};

/**
 * Стартовый экран психоблока (PRO-3xx redesign, §B4 п.1-2): check-in + круг 1,
 * идут ПЕРЕД основной батареей тестов (после выбора цели, перед
 * `/assessment`) — check-in первым, как в спеке. Круг 2 — на
 * `/assessment/psychoemotional`, в конце всего прохождения. `data-theme="light"`
 * + `.pe-block` держат светлую тему принудительно — колориметрия §4
 * приёмочный критерий, как и на финальном экране.
 *
 * Intro advances only on CTA click (PRO-397) — no auto-advance timer; that
 * caused a flash: intro → check-in → layout settle.
 */
export default function PsychoColorStartPage() {
  const navigate = useNavigate();
  const { t } = useTranslation('assessment');
  const [introSeen, setIntroSeen] = useState(false);

  const { ready, submitting, step, handleCheckin, handleCircle1 } = usePsychoColorStart();
  const progress = introSeen ? ((STEP_ORDER.indexOf(step) + 1) / STEP_ORDER.length) * 100 : 0;

  return (
    <div className="pe-block flex flex-col min-h-screen" data-theme="light">
      <AssessmentRail
        title={introSeen ? t(STEP_TITLE_KEY[step]) : t('psychoemotional.circle1.railTitleIntro')}
        sectionLabel={t('psychoemotional.sectionLabel')}
        progressAriaLabel={t('psychoemotional.progressAriaLabel')}
        progress={progress}
        onExit={() => navigate('/results')}
      />

      <div className="flex-1 flex flex-col w-full">
        {!ready ? (
          <div className="flex-1 flex items-center justify-center">
            <Spinner size="lg" />
          </div>
        ) : !introSeen ? (
          <AssessmentIntro
            kicker={t('psychoemotional.circle1.introKicker')}
            title={t('psychoemotional.circle1.introTitle')}
            subtitle={t('psychoemotional.circle1.introSubtitle')}
            itemCountLabel={t('psychoemotional.circle1.introItemCount')}
            durationLabel={t('psychoemotional.circle1.introDuration')}
            ctaLabel={t('psychoemotional.circle1.introCta')}
            onStart={() => setIntroSeen(true)}
          />
        ) : submitting ? (
          <div className="flex-1 flex items-center justify-center">
            <Spinner size="lg" />
          </div>
        ) : (
          <>
            {step === 'checkin' && <CheckInStep onSubmit={handleCheckin} />}
            {step === 'circle1' && (
              <ColorCircleStep
                instruction={t('psychoemotional.circle1.instruction')}
                onComplete={handleCircle1}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
