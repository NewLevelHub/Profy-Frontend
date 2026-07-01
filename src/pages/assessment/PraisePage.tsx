import { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { Button } from '@/shared/ui/Button';
import { ConfettiBlast } from './components/ConfettiBlast';

interface PraiseState {
  title: string;
  subtitle: string;
  nextPath: string;
  completedCount?: number;
  totalBlocks?: number;
}

const AUTO_ADVANCE_MS = 2500;

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

  return (
    <div className="flex flex-col min-h-screen bg-page relative overflow-hidden">
      <ConfettiBlast />

      <div className="flex-1 flex items-center justify-center pb-[130px]">
        <div
          className="flex flex-col items-center text-center px-8 max-w-[440px] w-full"
          style={{ animation: 'fade-in-up 0.5s ease both' }}
        >
          <span
            className="text-[80px] mb-[6px] inline-block"
            role="img"
            aria-hidden
            style={{ animation: 'pf-pop 0.7s ease both' }}
          >⭐</span>

          <h1 className="font-black text-primary mb-2 tracking-[-0.01em]" style={{ fontSize: 44 }}>{title}</h1>
          <p className="text-secondary font-semibold mb-[14px]" style={{ fontSize: 18 }}>{subtitle}</p>

          <div
            className="inline-flex items-center gap-2 font-extrabold text-accent-text rounded-pill px-[18px] py-[9px] mb-[30px]"
            style={{ background: 'var(--accent-soft)', border: '1px solid #FED7AA', fontSize: 16, animation: 'pf-pop 0.7s 0.15s ease both' }}
          >
            ⚡ +{completedCount ? completedCount * 120 : 120} XP заработано
          </div>

          {showProgress && (
            <div className="w-full bg-surface rounded-[20px] p-[22px_26px] shadow-card border border-default">
              <div className="flex items-center justify-between mb-[10px]">
                <span className="font-extrabold text-secondary" style={{ fontSize: 15 }}>Прогресс диагностики</span>
                <span className="font-black text-brand" style={{ fontSize: 15 }}>{completedCount} / {totalBlocks}</span>
              </div>
              <div className="h-[14px] bg-brand-subtle rounded-pill overflow-hidden">
                <div
                  className="h-full rounded-pill"
                  style={{ width: `${(completedCount! / totalBlocks!) * 100}%`, background: 'linear-gradient(90deg,#22C55E,#16A34A)' }}
                />
              </div>
              {completedCount! < totalBlocks! && (
                <div className="flex items-center gap-2 mt-[14px] text-brand font-bold" style={{ fontSize: 14 }}>
                  <span>🎯</span>
                  <span>Продолжаем диагностику</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="fixed left-0 right-0 bottom-0 px-6 pb-[22px] pt-[18px] flex justify-center">
        <Button
          onClick={handleContinue}
          size="lg"
          className="w-full max-w-[560px] rounded-pill"
          style={{ height: 60, fontSize: 18, fontWeight: 800, boxShadow: '0 10px 22px rgba(124,58,237,.32)' }}
        >
          Дальше →
        </Button>
      </div>
    </div>
  );
}
