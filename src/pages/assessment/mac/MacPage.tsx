import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { Spinner } from '@/shared/ui/Spinner';
import { AssessmentRail } from '@/shared/ui/navigation/AssessmentRail';
import { AssessmentIntro } from '../components/AssessmentIntro';
import { useMac } from './hooks/useMac';
import { MacStimulusStep } from './components/MacStimulusStep';
import { MacCompletionScreen } from './components/MacCompletionScreen';

const INTRO_AUTO_ADVANCE_MS = 2000;

/**
 * Блок МАК (PRO-316) — v1 demo: одно активное упражнение (E1), `blind`-режим.
 * Использует ТОТ ЖЕ `AssessmentRail`, что и AssessmentPage/MotivationHarterFlow
 * и психоэмоциональный блок (2026-09-11 rework) — прогресс/выход идентичны
 * остальной батарее вместо отдельной "плавающей карточки" без выхода.
 *
 * Вступительный экран — тот же `AssessmentIntro` (кикер/тайтл/мета/CTA + 2с
 * авто-переход), что стоит перед основной батареей и перед мотивацией —
 * показывается один раз, как только сессия/упражнение загружены (раньше
 * блок стартовал сразу с "Вытянуть карту" без вступления).
 */
export default function MacPage() {
  const navigate = useNavigate();
  const [introSeen, setIntroSeen] = useState(false);
  const introTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const {
    step,
    exercise,
    index,
    total,
    card,
    answers,
    submitting,
    canSubmit,
    handleDraw,
    handleAnswerChange,
    handleSubmit,
    handleContinue,
  } = useMac();

  const ready = step !== 'loading' && Boolean(exercise);

  useEffect(() => {
    if (!ready || introSeen) return;
    introTimerRef.current = setTimeout(() => setIntroSeen(true), INTRO_AUTO_ADVANCE_MS);
    return () => {
      if (introTimerRef.current !== null) clearTimeout(introTimerRef.current);
    };
  }, [ready, introSeen]);

  function handleStartIntro() {
    if (introTimerRef.current !== null) {
      clearTimeout(introTimerRef.current);
      introTimerRef.current = null;
    }
    setIntroSeen(true);
  }

  if (!ready || !exercise) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-page">
        <Spinner size="lg" />
      </div>
    );
  }

  if (step === 'done') {
    return <MacCompletionScreen onContinue={handleContinue} />;
  }

  const progress = introSeen ? ((index + 1) / Math.max(total, 1)) * 100 : 0;

  return (
    <div className="flex flex-col min-h-screen bg-page">
      <AssessmentRail
        title={introSeen ? `Карта ${index + 1} из ${total}` : 'МАК-карты'}
        sectionLabel="МАК-карты"
        progressAriaLabel="Прогресс блока МАК"
        progress={progress}
        // Завершённые упражнения уже сохранены на бэке (get-or-create
        // сессии) — терять при выходе можно только текст текущего,
        // несданного упражнения, поэтому отдельный save-and-exit флоу
        // здесь не нужен, как и в психоэмоциональном блоке.
        onExit={() => navigate('/results')}
      />

      <div className="flex-1 flex flex-col w-full max-w-2xl mx-auto">
        {!introSeen ? (
          <AssessmentIntro
            kicker="МАК-карты"
            title="Метафорические карты"
            subtitle="Вытяни карту и ответь своими словами на вопросы к ней"
            itemCountLabel={`${total} ${total === 1 ? 'упражнение' : 'упражнения'}`}
            durationLabel="~3 мин"
            ctaLabel="Начать"
            onStart={handleStartIntro}
          />
        ) : (
          <div className="flex-1 flex flex-col justify-center px-4 py-8 sm:px-6">
            <MacStimulusStep
              exercise={exercise}
              drawing={step === 'drawing'}
              card={card}
              answers={answers}
              canSubmit={canSubmit}
              submitting={submitting}
              onDraw={handleDraw}
              onAnswerChange={handleAnswerChange}
              onSubmit={handleSubmit}
            />
          </div>
        )}
      </div>
    </div>
  );
}
