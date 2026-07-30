import { useNavigate } from 'react-router';
import { RotateCcw } from 'lucide-react';
import { ROUTES } from '@/app/routes';
import { cn } from '@/shared/lib/cn';
import { Button, Spinner } from '@/shared/ui';
import { Mascot } from '@/shared/ui/Mascot';
import { CompletedTestCard } from '@/pages/home/sections/CompletedTestCard';
import { useGoalSelection } from './hooks/useGoalSelection';
import type { AssessmentGoal } from '@/shared/types';

interface GoalCard {
  goal: AssessmentGoal | 'known';
  emoji: string;
  title: string;
  subtitle: string;
  seniorOnly?: boolean;
  // "Уже знаю" quizzes only exist for leaf specialties, and junior never
  // resolves to a leaf (only sections) — same age-group rule as the main
  // akinator engine, see seed_akinator_content.py's "Age-group pass".
  hiddenForJunior?: boolean;
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
    hiddenForJunior: true,
  },
  {
    goal: 'university',
    emoji: '🎓',
    title: 'Поступить в университет',
    subtitle: 'Построй путь к поступлению',
    seniorOnly: true,
  },
];

// ── Test not finished — full-page state ─────────────────────────────────────

function TestResumeView({
  onResume, onStartNew,
}: {
  onResume: () => void;
  onStartNew: () => void;
}) {
  return (
    <div className="max-w-[620px] lg:max-w-4xl mx-auto flex flex-col gap-5">
      <div className="bg-surface border-2 border-strong rounded-[26px] p-6 sm:p-8 flex flex-col sm:flex-row gap-5 sm:gap-6 items-center">
        <div
          className="w-[130px] h-[160px] sm:w-[150px] sm:h-[186px] flex-none rounded-[20px] bg-brand-subtle flex items-end justify-center overflow-hidden"
          aria-hidden="true"
        >
          <Mascot kind="psy" className="w-[112px] h-[140px] sm:w-[134px] sm:h-[176px]" />
        </div>

        <div className="flex-1 min-w-0 flex flex-col items-center sm:items-start gap-2.5 text-center sm:text-left">
          <span className="inline-flex text-[13px] font-extrabold px-4 py-[7px] rounded-pill bg-[#FFF7ED] text-[#C2410C]">
            Тест не закончен
          </span>
          <h1 className="font-black text-primary text-2xl sm:text-[30px] leading-tight text-pretty">
            Мы сохранили твой прогресс
          </h1>
          <p className="text-secondary font-semibold text-[15px] sm:text-base text-pretty">
            Прогресс сохранён — можно продолжить с того же места или начать тест с самого начала.
          </p>

          <div className="flex gap-3 flex-wrap justify-center sm:justify-start mt-2">
            <Button onClick={onResume}>Продолжить тест</Button>
            <Button variant="ghost" onClick={onStartNew}>
              <RotateCcw size={16} />
              Начать сначала
            </Button>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3.5 bg-[#F5F3FF] border-2 border-dashed border-[#C4B5FD] rounded-[20px] px-5 py-4">
        <span className="text-xl" aria-hidden="true">🔒</span>
        <p className="text-secondary font-semibold text-[15px] text-pretty">
          Результат, план развития и подборка университетов откроются, когда ты закончишь тест.
        </p>
      </div>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function GoalSelectionPage() {
  const navigate = useNavigate();
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
    completedAt,
    directionName,
    questionsAnswered,
    matchPercent,
    isCompletionLoading,
    confirmRestart,
    handleRestartRequest,
    handleRestartConfirm,
    handleRestartCancel,
  } = useGoalSelection();

  if (resumeOpen) {
    return <TestResumeView onResume={handleResume} onStartNew={handleStartNew} />;
  }

  if (restartOpen) {
    return (
      <div className="max-w-[620px] lg:max-w-4xl mx-auto flex flex-col gap-5">
        <CompletedTestCard
          completedAt={completedAt}
          directionName={directionName}
          questionsAnswered={questionsAnswered}
          matchPercent={matchPercent}
          isLoading={isCompletionLoading}
          confirmRestart={confirmRestart}
          onViewResults={handleViewResults}
          onRestartRequest={handleRestartRequest}
          onRestartConfirm={handleRestartConfirm}
          onRestartCancel={handleRestartCancel}
        />
      </div>
    );
  }

  const visibleCards = GOAL_CARDS.filter(
    card =>
      (!card.seniorOnly || ageGroup === 'senior') &&
      (!card.hiddenForJunior || ageGroup !== 'junior'),
  );

  function onCardClick(goal: GoalCard['goal']) {
    if (goal === 'known') {
      navigate(ROUTES.knownProfessionSpheres);
      return;
    }
    handleGoalSelect(goal);
  }

  return (
    <div className="max-w-[620px] lg:max-w-4xl mx-auto flex flex-col">

      <div className="mb-[30px] flex flex-wrap items-center gap-[10px]">
        <div className="inline-flex items-center gap-[7px] bg-brand-subtle text-brand-text font-extrabold rounded-pill px-[14px] py-[6px]" style={{ fontSize: 13 }}>
          ✨ Шаг 1 · Знакомство
        </div>
        <div className="inline-flex items-center gap-[7px] bg-[#FFF7ED] text-[#C2410C] font-extrabold rounded-pill px-[14px] py-[6px]" style={{ fontSize: 13 }}>
          Тест проходят один раз
        </div>
      </div>

      <div className="mb-[30px]">
        <h1 className="font-black text-primary tracking-[-0.01em] mb-2" style={{ fontSize: 38 }}>
          Что ты хочешь узнать?
        </h1>
        <p className="text-secondary font-semibold" style={{ fontSize: 17 }}>
          Выбери то, что тебе сейчас важнее всего
        </p>
      </div>

      {isCheckingCurrent ? (
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

      {!isCheckingCurrent && (
        <div className="flex flex-wrap items-center gap-[18px] bg-surface border-[1.5px] border-strong rounded-[22px] px-6 py-5 mt-[18px]">
          <div
            className="w-[74px] h-[92px] flex-none rounded-2xl bg-brand-subtle flex items-end justify-center overflow-hidden"
            aria-hidden="true"
          >
            <Mascot kind="psy" className="w-[66px] h-[86px]" />
          </div>
          <div className="flex-1 min-w-[200px]">
            <p className="font-extrabold text-primary mb-[3px]" style={{ fontSize: 17 }}>Тест занимает около 10 минут</p>
            <p className="text-secondary font-semibold text-pretty" style={{ fontSize: 15 }}>
              Отвечай честно — правильных ответов нет. Прогресс сохраняется, можно продолжить позже.
            </p>
          </div>
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
  );
}
