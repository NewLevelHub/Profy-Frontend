import { useNavigate, useParams } from 'react-router';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { PageContainer } from '@/shared/ui/PageContainer';
import { PageHeader } from '@/shared/ui/PageHeader';
import { useBackTo } from '@/shared/lib/useBackTo';
import { useDirectionInquiry } from './hooks/useDirectionInquiry';
import { InquiryQuestion } from './components/InquiryQuestion';
import { InquirySkeleton } from './components/InquirySkeleton';
import { InquiryVerdict } from './components/InquiryVerdict';

export default function DirectionInquiryPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const goBack = useBackTo(`/results/directions/${encodeURIComponent(slug ?? '')}`);
  const {
    questions, isLoading, error,
    answers, setAnswer, allAnswered,
    submit, verdict, isSubmitting, submitError,
  } = useDirectionInquiry(slug ?? '');

  return (
    <PageContainer className="space-y-6">
      <button
        className="flex items-center gap-1.5 text-brand font-semibold text-label hover:opacity-70 transition-opacity"
        onClick={goBack}
      >
        <ArrowLeft className="w-4 h-4" />
        Назад
      </button>

      <PageHeader
        title="Подходит ли тебе это направление?"
        subtitle={
          questions && !verdict
            ? `Ответь честно — и узнаешь, насколько «${questions.direction_name}» про тебя.`
            : undefined
        }
      />

      {isLoading && <InquirySkeleton />}
      {error && <p className="text-body text-danger">{error}</p>}

      {verdict ? (
        <div className="lg:grid lg:grid-cols-[1fr_300px] lg:gap-8 lg:items-start">
          <InquiryVerdict verdict={verdict} />

          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 lg:sticky lg:top-6 mt-6 lg:mt-0">
            <Button
              variant="primary"
              size="lg"
              className="w-full gap-2"
              onClick={() =>
                navigate(`/results/directions/${encodeURIComponent(slug ?? '')}/roadmap`, {
                  state: { generate: true },
                })
              }
            >
              <Sparkles className="w-5 h-5" />
              Построить мой план
            </Button>
            <Button variant="ghost" size="lg" className="w-full" onClick={() => navigate('/results')}>
              Назад к результатам
            </Button>
          </div>
        </div>
      ) : questions ? (
        <div className="max-w-3xl flex flex-col gap-8">
          {questions.questions.map((q, i) => (
            <InquiryQuestion
              key={i}
              index={i}
              text={q.text}
              scale={questions.scale}
              value={answers[i] ?? null}
              onSelect={setAnswer}
            />
          ))}

          {submitError && <p className="text-body text-danger">{submitError}</p>}

          <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
            <Button
              variant="primary"
              size="lg"
              className="sm:flex-1 lg:max-w-xs"
              disabled={!allAnswered}
              isLoading={isSubmitting}
              onClick={submit}
            >
              {isSubmitting ? 'Анализирую…' : 'Узнать результат'}
            </Button>
          </div>
        </div>
      ) : null}
    </PageContainer>
  );
}
