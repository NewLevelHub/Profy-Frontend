import { useNavigate } from 'react-router';
import { Spinner } from '@/shared/ui/Spinner';
import { AssessmentRail } from '@/shared/ui/navigation/AssessmentRail';
import { useMac } from './hooks/useMac';
import { MacStimulusStep } from './components/MacStimulusStep';
import { MacCompletionScreen } from './components/MacCompletionScreen';

/**
 * Блок МАК (PRO-316) — v1 demo: одно активное упражнение (E1), `blind`-режим.
 * Вступительного экрана/раскладки нет — сразу вопрос + «Вытянуть карту».
 * Использует ТОТ ЖЕ `AssessmentRail`, что и AssessmentPage/MotivationHarterFlow
 * и психоэмоциональный блок (2026-09-11 rework) — прогресс/выход идентичны
 * остальной батарее вместо отдельной "плавающей карточки" без выхода.
 */
export default function MacPage() {
  const navigate = useNavigate();
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

  if (step === 'loading' || !exercise) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-page">
        <Spinner size="lg" />
      </div>
    );
  }

  if (step === 'done') {
    return <MacCompletionScreen onContinue={handleContinue} />;
  }

  const progress = ((index + 1) / Math.max(total, 1)) * 100;

  return (
    <div className="flex flex-col min-h-screen bg-page">
      <AssessmentRail
        title={`Карта ${index + 1} из ${total}`}
        sectionLabel="МАК-карты"
        progressAriaLabel="Прогресс блока МАК"
        progress={progress}
        // Завершённые упражнения уже сохранены на бэке (get-or-create
        // сессии) — терять при выходе можно только текст текущего,
        // несданного упражнения, поэтому отдельный save-and-exit флоу
        // здесь не нужен, как и в психоэмоциональном блоке.
        onExit={() => navigate('/results')}
      />

      <div className="flex-1 flex flex-col w-full max-w-2xl mx-auto px-4 py-8 sm:px-6">
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
    </div>
  );
}
