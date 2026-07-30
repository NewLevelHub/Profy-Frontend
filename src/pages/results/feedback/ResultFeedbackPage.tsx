import { BackButton } from '@/shared/ui/BackButton';
import { Button } from '@/shared/ui/Button';
import { Mascot } from '@/shared/ui/Mascot';
import { PageContainer } from '@/shared/ui/PageContainer';
import { getDirectionMascot } from '@/shared/config/directionMascot';
import { useResultFeedback } from './hooks/useResultFeedback';
import { OverallRatingCard } from './components/OverallRatingCard';
import { AspectsCard } from './components/AspectsCard';
import { FitAndCommentCard } from './components/FitAndCommentCard';
import { FeedbackSentCard } from './components/FeedbackSentCard';

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export default function ResultFeedbackPage() {
  const {
    report, editing, sent,
    overall, setOverall, overallFace, overallLabel,
    aspects, aspectScores, setAspectScore,
    fit, setFit, comment, setComment,
    canSend, isPending, onSend, onEdit, toResult, toPlan,
  } = useResultFeedback();

  if (!report) return null;

  const testDate = report.created_at;

  return (
    <PageContainer size="content" className="flex flex-col gap-6 pb-10">
      {sent ? (
        <FeedbackSentCard onEdit={onEdit} onPlan={toPlan} />
      ) : (
        <>
          <div className="flex items-start sm:items-center gap-4 flex-col sm:flex-row">
            <BackButton onClick={toResult} label="К результату" />
            <div>
              <h1 className="font-black text-primary tracking-[-0.02em] text-[26px] sm:text-[32px] leading-tight">
                Как тебе результат?
              </h1>
              <p className="text-secondary font-semibold text-[15px] sm:text-base mt-1.5">
                Направление: {report.direction_name}
                {testDate && ` · тест от ${formatDate(testDate)}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 sm:gap-5 bg-brand-subtle border-2 border-default rounded-[22px] p-5 sm:p-6">
            <div
              className="w-[76px] h-[96px] sm:w-[96px] sm:h-[120px] flex-none rounded-[18px] bg-surface flex items-end justify-center overflow-hidden"
              aria-hidden="true"
            >
              <Mascot kind={getDirectionMascot(report.direction_slug)} className="w-[68px] h-[86px] sm:w-[88px] sm:h-[110px]" />
            </div>
            <div className="min-w-0">
              <p className="font-extrabold text-primary text-[18px] sm:text-[20px] m-0 text-pretty">
                Твой отзыв помогает нам подбирать направления точнее
              </p>
              <p className="text-secondary font-semibold text-[14px] sm:text-[15px] mt-1.5 m-0 text-pretty">
                Оцени, насколько результат похож на тебя, и что стоит улучшить. Займёт минуту.
              </p>
            </div>
          </div>

          {editing && (
            <>
              <OverallRatingCard faces={overallFace} value={overall} label={overallLabel} onChange={setOverall} />
              <AspectsCard aspects={aspects} scores={aspectScores} onChange={setAspectScore} />
              <FitAndCommentCard fit={fit} onFitChange={setFit} comment={comment} onCommentChange={setComment} />

              <div className="flex items-center gap-4 flex-wrap">
                <Button size="lg" disabled={!canSend} isLoading={isPending} onClick={onSend}>
                  Отправить отзыв
                </Button>
                <Button variant="ghost" size="lg" onClick={toResult}>
                  Пропустить
                </Button>
              </div>
            </>
          )}
        </>
      )}
    </PageContainer>
  );
}
