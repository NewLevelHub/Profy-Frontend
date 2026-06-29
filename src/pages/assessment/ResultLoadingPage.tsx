import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useAssessmentStore } from '@/shared/store/assessment';
import { useResultStore } from '@/shared/store/result';
import { resultApi } from '@/shared/api/result';
import { Spinner } from '@/shared/ui/Spinner';
import { Button } from '@/shared/ui/Button';

export default function ResultLoadingPage() {
  const navigate = useNavigate();
  const assessmentId = useAssessmentStore(s => s.assessmentId);
  const setReport = useResultStore(s => s.setReport);

  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (!assessmentId) {
      navigate('/home', { replace: true });
      return;
    }

    let cancelled = false;

    async function generate() {
      setError(null);
      try {
        const result = await resultApi.generate(assessmentId!);
        if (!cancelled) {
          setReport(result);
          navigate('/results', { replace: true });
        }
      } catch {
        if (!cancelled) {
          setError('Не удалось сформировать результат. Попробуй ещё раз.');
        }
      }
    }

    generate();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [retryCount]);

  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-page px-6 gap-6 text-center">
      {error === null ? (
        <>
          <Spinner size="lg" />
          <div>
            <h2 className="text-h1 font-extrabold text-primary mb-2">
              Анализируем результаты
            </h2>
            <p className="text-body text-secondary">Это займёт несколько секунд...</p>
          </div>
        </>
      ) : (
        <div>
          <p className="text-body text-danger mb-4">{error}</p>
          <Button onClick={() => setRetryCount(c => c + 1)}>Попробовать снова</Button>
        </div>
      )}
    </div>
  );
}
