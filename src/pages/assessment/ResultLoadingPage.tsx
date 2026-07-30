import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { ROUTES } from '@/app/routes';
import { useAssessmentStore } from '@/shared/store/assessment';
import { useResultStore } from '@/shared/store/result';
import { resultApi } from '@/shared/api/result';
import { Button } from '@/shared/ui/Button';

const MESSAGES = [
  'Анализируем твои ответы...',
  'Находим подходящие направления...',
  'Составляем твой профиль...',
  'Почти готово...',
];

export default function ResultLoadingPage() {
  const navigate = useNavigate();

  const assessmentId = useAssessmentStore(s => s.assessmentId);
  const completeAssessment = useAssessmentStore(s => s.completeAssessment);
  const setReport = useResultStore(s => s.setReport);

  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [messageIndex, setMessageIndex] = useState(0);
  const [msgVisible, setMsgVisible] = useState(true);

  useEffect(() => {
    const id = setInterval(() => {
      setMsgVisible(false);
      const t = setTimeout(() => {
        setMessageIndex(i => (i + 1) % MESSAGES.length);
        setMsgVisible(true);
      }, 250);
      return () => clearTimeout(t);
    }, 2000);
    return () => clearInterval(id);
  }, []);

  // No generation step anymore — the akinator's own reveal + feedback
  // already produced the result, this just fetches and forwards to it.
  useEffect(() => {
    if (!assessmentId) {
      navigate(ROUTES.home, { replace: true });
      return;
    }

    let cancelled = false;

    async function fetchResult() {
      setError(null);
      try {
        const result = await resultApi.get(assessmentId!);
        if (!cancelled) {
          setReport(result);
          completeAssessment();
          navigate(ROUTES.results, { replace: true });
        }
      } catch {
        if (!cancelled) {
          setError('Не удалось загрузить результат. Попробуй ещё раз.');
        }
      }
    }

    fetchResult();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [retryCount]);

  return (
    <div className="flex flex-col h-full items-center justify-center px-6">
      <div className="w-full max-w-lg mx-auto text-center flex flex-col gap-6">
      {error === null ? (
        <>
          <span className="text-5xl select-none" aria-hidden="true">✨</span>
          <div
            className="transition-opacity duration-[250ms]"
            style={{ opacity: msgVisible ? 1 : 0 }}
          >
            <p className="text-subtitle font-semibold text-primary" style={{ minHeight: '2rem' }}>
              {MESSAGES[messageIndex]}
            </p>
          </div>
          <p className="text-body text-secondary">Это займёт несколько секунд...</p>
        </>
      ) : (
        <div className="flex flex-col items-center gap-4">
          <span className="text-5xl select-none" aria-hidden="true">⚠️</span>
          <p className="text-body text-danger">{error}</p>
          <Button onClick={() => setRetryCount(c => c + 1)}>Попробовать снова</Button>
        </div>
      )}
      </div>
    </div>
  );
}
