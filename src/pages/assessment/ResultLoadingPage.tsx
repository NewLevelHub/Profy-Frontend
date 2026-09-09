import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router';
import { useAssessmentStore } from '@/shared/store/assessment';
import { useResultStore } from '@/shared/store/result';
import { useLocaleStore } from '@/shared/store/locale';
import { resultApi } from '@/shared/api/result';
import { playBlockFinishAudio } from '@/shared/lib/sounds';
import { Button } from '@/shared/ui/Button';
import { ResultLoadingView } from './components/ResultLoadingView';

export default function ResultLoadingPage() {
  const { t } = useTranslation('assessment');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isRetake = searchParams.get('retake') === '1';

  const assessmentId = useAssessmentStore(s => s.assessmentId);
  const hasCompletedAssessment = useAssessmentStore(s => s.hasCompletedAssessment);
  const completeAssessment = useAssessmentStore(s => s.completeAssessment);
  const setReport = useResultStore(s => s.setReport);

  // Diagnostic just finished — always route through the "here's what fits
  // you" interstitial (step 5 of the onboarding→assessment journey) before
  // the results report itself; its own goal-aware suggestion logic decides
  // what to show (careers vs. self-understanding), so every goal lands here.
  const postResultPath = '/assessment/goal-check';

  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (!assessmentId) {
      navigate('/results', { replace: true });
      return;
    }

    // Result already generated — just fetch and forward (skip on retake: must regenerate)
    if (!isRetake && hasCompletedAssessment) {
      resultApi.get(assessmentId).then(result => {
        // Tag with the locale the backend just served it in (the api
        // interceptor sends this same value as Accept-Language). Without a
        // real tag, useResults treats the report as matching *any* locale and
        // never re-fetches on a language switch.
        setReport(result, useLocaleStore.getState().locale);
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
          setReport(result, useLocaleStore.getState().locale);
          completeAssessment();
          // Full assessment completion should use the shipped finale audio
          // file, same as other final-completion moments.
          playBlockFinishAudio(1, 1);
          navigate(postResultPath, { replace: true });
        }
      } catch {
        if (!cancelled) {
          // Result may already exist (e.g. duplicate call) — try fetching it
          try {
            const existing = await resultApi.get(assessmentId!);
            if (!cancelled) {
              setReport(existing, useLocaleStore.getState().locale);
              completeAssessment();
              playBlockFinishAudio(1, 1);
              navigate(postResultPath, { replace: true });
            }
          } catch {
            if (!cancelled) {
              setError(t('resultLoading.error'));
            }
          }
        }
      }
    }

    generate();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [retryCount]);

  if (error !== null) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center bg-page px-6">
        <div className="flex flex-col items-center gap-4 text-center">
          <span className="text-5xl select-none" aria-hidden="true">⚠️</span>
          <p className="text-body text-danger">{error}</p>
          <Button onClick={() => setRetryCount(c => c + 1)}>{t('error.retry')}</Button>
        </div>
      </div>
    );
  }

  return <ResultLoadingView className="min-h-screen" />;
}
