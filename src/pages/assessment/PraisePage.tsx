import { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { Button } from '@/shared/ui/Button';
import { playBlockFinishAudio } from '@/shared/lib/sounds';
import { ConfettiBlast } from './components/ConfettiBlast';

interface PraiseState {
  title: string;
  subtitle: string;
  nextPath: string;
  completedCount?: number;
  totalBlocks?: number;
  nextBlockName?: string;
  nextBlockEmoji?: string;
}

const AUTO_ADVANCE_MS = 4000;

export default function PraisePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state ?? {}) as PraiseState;

  const {
    title = 'Молодец!',
    subtitle = '',
    nextPath = '/home',
    completedCount,
    totalBlocks,
    nextBlockName,
    nextBlockEmoji,
  } = state;

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    timerRef.current = setTimeout(() => {
      navigate(nextPath, { replace: true });
    }, AUTO_ADVANCE_MS);
    return () => {
      if (timerRef.current !== null) clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleContinue() {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    navigate(nextPath, { replace: true });
  }

  const showProgress =
    completedCount !== undefined &&
    totalBlocks !== undefined &&
    completedCount < totalBlocks;

  const isLast = completedCount !== undefined && totalBlocks !== undefined && completedCount >= totalBlocks;
  const celebratedRef = useRef(false);

  useEffect(() => {
    if (celebratedRef.current) return;
    celebratedRef.current = true;
    playBlockFinishAudio(completedCount, totalBlocks);
  }, [completedCount, totalBlocks]);

  // Будущая интеграция: константа XP за пройденный блок
  // const xpByBlock = 120;

  return (
    <div className="flex flex-col min-h-screen bg-page relative overflow-hidden">
      <ConfettiBlast />

      <div className="flex-1 flex items-center justify-center pb-[130px] lg:pb-8">
        <div
          className="flex flex-col items-center text-center px-8 max-w-[480px] lg:max-w-2xl w-full"
          style={{ animation: 'fade-in-up 0.5s ease both' }}
        >
          <span
            className="inline-block mb-[6px]"
            role="img"
            aria-hidden
            style={{ fontSize: 80, animation: 'pf-pop 0.7s ease both' }}
          >
            {isLast ? '🏆' : '⭐'}
          </span>

          <h1 className="font-black text-primary mb-2 tracking-[-0.01em]" style={{ fontSize: 44 }}>{title}</h1>
          <p className="font-semibold mb-[14px]" style={{ fontSize: 18, color: '#6B7280' }}>{subtitle}</p>

          {/* Будущая интеграция: бейдж с начисленными XP после каждого блока */}
          {/* {!isLast && (
            <div
              className="inline-flex items-center gap-2 font-extrabold rounded-pill px-[18px] py-[9px] mb-[30px]"
              style={{
                background: '#FFF7ED',
                border: '1px solid #FED7AA',
                color: '#C2410C',
                fontSize: 16,
                animation: 'pf-pop 0.7s 0.15s ease both',
              }}
            >
              ⚡ +{xpByBlock} XP заработано
            </div>
          )} */}

          {showProgress && (
            <div
              className="w-full bg-surface rounded-[20px] p-[22px_26px]"
              style={{ border: '1px solid #EDE9FE', boxShadow: '0 6px 18px rgba(30,27,75,.06)' }}
            >
              <div className="flex items-center justify-between mb-[10px]">
                <span className="font-extrabold" style={{ fontSize: 15, color: '#4B5563' }}>Прогресс диагностики</span>
                <span className="font-black" style={{ fontSize: 15, color: '#7C3AED' }}>{completedCount} / {totalBlocks}</span>
              </div>
              <div className="h-[14px] rounded-pill overflow-hidden" style={{ background: '#EDE9FE' }}>
                <div
                  className="h-full rounded-pill"
                  style={{
                    width: `${(completedCount! / totalBlocks!) * 100}%`,
                    background: 'linear-gradient(90deg,#22C55E,#16A34A)',
                  }}
                />
              </div>
              {nextBlockName && (
                <div className="flex items-center gap-2 mt-[14px] font-bold" style={{ fontSize: 14, color: '#7C3AED' }}>
                  <span>{nextBlockEmoji ?? '🎯'}</span>
                  <span>Следующий блок: «{nextBlockName}»</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="fixed left-0 right-0 bottom-0 px-6 pb-[22px] pt-[18px] flex justify-center lg:static lg:px-8 lg:pb-8">
        <Button
          onClick={handleContinue}
          size="lg"
          className="w-full max-w-[560px] lg:max-w-md rounded-pill"
          style={{
            height: 60,
            fontSize: 18,
            fontWeight: 800,
            background: 'linear-gradient(135deg,#7C3AED,#6D28D9)',
            boxShadow: '0 10px 22px rgba(124,58,237,.32)',
            animation: 'pf-pulse 2.4s infinite',
          }}
        >
          Дальше →
        </Button>
      </div>
    </div>
  );
}
