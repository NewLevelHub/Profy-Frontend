import { useNavigate, useParams } from 'react-router';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { useDirectionInquiry } from './hooks/useDirectionInquiry';
import { InquiryQuestion } from './components/InquiryQuestion';
import { InquirySkeleton } from './components/InquirySkeleton';
import { InquiryVerdict } from './components/InquiryVerdict';

export default function DirectionInquiryPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const {
    questions, isLoading, error,
    answers, setAnswer, allAnswered,
    submit, verdict, isSubmitting, submitError,
  } = useDirectionInquiry(slug ?? '');

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <button
        className="flex items-center gap-1.5 text-brand font-semibold text-label hover:opacity-70 transition-opacity mb-6"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="w-4 h-4" />
        Назад
      </button>

      <h1 className="text-h1 font-extrabold text-primary mb-2">
        Подходит ли тебе это направление?
      </h1>
      {questions && !verdict && (
        <p className="text-body text-secondary mb-8">
          Ответь честно — и узнаешь, насколько «{questions.direction_name}» про тебя.
        </p>
      )}

      {isLoading && <InquirySkeleton />}
      {error && <p className="text-body text-danger">{error}</p>}

      {verdict ? (
        <div className="flex flex-col gap-8">
          <InquiryVerdict verdict={verdict} />
          <Button variant="ghost" size="lg" className="w-full" onClick={() => navigate('/results')}>
            Назад к результатам
          </Button>
        </div>
      ) : questions ? (
        <div className="flex flex-col gap-8">
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

          <Button
            variant="primary"
            size="lg"
            className="w-full"
            disabled={!allAnswered}
            isLoading={isSubmitting}
            onClick={submit}
          >
            {isSubmitting ? 'Анализирую…' : 'Узнать результат'}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
