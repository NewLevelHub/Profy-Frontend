import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Sparkles } from 'lucide-react';
import { ROUTES } from '@/app/routes';
import { Button } from '@/shared/ui/Button';
import { PageContainer } from '@/shared/ui/PageContainer';
import { PageHeader } from '@/shared/ui/PageHeader';
import { Mascot } from '@/shared/ui/Mascot';
import { useSubjectReadiness } from './hooks/useSubjectReadiness';
import { SubjectQuestionCard } from './components/SubjectQuestionCard';
import { SubjectReadinessSkeleton } from './components/SubjectReadinessSkeleton';

// Mandatory pre-/results step reached automatically right after confirming a
// direction (see useAkinatorAssessment.handleFeedback) — the result itself is
// shown on /results (folded into ResultAxisComparison), not here, so this page's only
// job is collecting answers and then getting out of the way: it redirects to
// /results the moment a result exists (freshly submitted or already done)
// and equally invisibly if the quiz turns out to be unavailable for this
// direction (no subjects_required content yet, or any other gating error).
export default function SubjectReadinessPage() {
  const navigate = useNavigate();
  const {
    isLoading, hasResult, questions, answers, selectAnswer,
    allAnswered, submit, isSubmitting, errorKind,
  } = useSubjectReadiness();

  useEffect(() => {
    if (errorKind || hasResult) navigate(ROUTES.results, { replace: true });
  }, [errorKind, hasResult, navigate]);

  // Full-screen shell (own bg/padding) rather than AppLayout's <main> — this
  // route sits outside AppLayout on purpose (see router.tsx) so there's no
  // sidebar/header nav link to click away through mid-quiz.
  return (
    <div className="min-h-screen bg-page overflow-y-auto">
      <div className="px-4 sm:px-6 lg:px-8 py-6 lg:py-10">
        {isLoading || errorKind || hasResult ? (
          <SubjectReadinessSkeleton />
        ) : (
          <PageContainer className="flex flex-col gap-6">
            <PageHeader
              title="Квиз по предметам"
              subtitle="Ответь на 8 коротких вопросов — это поможет точнее понять твою готовность"
            />
            <div className="flex flex-wrap items-center gap-4 bg-surface border-2 border-strong rounded-[var(--radius-lg)] px-5 py-4">
              <div
                className="w-[60px] h-[74px] flex-none rounded-2xl bg-brand-subtle flex items-end justify-center overflow-hidden"
                aria-hidden="true"
              >
                <Mascot kind="science" className="w-[54px] h-[70px]" />
              </div>
              <p className="flex-1 min-w-[180px] text-secondary font-semibold text-[15px] text-pretty">
                Тут нет правильных ответов — отвечай так, как есть на самом деле.
              </p>
              <span className="font-extrabold text-brand-text whitespace-nowrap" style={{ fontSize: 15 }}>
                {Object.keys(answers).length} из {questions.length}
              </span>
            </div>
            <div className="flex flex-col gap-4">
              {questions.map(question => (
                <SubjectQuestionCard
                  key={question.id}
                  question={question}
                  selectedIndex={answers[question.id]}
                  onSelect={selectAnswer}
                />
              ))}
            </div>
            <Button
              size="lg"
              className="gap-2 self-start"
              disabled={!allAnswered}
              isLoading={isSubmitting}
              onClick={submit}
            >
              <Sparkles className="w-5 h-5" />
              Завершить квиз
            </Button>
          </PageContainer>
        )}
      </div>
    </div>
  );
}
