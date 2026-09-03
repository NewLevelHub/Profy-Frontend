import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Spinner } from '@/shared/ui/Spinner';
import { Spine, type SpineNode } from '@/shared/ui/Spine';
import { Mascot } from '@/shared/ui/Mascot';

const STEP_MS = 6000;

export function GeneratingOverlay() {
  const { t } = useTranslation('roadmap');
  const [step, setStep] = useState(0);

  /** Generation takes up to ~60s — rotate the copy so it never looks frozen. */
  const STEPS = useMemo(
    () => [
      t('generating.step1'),
      t('generating.step2'),
      t('generating.step3'),
      t('generating.step4'),
      t('generating.step5'),
    ],
    [t],
  );

  useEffect(() => {
    const id = setInterval(
      () => setStep(prev => Math.min(prev + 1, STEPS.length - 1)),
      STEP_MS,
    );
    return () => clearInterval(id);
  }, [STEPS.length]);

  return (
    <div
      className="flex flex-col items-center justify-center min-h-[60vh] gap-6 px-6 text-center"
      role="status"
      aria-live="polite"
    >
      <Mascot state="waiting" size={140} />
      <Spinner size="lg" />

      <div className="flex flex-col gap-2">
        <h2 className="text-title font-extrabold text-primary">{t('generating.title')}</h2>
        <p className="text-body text-secondary">{STEPS[step]}</p>
      </div>

      <div className="w-full max-w-xs">
        <Spine
          nodes={STEPS.map((_, i): SpineNode => ({
            id: i,
            status: i < step ? 'done' : i === step ? 'current' : 'upcoming',
            goal: i === STEPS.length - 1,
          }))}
          thickness={0.85}
          ariaLabel={t('generating.stepAria', { current: step + 1, total: STEPS.length })}
        />
      </div>

      <p className="text-caption text-muted">{t('generating.hint')}</p>
    </div>
  );
}
