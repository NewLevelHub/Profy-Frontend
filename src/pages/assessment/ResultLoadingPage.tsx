import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
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
  const [searchParams] = useSearchParams();
  const isRetake = searchParams.get('retake') === '1';

  const assessmentId = useAssessmentStore(s => s.assessmentId);
  const hasCompletedAssessment = useAssessmentStore(s => s.hasCompletedAssessment);
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

  useEffect(() => {
    if (!assessmentId) {
      navigate('/home', { replace: true });
      return;
    }

    // Result already generated — just fetch and forward (skip on retake: must regenerate)
    if (!isRetake && hasCompletedAssessment) {
      resultApi.get(assessmentId).then(result => {
        setReport(result);
        navigate('/results', { replace: true });
      }).catch(() => navigate('/results', { replace: true }));
      return;
    }

    let cancelled = false;

    async function generate() {
      setError(null);
      try {
        const result = await resultApi.generate(assessmentId!);
        if (!cancelled) {
          setReport(result);
          completeAssessment();
          navigate('/results', { replace: true });
        }
      } catch {
        if (!cancelled) {
          // Result may already exist (e.g. duplicate call) — try fetching it
          try {
            const existing = await resultApi.get(assessmentId!);
            if (!cancelled) {
              setReport(existing);
              completeAssessment();
              navigate('/results', { replace: true });
            }
          } catch {
            if (!cancelled) {
              setError('Не удалось сформировать результат. Попробуй ещё раз.');
            }
          }
        }
      }
    }

    generate();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [retryCount]);

  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-page px-6 gap-6 text-center">
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
  );
}
