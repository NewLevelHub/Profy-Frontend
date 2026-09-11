import { useTranslation } from 'react-i18next';
import { Navigate } from 'react-router';
import { Button, Mascot } from '@/shared/ui';
import { Heading } from '@/shared/ui/typography/Heading';
import { Text } from '@/shared/ui/typography/Text';
import { cn } from '@/shared/lib/cn';
import { useGoalCheck } from './hooks/useGoalCheck';

// Step 5 of the onboarding→assessment journey: shown right after the
// diagnostic finishes generating a result, for every goal, but before the
// results report itself. Content adapts to the stated goal (see
// useGoalCheck's `showsCareers`): 'profession'/'university' get concrete
// career matches, junior students and 'explore' get a profession-agnostic
// self-understanding read — showing job titles to someone whose goal was
// just "understand myself" would contradict that goal. Always grounded in
// the diagnostic result that was just computed, never invented defaults.
//
// Mascot state is deliberately `transition`, not `completion`: nothing is
// "done" from the student's perspective yet (the report hasn't been shown),
// so completion's finished-the-work implication would be wrong; `rest` is
// for fatigue, not applicable here; `waiting` implies no forward motion,
// but there is real motion — a stage just changed. `transition` is exactly
// "stage changed, moving to the next section" — the same state /roadmap
// uses for its goal-switch banners.
export default function GoalCheckPage() {
  const { t } = useTranslation('assessment');
  const { hasReport, showsCareers, suggestions, handleContinue } = useGoalCheck();

  if (!hasReport) {
    return <Navigate to="/results" replace />;
  }

  return (
    <div className="journey-page min-h-screen flex flex-col">
      <div className="relative z-[1] flex-1 overflow-y-auto px-3 py-10 sm:px-4 lg:px-6 lg:py-14">
        <div className="w-full max-w-[720px] mx-auto">
          <div className="journey-shell flex flex-col gap-7 px-6 py-8 sm:px-9 sm:py-10">
            <span className="journey-kicker">{t('goalCheck.kicker')}</span>

            <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:gap-8">
              <div className="flex flex-col gap-2.5 min-w-0 flex-1">
                <Heading level="display-md" className="text-[color:var(--text-heading)] text-balance">
                  {t('goalCheck.title')}
                </Heading>
                <Text variant="body-md" className="text-secondary max-w-[48ch]">
                  {showsCareers
                    ? t('goalCheck.subtitleCareers')
                    : t('goalCheck.subtitleInterests')}
                </Text>
              </div>
              <div className="journey-mascot-well self-center sm:self-auto shrink-0">
                <Mascot state="transition" size={96} interactive />
              </div>
            </div>

            <div className="flex flex-col gap-3">
              {suggestions[0] && (
                <div
                  key={suggestions[0].key}
                  className={cn(
                    'flex flex-col gap-1.5 px-5 py-4 rounded-[14px]',
                    'bg-[color-mix(in_srgb,var(--pine)_6%,var(--paper))]',
                    'border border-[color:color-mix(in_srgb,var(--pine)_28%,var(--border))]',
                  )}
                >
                  <span className="journey-kicker !mb-0" style={{ color: 'var(--pine)' }}>
                    {t('goalCheck.bestMatch')}
                  </span>
                  <p className="text-body-lg font-semibold text-[color:var(--text-heading)] m-0">
                    {suggestions[0].title}
                  </p>
                  <p className="text-body-sm text-muted m-0">{suggestions[0].subtitle}</p>
                </div>
              )}

              {suggestions[1] && (
                <div
                  key={suggestions[1].key}
                  className={cn(
                    'flex flex-col gap-1.5 px-5 py-4 rounded-[14px]',
                    'bg-[color-mix(in_srgb,var(--paper)_90%,transparent)]',
                    'border border-[color:color-mix(in_srgb,#fff_45%,var(--border))]',
                  )}
                >
                  <span className="journey-kicker !mb-0 text-muted">
                    {t('goalCheck.alsoFits')}
                  </span>
                  <p className="text-body-lg font-semibold text-[color:var(--text-heading)] m-0">
                    {suggestions[1].title}
                  </p>
                  <p className="text-body-sm text-muted m-0">{suggestions[1].subtitle}</p>
                </div>
              )}

              <button
                type="button"
                onClick={handleContinue}
                className={cn(
                  'flex flex-col gap-1.5 px-5 py-4 text-left rounded-[14px] transition-colors press-scale',
                  'bg-transparent border border-dashed border-[color:var(--hairline)]',
                  'hover:bg-hover hover:border-[color:var(--border)]',
                )}
              >
                <span className="journey-kicker !mb-0 text-muted">
                  {t('goalCheck.neitherHeading')}
                </span>
                <p className="text-body-lg font-semibold text-[color:var(--text-heading)] m-0">
                  {t('goalCheck.dontKnowYet')}
                </p>
                <p className="text-body-sm text-muted m-0">
                  {t('goalCheck.dontKnowBody')}
                </p>
              </button>

              {suggestions.length === 0 && (
                <p className="text-body-sm text-secondary font-medium m-0">
                  {t('goalCheck.fullReadyBody')}
                </p>
              )}
            </div>

            <div className="pt-1 border-t border-default">
              <Button
                size="lg"
                className="w-full h-14 rounded-pill font-extrabold"
                onClick={handleContinue}
              >
                {t('goalCheck.showReport')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
