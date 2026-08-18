import { useState } from 'react';
import { Navigate } from 'react-router';
import { cn } from '@/shared/lib/cn';
import { Button, Spinner } from '@/shared/ui';
import { Heading } from '@/shared/ui/typography/Heading';
import { Text } from '@/shared/ui/typography/Text';
import { type as typeClass } from '@/shared/ui/typography/tokens';
import { useGoalGuard, useGoalSelection } from './hooks/useGoalSelection';
import type { AssessmentGoal, AgeGroup } from '@/shared/types';

// ── Step 4 — Goal selection ─────────────────────────────────────────────────
// IMPORTANT DATA-MODEL NOTE: each card here is a real assessment goal from
// the product model (`AssessmentGoal`), and choosing one immediately starts
// the flow. The UI should therefore present them as equal alternatives rather
// than a "main" goal plus secondary ones.

interface GoalCard {
  goal: AssessmentGoal;
  tag: string;
  title: string;
  subtitle: string;
  /** Card is hidden below this age group — matches the age-gating already
   *  used for the real goal switcher on /results (JuniorGoalLabel vs.
   *  GoalSwitcher): an unavailable card is simply absent, never shown
   *  disabled-with-explanation. */
  minAgeGroup?: AgeGroup;
}

const AGE_RANK: Record<AgeGroup, number> = { junior: 0, middle: 1, senior: 2 };

const GOAL_CARDS: GoalCard[] = [
  {
    goal: 'explore',
    tag: 'Исследовать',
    title: 'Понять себя',
    subtitle: 'Узнать свои сильные стороны и интересы — или ещё не знать, с чего начать. Это нормально, разберёмся вместе.',
  },
  {
    goal: 'profession',
    tag: 'Профессия',
    title: 'Выбрать профессию',
    subtitle: 'Найди направление, которое тебе подойдёт',
    minAgeGroup: 'middle',
  },
  {
    goal: 'university',
    tag: 'Университет',
    title: 'Поступить в университет',
    subtitle: 'Построй путь к поступлению',
    minAgeGroup: 'senior',
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
  const [hoveredGoal, setHoveredGoal] = useState<AssessmentGoal | null>(null);
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
    card => !card.minAgeGroup || AGE_RANK[ageGroup] >= AGE_RANK[card.minAgeGroup],
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
        <div className="flex-1 overflow-y-auto px-3 py-10 sm:px-4 lg:px-6 lg:py-14">
          <div className="w-full max-w-7xl mx-auto flex flex-col">

            <div className="mb-8">
              {/* <span className="font-mono text-mono-xs tracking-label uppercase text-muted">
                Шаг 4 · Цель · Выбери, что сейчас важнее
              </span> */}
              <Heading level="display-md" className="mt-2 mb-2 text-[color:var(--midnight)]">
                Чего ты хочешь от этого теста?
              </Heading>
              <Text variant="body-md" className="text-muted">
                Выбери то, что тебе сейчас важнее всего — это можно изменить позже
              </Text>
            </div>

            {isCheckingCurrent || restartOpen ? (
              <div className="flex justify-center py-8">
                <Spinner size="lg" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {visibleCards.map(card => {
                  const isHovered = hoveredGoal === card.goal;

                  return (
                    <div
                      key={card.goal}
                      className="flex flex-col gap-4 p-5 transition-all duration-200"
                      onMouseEnter={() => setHoveredGoal(card.goal)}
                      onMouseLeave={() => setHoveredGoal(null)}
                      style={{
                        background: isHovered ? 'color-mix(in srgb, var(--brand) 6%, var(--bg-surface))' : 'var(--bg-surface)',
                        borderRadius: 'var(--radius)',
                        border: isHovered ? '1px solid var(--brand)' : '1px solid var(--border)',
                        boxShadow: isHovered ? '0 18px 40px rgba(91, 71, 255, 0.12)' : 'none',
                      }}
                    >
                      <div className="flex items-center">
                        <span className={`${typeClass.monoLabel} text-muted`}>{card.tag}</span>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <p className={`${typeClass.bodyLg} font-semibold text-[color:var(--midnight)]`}>
                          {card.title}
                        </p>
                        <p className={`${typeClass.bodySm} text-muted`}>{card.subtitle}</p>
                      </div>

                      <Button
                        variant={isHovered ? 'primary' : 'ghost'}
                        size="md"
                        className="w-full mt-auto"
                        disabled={isLoading}
                        onClick={() => handleGoalSelect(card.goal)}
                      >
                        Выбрать эту цель
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}

            {isLoading && (
              <div className="flex justify-center mt-4">
                <Spinner size="sm" />
              </div>
            )}

            {error && (
              <p className="text-xs text-danger text-center mt-4">{error}</p>
            )}

          </div>
        </div>
      </div>
    </>
  );
}
