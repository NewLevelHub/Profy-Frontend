import { useEffect } from 'react';
import { useToastStore } from '@/shared/store/toast';

const AUTO_DISMISS_MS = 3500;

export function Toaster() {
  const message = useToastStore((s) => s.message);
  const clear = useToastStore((s) => s.clear);

  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(clear, AUTO_DISMISS_MS);
    return () => clearTimeout(timer);
  }, [message, clear]);

  if (!message) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-toast-in pointer-events-none">
      <div className="bg-brand text-on-brand shadow-pop rounded-pill px-5 py-3 font-bold text-sm">
        {message}
      </div>
    </div>
  );
}
