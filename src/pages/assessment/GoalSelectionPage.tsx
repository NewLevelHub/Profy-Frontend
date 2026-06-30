import { Navigate } from 'react-router';
import { cn } from '@/shared/lib/cn';
import { Button, Spinner } from '@/shared/ui';
import { useGoalGuard, useGoalSelection } from './hooks/useGoalSelection';
import type { AssessmentGoal } from '@/shared/types';

interface GoalCard {
  goal: AssessmentGoal;
  emoji: string;
  title: string;
  subtitle: string;
  seniorOnly?: boolean;
}

const GOAL_CARDS: GoalCard[] = [
  {
    goal: 'explore',
    emoji: '🔍',
    title: 'Понять себя',
    subtitle: 'Узнай свои сильные стороны и интересы',
  },
  {
    goal: 'profession',
    emoji: '🎯',
    title: 'Выбрать профессию',
    subtitle: 'Найди направление, которое тебе подойдёт',
  },
  {
    goal: 'university',
    emoji: '🎓',
    title: 'Поступить в университет',
    subtitle: 'Построй путь к поступлению',
    seniorOnly: true,
  },
  {
    goal: 'explore',
    emoji: '💬',
    title: 'Пока не знаю',
    subtitle: 'Начнём с начала, разберёмся вместе',
  },
];

// ── Resume dialog ─────────────────────────────────────────────────────────────

function ResumeDialog({
  open, onResume, onStartNew,
}: {
  open: boolean;
  onResume: () => void;
  onStartNew: () => void;
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-5 bg-black/40 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="resume-dialog-title"
    >
      <div className={cn(
        'w-full max-w-sm bg-surface rounded-[var(--radius-lg)] shadow-pop p-6',
        'flex flex-col gap-5',
      )}>
        <div className="flex flex-col gap-2">
          <span className="text-3xl" role="img" aria-label="незавершённый тест">⏸️</span>
          <h2 id="resume-dialog-title" className="text-title font-black text-primary">
            У тебя есть незавершённый тест
          </h2>
          <p className="text-body text-secondary">
            Хочешь продолжить с того места, где остановился, или начать заново?
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <Button
            size="lg"
            className="w-full h-12 rounded-pill font-extrabold shadow-button"
            onClick={onResume}
          >
            Продолжить
          </Button>
          <Button
            variant="ghost"
            size="lg"
            className="w-full h-12 rounded-pill"
            onClick={onStartNew}
          >
            Начать заново
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Restart confirmation dialog ───────────────────────────────────────────────

function RestartDialog({
  open, onViewResults, onStartNew,
}: {
  open: boolean;
  onViewResults: () => void;
  onStartNew: () => void;
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-5 bg-black/40 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="restart-dialog-title"
    >
      <div className={cn(
        'w-full max-w-sm bg-surface rounded-[var(--radius-lg)] shadow-pop p-6',
        'flex flex-col gap-5',
      )}>
        <div className="flex flex-col gap-2">
          <span className="text-3xl" role="img" aria-label="результаты">🎉</span>
          <h2 id="restart-dialog-title" className="text-title font-black text-primary">
            У тебя уже есть результаты
          </h2>
          <p className="text-body text-secondary">
            Ты уже прошёл диагностику. Посмотреть результаты или пройти заново?
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <Button
            size="lg"
            className="w-full h-12 rounded-pill font-extrabold shadow-button"
            onClick={onViewResults}
          >
            Посмотреть результаты
          </Button>
          <Button
            variant="ghost"
            size="lg"
            className="w-full h-12 rounded-pill"
            onClick={onStartNew}
          >
            Пройти заново
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function GoalSelectionPage() {
  const { syncDone, shouldRedirect } = useGoalGuard();
  const {
    ageGroup,
    isLoading,
    isCheckingCurrent,
    error,
    resumeOpen,
    restartOpen,
    handleGoalSelect,
    handleResume,
    handleStartNew,
    handleViewResults,
    handleConfirmRestart,
  } = useGoalSelection();

  if (!syncDone) {
    return (
      <div className="min-h-screen bg-page flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (shouldRedirect) {
    return <Navigate to="/home" replace />;
  }

  const visibleCards = GOAL_CARDS.filter(
    card => !card.seniorOnly || ageGroup === 'senior',
  );

  return (
    <>
      <ResumeDialog
        open={resumeOpen}
        onResume={handleResume}
        onStartNew={handleStartNew}
      />
      <RestartDialog
        open={restartOpen}
        onViewResults={handleViewResults}
        onStartNew={handleConfirmRestart}
      />

      <div className="min-h-screen bg-page flex flex-col">
        <div className="flex-1 overflow-y-auto px-5 py-12">
          <div className="max-w-sm mx-auto flex flex-col gap-6">

            <div>
              <h1 className="text-display font-black text-primary tracking-tight mb-2">
                Что ты хочешь узнать?
              </h1>
              <p className="text-body text-secondary">
                Выбери то, что тебе сейчас важнее всего
              </p>
            </div>

            {isCheckingCurrent || restartOpen ? (
              <div className="flex justify-center py-8">
                <Spinner size="lg" />
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {visibleCards.map(card => (
                  <button
                    key={card.title}
                    type="button"
                    onClick={() => handleGoalSelect(card.goal)}
                    disabled={isLoading}
                    className={cn(
                      'flex items-center gap-4 px-4 py-4 rounded-[var(--radius)] text-left',
                      'bg-surface border border-default shadow-card',
                      'transition-colors hover:border-brand hover:bg-hover',
                      'disabled:opacity-50 disabled:cursor-not-allowed',
                    )}
                  >
                    <div className="w-12 h-12 rounded-[var(--radius-sm)] bg-brand-subtle flex items-center justify-center shrink-0">
                      <span className="text-2xl leading-none" role="img">{card.emoji}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-label font-extrabold text-primary">{card.title}</p>
                      <p className="text-small text-secondary mt-0.5">{card.subtitle}</p>
                    </div>
                    <span className="text-2xl text-muted shrink-0" aria-hidden="true">›</span>
                  </button>
                ))}
              </div>
            )}

            {isLoading && (
              <div className="flex justify-center">
                <Spinner size="sm" />
              </div>
            )}

            {error && (
              <p className="text-xs text-danger text-center">{error}</p>
            )}

          </div>
        </div>
      </div>
    </>
  );
}
