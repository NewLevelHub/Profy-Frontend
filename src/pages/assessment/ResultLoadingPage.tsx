import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router';
import { useAssessmentStore } from '@/shared/store/assessment';
import { useResultStore } from '@/shared/store/result';
import { useLocaleStore } from '@/shared/store/locale';
import { apiErrorCode } from '@/shared/api/client';
import { isPendingReview, resultApi } from '@/shared/api/result';
import { playBlockFinishAudio } from '@/shared/lib/sounds';
import { JourneyCheckpoint } from '@/shared/ui';
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
  const clearReport = useResultStore(s => s.clearReport);

  // Diagnostic just finished — when a published report exists, route through
  // the "here's what fits you" interstitial before /results. When the report
  // is still pending psychologist review, skip the waiting-room /results
  // empty state (PRO-401) and send the student to profile instead.
  const postResultPath = '/assessment/goal-check';
  const pendingReviewPath = '/profile';

  const [error, setError] = useState<string | null>(null);
  // The backend refuses to build a report for an unfinished assessment
  // (409 `assessment_not_completed`). That is not a failure to retry — the
  // student is simply not done — so it gets its own screen with a way back
  // into the test instead of a "try again" button that can only 409 forever.
  const [notCompleted, setNotCompleted] = useState(false);
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
        // never re-fetches on a language switch. Clear leftover report from a
        // previous attempt first (PRO-337). Pending review → profile (PRO-401).
        if (isPendingReview(result)) {
          clearReport();
          navigate(pendingReviewPath, { replace: true });
        } else {
          setReport(result, useLocaleStore.getState().locale);
          navigate('/results', { replace: true });
        }
      }).catch(() => navigate('/results', { replace: true }));
      return;
    }

    let cancelled = false;

    async function generate() {
      setError(null);
      setNotCompleted(false);
      try {
        const result = await resultApi.generate(assessmentId!);
        if (!cancelled) {
          completeAssessment();
          // Full assessment completion should use the shipped finale audio
          // file, same as other final-completion moments.
          playBlockFinishAudio(1, 1);
          if (isPendingReview(result)) {
            // Nothing to suggest on goal-check without a report — and no
            // waiting-room on /results (PRO-401). Profile is the next useful step.
            clearReport();
            navigate(pendingReviewPath, { replace: true });
          } else {
            setReport(result, useLocaleStore.getState().locale);
            navigate(postResultPath, { replace: true });
          }
        }
      } catch (generateError) {
        const generateCode = apiErrorCode(generateError);
        if (!cancelled) {
          // Result may already exist (e.g. duplicate call) — try fetching it
          try {
            const existing = await resultApi.get(assessmentId!);
            if (!cancelled) {
              completeAssessment();
              playBlockFinishAudio(1, 1);
              if (isPendingReview(existing)) {
                clearReport();
                navigate(pendingReviewPath, { replace: true });
              } else {
                setReport(existing, useLocaleStore.getState().locale);
                navigate(postResultPath, { replace: true });
              }
            }
          } catch {
            if (!cancelled) {
              if (generateCode === 'assessment_not_completed') {
                setNotCompleted(true);
              } else {
                setError(t('resultLoading.error'));
              }
            }
          }
        }
      }
    }

    generate();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [retryCount]);

  if (notCompleted || error !== null) {
    return <JourneyCheckpoint kicker={t('goalCheck.kicker')}
      title={t(notCompleted ? 'resultLoading.notCompletedTitle' : 'common:errorBoundary.title')}
      body={notCompleted ? t('resultLoading.notCompleted') : error ?? undefined} illustration="rest"
      actions={<button type="button" className="rd-button" onClick={notCompleted ? () => navigate('/results', { replace: true }) : () => setRetryCount(c => c + 1)}>
        {t(notCompleted ? 'resultLoading.backToTest' : 'error.retry')}
      </button>} />;
  }
  return <ResultLoadingView fullPage />;
}
