// Shared progress bar for the whole onboarding sequence — one rounded line
// segment per step (done/current filled, upcoming a plain hairline bar)
// with a small uppercase "Шаг X из Y" caption underneath. Used by both
// ProfileSetupPage (steps 1-4) and ArtifactsSetupPage (steps 5-9, see
// onboardingSteps.ts) so the two pages read as one continuous flow instead
// of profile setup ending and a disconnected "artifacts" page beginning.
export function OnboardingProgress({ current, total }: { current: number; total: number }) {
  return (
    <div
      className="w-full flex flex-col gap-2"
      role="progressbar"
      aria-valuenow={current}
      aria-valuemin={1}
      aria-valuemax={total}
      aria-label={`Шаг ${current} из ${total}`}
    >
      <div className="flex gap-1.5">
        {Array.from({ length: total }, (_, i) => {
          const step = i + 1;
          return (
            <span
              key={step}
              className="flex-1 h-1.5 rounded-full"
              style={{ background: step <= current ? 'var(--pine)' : 'var(--hairline)' }}
            />
          );
        })}
      </div>
      <p className="text-tiny font-semibold tracking-wide uppercase" style={{ color: 'var(--mute)' }}>
        Шаг {current} из {total}
      </p>
    </div>
  );
}
