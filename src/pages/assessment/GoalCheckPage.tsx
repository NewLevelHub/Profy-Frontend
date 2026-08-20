import { Navigate } from 'react-router';
import { Button, Mascot } from '@/shared/ui';
import { Heading } from '@/shared/ui/typography/Heading';
import { Text } from '@/shared/ui/typography/Text';
import { type as typeClass } from '@/shared/ui/typography/tokens';
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
  const { hasReport, showsCareers, suggestions, handleContinue } = useGoalCheck();

  if (!hasReport) {
    return <Navigate to="/results" replace />;
  }

  return (
    <div className="min-h-screen bg-page flex flex-col">
      <div className="flex-1 overflow-y-auto px-5 py-10 lg:py-14">
        <div className="max-w-[680px] lg:max-w-3xl mx-auto flex flex-col gap-8">

          <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:gap-7">
            <Mascot state="transition" size={96} className="shrink-0" />
            <div>
              <Heading level="display-md" className="mt-2 text-[color:var(--midnight)]">
                Кажется, я понял, что тебе близко
              </Heading>
              <Text variant="body-md" className="text-muted mt-2">
                {showsCareers
                  ? 'По твоим ответам эти направления подходят тебе больше всего'
                  : 'По твоим ответам вот что тебе особенно интересно'}
              </Text>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {suggestions[0] && (
              <div
                key={suggestions[0].key}
                className="flex flex-col gap-1.5 px-5 py-4"
                style={{
                  background: 'color-mix(in srgb, var(--pine) 5%, var(--bg-surface))',
                  borderRadius: 'var(--radius)',
                  border: '1px solid color-mix(in srgb, var(--pine) 35%, var(--border))',
                }}
              >
                <span className={typeClass.monoLabel} style={{ color: 'var(--pine)' }}>
                  Похоже больше всего
                </span>
                <p className={`${typeClass.bodyLg} font-semibold text-[color:var(--midnight)]`}>
                  {suggestions[0].title}
                </p>
                <p className={`${typeClass.bodySm} text-muted`}>{suggestions[0].subtitle}</p>
              </div>
            )}

            {suggestions[1] && (
              <div
                key={suggestions[1].key}
                className="flex flex-col gap-1.5 px-5 py-4"
                style={{ background: 'var(--bg-surface)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}
              >
                <span className={`${typeClass.monoLabel} text-muted`}>
                  Тоже подходит
                </span>
                <p className={`${typeClass.bodyLg} font-semibold text-[color:var(--midnight)]`}>
                  {suggestions[1].title}
                </p>
                <p className={`${typeClass.bodySm} text-muted`}>{suggestions[1].subtitle}</p>
              </div>
            )}

            {/* Real third choice — staying at "not sure yet" is a normal
                answer, this isn't a disabled/placeholder card. */}
            <button
              type="button"
              onClick={handleContinue}
              className="flex flex-col gap-1.5 px-5 py-4 text-left transition-colors hover:bg-hover"
              style={{ background: 'transparent', borderRadius: 'var(--radius)', border: '1.5px dashed var(--hairline)' }}
            >
              <span className={`${typeClass.monoLabel} text-muted`}>
                Если ни то, ни другое
              </span>
              <p className={`${typeClass.bodyLg} font-semibold text-[color:var(--midnight)]`}>
                Пока не знаю — и это нормально
              </p>
              <p className={`${typeClass.bodySm} text-muted`}>
                Ничего страшного, оставайся на «пока не знаю» — открой отчёт, там будет подробнее
              </p>
            </button>

            {suggestions.length === 0 && (
              <p className={`${typeClass.bodySm} text-secondary font-medium`}>
                Твой полный результат уже готов — открой его, там будет подробнее.
              </p>
            )}
          </div>

          <Button
            size="lg"
            className="w-full h-14 rounded-pill font-extrabold shadow-button"
            onClick={handleContinue}
          >
            Показать отчёт
          </Button>

        </div>
      </div>
    </div>
  );
}
