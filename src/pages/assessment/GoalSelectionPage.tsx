import { Navigate, useNavigate } from 'react-router';
import { cn } from '@/shared/lib/cn';
import { Button, Spinner } from '@/shared/ui';
import { useGoalGuard, useGoalSelection } from './hooks/useGoalSelection';
import type { AssessmentGoal } from '@/shared/types';

interface GoalCard {
  goal: AssessmentGoal | 'known';
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
    goal: 'known',
    emoji: '✨',
    title: 'Уже знаю, кем хочу стать',
    subtitle: 'Круто — скажи нам, а мы проверим гипотезу',
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
  const navigate = useNavigate();
  const { shouldRedirect } = useGoalGuard();
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

  if (shouldRedirect) {
    return <Navigate to="/home" replace />;
  }

  const visibleCards = GOAL_CARDS.filter(
    card => !card.seniorOnly || ageGroup === 'senior',
  );

  function onCardClick(goal: GoalCard['goal']) {
    if (goal === 'known') {
      navigate('/assessment/known-profession');
      return;
    }
    handleGoalSelect(goal);
  }

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
        <div className="flex-1 overflow-y-auto px-6 py-[70px] lg:py-12">
          <div className="max-w-[620px] lg:max-w-4xl mx-auto flex flex-col">

            <div className="mb-[30px]">
              <div className="inline-flex items-center gap-[7px] bg-brand-subtle text-brand-text font-extrabold rounded-pill px-[14px] py-[6px] mb-[18px]" style={{ fontSize: 13 }}>
                ✨ Шаг 1 · Знакомство
              </div>
              <h1 className="font-black text-primary tracking-[-0.01em] mb-2" style={{ fontSize: 38 }}>
                Что ты хочешь узнать?
              </h1>
              <p className="text-secondary font-semibold" style={{ fontSize: 17 }}>
                Выбери то, что тебе сейчас важнее всего
              </p>
            </div>

            {isCheckingCurrent || restartOpen ? (
              <div className="flex justify-center py-8">
                <Spinner size="lg" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-[14px]">
                {visibleCards.map((card, i) => (
                  <button
                    key={card.title}
                    type="button"
                    onClick={() => onCardClick(card.goal)}
                    disabled={isLoading && card.goal !== 'known'}
                    className={cn(
                      'flex items-center gap-[18px] px-[22px] py-5 text-left border-[1.5px] transition-all duration-[180ms]',
                      'disabled:opacity-50 disabled:cursor-not-allowed',
                      i === 0
                        ? 'border-[#C4B5FD] bg-brand-subtle hover:border-[#A78BFA] hover:-translate-y-0.5'
                        : 'border-default bg-surface hover:border-[#C4B5FD] hover:bg-hover hover:-translate-y-0.5',
                    )}
                    style={{ borderRadius: 20, boxShadow: '0 4px 14px rgba(30,27,75,.05)' }}
                  >
                    <div
                      className="w-[54px] h-[54px] flex items-center justify-center shrink-0"
                      style={{ borderRadius: 15, background: i === 0 ? '#fff' : 'var(--bg-active)' }}
                    >
                      <span className="text-[26px] leading-none" role="img">{card.emoji}</span>
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <p className="font-extrabold text-primary mb-[3px]" style={{ fontSize: 19 }}>{card.title}</p>
                      <p className="text-secondary font-semibold" style={{ fontSize: 14 }}>{card.subtitle}</p>
                    </div>
                    <span className="text-[22px] text-[#A78BFA] font-black shrink-0" aria-hidden="true">›</span>
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
