import { Navigate } from 'react-router';
import { Button, Mascot } from '@/shared/ui';
import { useGoalCheck } from './hooks/useGoalCheck';

// Step 5 of the onboarding→assessment journey: shown right after the
// diagnostic finishes generating a result, but before the results report
// itself — only for students whose goal was "explore" (i.e. they didn't
// have one specific target). Offers a few directions grounded in the
// diagnostic result that was just computed, not invented defaults.
//
// Mascot state is deliberately `transition`, not `completion`: nothing is
// "done" from the student's perspective yet (the report hasn't been shown),
// so completion's finished-the-work implication would be wrong; `rest` is
// for fatigue, not applicable here; `waiting` implies no forward motion,
// but there is real motion — a stage just changed. `transition` is exactly
// "stage changed, moving to the next section" — the same state /roadmap
// uses for its goal-switch banners.
export default function GoalCheckPage() {
  const { hasReport, isJunior, suggestions, handleContinue } = useGoalCheck();

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
              <span className="font-mono text-[11px] tracking-[.1em] uppercase text-muted">
                Шаг 5 · После диагностики, до отчёта · только для цели «пока не знаю»
              </span>
              <h1
                className="mt-2"
                style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 32, letterSpacing: '-0.02em', lineHeight: 1.12, color: 'var(--midnight)' }}
              >
                Кажется, я понял, что тебе близко
              </h1>
              <p className="text-body mt-2" style={{ color: 'var(--mute)' }}>
                {isJunior
                  ? 'По твоим ответам вот что тебе особенно интересно'
                  : 'По твоим ответам эти направления подходят тебе больше всего'}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {suggestions[0] && (
              <div
                key={suggestions[0].key}
                className="flex flex-col gap-1.5 px-5 py-4"
                style={{ background: 'var(--bg-surface)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', borderLeft: '3px solid var(--pine)' }}
              >
                <span className="font-mono text-[10px] uppercase tracking-[.08em]" style={{ color: 'var(--pine)' }}>
                  Похоже больше всего
                </span>
                <p style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 19, color: 'var(--midnight)' }}>
                  {suggestions[0].title}
                </p>
                <p className="text-[15px]" style={{ color: 'var(--mute)' }}>{suggestions[0].subtitle}</p>
              </div>
            )}

            {suggestions[1] && (
              <div
                key={suggestions[1].key}
                className="flex flex-col gap-1.5 px-5 py-4"
                style={{ background: 'var(--bg-surface)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}
              >
                <span className="font-mono text-[10px] uppercase tracking-[.08em] text-muted">
                  Тоже подходит
                </span>
                <p style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 19, color: 'var(--midnight)' }}>
                  {suggestions[1].title}
                </p>
                <p className="text-[15px]" style={{ color: 'var(--mute)' }}>{suggestions[1].subtitle}</p>
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
              <span className="font-mono text-[10px] uppercase tracking-[.08em] text-muted">
                Если ни то, ни другое
              </span>
              <p style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 17, color: 'var(--midnight)' }}>
                Пока не знаю — и это нормально
              </p>
              <p className="text-[15px]" style={{ color: 'var(--mute)' }}>
                Ничего страшного, оставайся на «пока не знаю» — открой отчёт, там будет подробнее
              </p>
            </button>

            {suggestions.length === 0 && (
              <p className="text-secondary font-medium text-[15px]">
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
