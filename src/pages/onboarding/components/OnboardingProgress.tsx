// Shared progress bar for the whole onboarding sequence — one rounded line
// segment per step (done/current filled, upcoming a plain hairline bar)
// with a small uppercase "Шаг X из Y" caption underneath. Used by both
// ProfileSetupPage (steps 1-2) and ArtifactsSetupPage (steps 3-4) so the
// two pages read as one continuous flow.
import { useTranslation } from 'react-i18next';

export function OnboardingProgress({ current, total }: { current: number; total: number }) {
  const { t } = useTranslation('onboarding');
  const label = t('progress.step', { current, total });
  return (
    <div
      className="journey-progress w-full flex flex-col gap-2.5"
      role="progressbar"
      aria-valuenow={current}
      aria-valuemin={1}
      aria-valuemax={total}
      aria-label={label}
    >
      <div className="flex gap-1.5">
        {Array.from({ length: total }, (_, i) => {
          const step = i + 1;
          return (
            <span
              key={step}
              className="flex-1 h-1.5 rounded-full transition-colors"
              style={{ background: step <= current ? 'var(--pine)' : 'var(--hairline)' }}
            />
          );
        })}
      </div>
      <p className="journey-kicker !gap-2 text-[color:var(--mute)]">{label}</p>
    </div>
  );
}
