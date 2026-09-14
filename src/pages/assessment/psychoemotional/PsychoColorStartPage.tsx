import './psychoemotional.css';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { Spinner } from '@/shared/ui/Spinner';
import { AssessmentRail } from '@/shared/ui/navigation/AssessmentRail';
import { AssessmentIntro } from '../components/AssessmentIntro';
import { usePsychoColorStart } from './hooks/usePsychoColorStart';
import { ColorCircleStep } from './components/ColorCircleStep';

const INTRO_AUTO_ADVANCE_MS = 2000;

/**
 * Круг 1 психоэмоционального теста (PRO-3xx redesign) — единственный экран
 * этой страницы, идёт ПЕРЕД основной батареей тестов (после выбора цели,
 * перед `/assessment`). Круг 2 + check-in — на `/assessment/psychoemotional`,
 * в конце всего прохождения. `data-theme="light"` + `.pe-block` держат
 * светлую тему принудительно — колориметрия §4 приёмочный критерий, как и на
 * финальном экране.
 */
export default function PsychoColorStartPage() {
  const navigate = useNavigate();
  const [introSeen, setIntroSeen] = useState(false);
  const introTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { ready, submitting, handleCircle1 } = usePsychoColorStart();

  useEffect(() => {
    if (!ready) return;
    introTimerRef.current = setTimeout(() => setIntroSeen(true), INTRO_AUTO_ADVANCE_MS);
    return () => {
      if (introTimerRef.current !== null) clearTimeout(introTimerRef.current);
    };
  }, [ready]);

  function handleStartIntro() {
    if (introTimerRef.current !== null) {
      clearTimeout(introTimerRef.current);
      introTimerRef.current = null;
    }
    setIntroSeen(true);
  }

  return (
    <div className="pe-block flex flex-col min-h-screen" data-theme="light">
      <AssessmentRail
        title={introSeen ? 'Выбор цвета' : 'Психоэмоциональный срез'}
        sectionLabel="Психоэмоциональный срез"
        progressAriaLabel="Прогресс психоэмоционального блока"
        progress={introSeen ? 50 : 0}
        onExit={() => navigate('/results')}
      />

      <div className="flex-1 flex flex-col w-full max-w-2xl mx-auto">
        {!ready ? (
          <div className="flex-1 flex items-center justify-center">
            <Spinner size="lg" />
          </div>
        ) : !introSeen ? (
          <AssessmentIntro
            kicker="Психоэмоциональный тест"
            title="Выбери, что откликается"
            subtitle="Перед тестами — выбор цвета. Без правильных ответов, просто по ощущению"
            itemCountLabel="1 шаг"
            durationLabel="~30 сек"
            ctaLabel="Начать"
            onStart={handleStartIntro}
          />
        ) : submitting ? (
          <div className="flex-1 flex items-center justify-center">
            <Spinner size="lg" />
          </div>
        ) : (
          <div className="flex-1 flex flex-col justify-center px-4 py-8 sm:px-6">
            <ColorCircleStep
              instruction="Выбери цвет, который приятнее всего прямо сейчас"
              onComplete={handleCircle1}
            />
          </div>
        )}
      </div>
    </div>
  );
}
