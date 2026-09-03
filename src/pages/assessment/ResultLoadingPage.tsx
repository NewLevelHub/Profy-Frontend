import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router';
import { useAssessmentStore } from '@/shared/store/assessment';
import { useResultStore } from '@/shared/store/result';
import { resultApi } from '@/shared/api/result';
import { playBlockFinishAudio } from '@/shared/lib/sounds';
import { Button } from '@/shared/ui/Button';
import { Spine, type SpineNode } from '@/shared/ui/Spine';
import { Mascot } from '@/shared/ui/Mascot';

const MESSAGE_KEYS = ['resultLoading.msg1', 'resultLoading.msg2', 'resultLoading.msg3', 'resultLoading.msg4'];

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
  const [messageIndex, setMessageIndex] = useState(0);
  const [msgVisible, setMsgVisible] = useState(true);

  useEffect(() => {
    const id = setInterval(() => {
      setMsgVisible(false);
      const t = setTimeout(() => {
        setMessageIndex(i => (i + 1) % MESSAGE_KEYS.length);
        setMsgVisible(true);
      }, 250);
      return () => clearTimeout(t);
    }, 2000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!assessmentId) {
      navigate('/results', { replace: true });
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
              setReport(existing);
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

  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-page px-6">
      <div className="w-full max-w-lg mx-auto text-center flex flex-col gap-6">
      {error === null ? (
        <>
          <Mascot state="waiting" size={140} className="mx-auto" />
          <div
            className="transition-opacity duration-[250ms]"
            style={{ opacity: msgVisible ? 1 : 0 }}
          >
            <p className="text-subtitle font-semibold text-primary" style={{ minHeight: '2rem' }}>
              {t(MESSAGE_KEYS[messageIndex])}
            </p>
          </div>
          <Spine
            nodes={MESSAGE_KEYS.map((_, i): SpineNode => ({
              id: i,
              status: i < messageIndex ? 'done' : i === messageIndex ? 'current' : 'upcoming',
              goal: i === MESSAGE_KEYS.length - 1,
            }))}
            thickness={0.85}
            ariaLabel={t('resultLoading.stepAria', { current: messageIndex + 1, total: MESSAGE_KEYS.length })}
          />
          <p className="text-body text-secondary">{t('resultLoading.takesSeconds')}</p>
        </>
      ) : (
        <div className="flex flex-col items-center gap-4">
          <span className="text-5xl select-none" aria-hidden="true">⚠️</span>
          <p className="text-body text-danger">{error}</p>
          <Button onClick={() => setRetryCount(c => c + 1)}>{t('error.retry')}</Button>
        </div>
      )}
      </div>
    </div>
  );
}
