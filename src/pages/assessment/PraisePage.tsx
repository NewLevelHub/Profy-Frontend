import { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { cn } from '@/shared/lib/cn';
import { Button } from '@/shared/ui/Button';
import { ProgressBar } from '@/shared/ui/ProgressBar';
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
    <div className="flex flex-col min-h-screen bg-page">
      <ConfettiBlast />

      <div className="flex-1 flex items-center justify-center">
        <div
          className={cn(
            'flex flex-col items-center text-center px-8 max-w-sm w-full',
          )}
          style={{ animation: 'scale-in 0.35s cubic-bezier(0.34,1.56,0.64,1) forwards' }}
        >
          <span className="text-6xl mb-6" role="img" aria-hidden>⭐</span>
          <h1 className="text-display font-extrabold text-primary mb-3">{title}</h1>
          <p className="text-body text-secondary mb-6">{subtitle}</p>

          {showProgress && (
            <div className="w-full bg-surface rounded-xl p-4 shadow-card border border-default flex items-center gap-3">
              <span className="text-muted flex-shrink-0" style={{ fontSize: 'var(--text-caption)' }}>
                Прогресс
              </span>
              <ProgressBar
                value={(completedCount! / totalBlocks!) * 100}
                variant="success"
                className="flex-1"
              />
              <span
                className="text-muted font-bold flex-shrink-0"
                style={{ fontSize: 'var(--text-caption)' }}
              >
                {completedCount}/{totalBlocks}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="px-6 pb-8">
        <Button
          onClick={handleContinue}
          size="lg"
          className="w-full rounded-pill shadow-button"
        >
          Дальше
        </Button>
      </div>
    </div>
  );
}
