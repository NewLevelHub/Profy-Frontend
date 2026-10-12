import { useEffect, useState, type KeyboardEvent } from 'react';
import { ArrowRight, ClipboardCheck, FileText, ShieldCheck } from 'lucide-react';
import { useNavigate, useParams, useSearchParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import { cn } from '@/shared/lib/cn';
import { ASSESSMENT_GOAL_LABELS } from '@/shared/lib/assessmentLabels';
import { AdminError, AdminLoading } from '@/shared/ui/admin/AdminStates';
import { BackLink } from '@/shared/ui/BackLink';
import { Button } from '@/shared/ui/Button';
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog';
import { PageContainer } from '@/shared/ui/PageContainer';
import { PageHeader } from '@/shared/ui/PageHeader';
import { Mono, Text, typeClass } from '@/shared/ui/typography';
import { LedgerRows } from './components/LedgerRows';
import { dateTimeLabel, gradeShort, studentName } from './components/cabinetFormat';
import { useStudentDetail } from './hooks/useCabinetQueries';
import { useReportReview } from './hooks/useReportReview';
import { ReportSectionsBlock } from './report/components/ReportSectionsBlock';
import { usePsychologistReport } from './report/hooks/usePsychologistReport';
import { PsychologistStudentReportEditor } from './review/PsychologistStudentReportEditor';

type ReportTab = 'tests' | 'review';

/** How long the "опубликовано" toast stays before returning to the queue. */
const PUBLISHED_TOAST_MS = 2400;

function TabButton({
  tab,
  label,
  note,
  noteAccent,
  active,
  onClick,
  onKeyDown,
}: {
  tab: ReportTab;
  label: string;
  note: string;
  noteAccent?: boolean;
  active: boolean;
  onClick: () => void;
  onKeyDown: (event: KeyboardEvent<HTMLButtonElement>) => void;
}) {
  return (
    <button
      type="button"
      role="tab"
      id={`report-tab-${tab}`}
      aria-controls={`report-panel-${tab}`}
      aria-selected={active}
      tabIndex={active ? 0 : -1}
      onClick={onClick}
      onKeyDown={onKeyDown}
      className="rd-psych-report-tab"
    >
      <span className="rd-psych-report-tab-icon" aria-hidden="true">
        {tab === 'tests' ? <ClipboardCheck size={20} /> : <FileText size={20} />}
      </span>
      <span className="rd-psych-report-tab-copy">
        <Text as="span" variant="body-lg" className={cn('font-semibold', active ? 'text-heading' : 'text-muted')}>
          {label}
        </Text>
        <Text as="span" variant="caption" className={noteAccent ? 'text-[color:var(--dawn-deep)]' : 'text-muted'}>
          {note}
        </Text>
      </span>
    </button>
  );
}

export default function PsychologistReportPage() {
  const { t } = useTranslation(['psychologist', 'admin']);
  const navigate = useNavigate();
  const { studentId = '', assessmentId = '' } = useParams<{ studentId: string; assessmentId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const tab: ReportTab = searchParams.get('tab') === 'review' ? 'review' : 'tests';

  const student = useStudentDetail(studentId);
  const tests = usePsychologistReport(studentId, assessmentId);
  const review = useReportReview(studentId, assessmentId);

  const [openSections, setOpenSections] = useState<Set<string>>(() => new Set());
  const [publishOpen, setPublishOpen] = useState(false);
  const [publishedToast, setPublishedToast] = useState(false);

  useEffect(() => {
    if (!publishedToast) return;
    const timer = window.setTimeout(() => navigate('/psychologist/reviews?tab=mine'), PUBLISHED_TOAST_MS);
    return () => window.clearTimeout(timer);
  }, [publishedToast, navigate]);

  function switchTab(next: ReportTab) {
    setSearchParams(next === 'review' ? { tab: 'review' } : {}, { replace: true });
  }

  function handleTabKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const next = event.key === 'Home' ? 'tests' : event.key === 'End' ? 'review' : tab === 'tests' ? 'review' : 'tests';
    switchTab(next);
    document.getElementById(`report-tab-${next}`)?.focus();
  }

  function toggleSection(id: string) {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function requestPublish() {
    // Validate first: an empty required field should be fixed in place,
    // not discovered after confirming the dialog.
    if (review.validate()) setPublishOpen(true);
    else switchTab('review');
  }

  async function confirmPublish() {
    const ok = await review.publishReport();
    setPublishOpen(false);
    if (ok) setPublishedToast(true);
  }

  const profile = student.data?.profile ?? null;
  const name = student.data ? studentName(profile?.name, student.data.email) : '';
  const assessment = student.data?.assessments.find((a) => a.id === assessmentId);
  const detail = review.detail;
  const pending = detail?.review_status === 'pending_review';
  const editedCount = review.editedKeys.size;
  const historyReady = !review.editsLoading && !review.editsError;

  const metaLine = [
    profile?.grade ? gradeShort(t, profile.grade) : null,
    assessment ? t(ASSESSMENT_GOAL_LABELS[assessment.goal] ?? assessment.goal) : null,
  ]
    .filter(Boolean)
    .join(' · ');

  const saveLabel = review.saving
    ? t('report.bar.saving')
    : review.isDirty
      ? t('report.bar.unsaved')
      : !historyReady
        ? t('report.bar.clean')
        : editedCount > 0
          ? t('report.bar.saved', { count: editedCount })
          : detail?.reviewed_at
            ? t('report.bar.savedDraft')
            : t('report.bar.untouched');

  return (
    <PageContainer className="rd-psych-report-page flex flex-col gap-6 pb-10">
      {pending || !detail ? (
        <BackLink onClick={() => navigate('/psychologist/reviews?tab=mine')}>{t('report.backToQueue')}</BackLink>
      ) : (
        <BackLink onClick={() => navigate(`/psychologist/students/${studentId}`)}>
          {t('report.backToStudent')}
        </BackLink>
      )}

      <PageHeader
        className="rd-psych-heading rd-psych-report-heading"
        level="display-md"
        kicker={
          detail ? (
            <span className={pending ? 'text-[color:var(--dawn-deep)]' : 'text-[color:var(--pine)]'}>
              {pending
                ? t('report.kickerPending')
                : t('report.kickerPublished', {
                    date: detail.published_at ? dateTimeLabel(detail.published_at) : '',
                  })}
            </span>
          ) : undefined
        }
        title={name || t('report.titleFallback')}
        wrap
        aside={
          <div className="rd-psych-report-meta">
            {metaLine && (
              <Text as="span" variant="caption" className="text-muted">
                {metaLine}
              </Text>
            )}
            {detail && (
              <Mono variant="sm" className="text-muted">
                {t('report.generatedAt', { date: dateTimeLabel(detail.created_at) })}
              </Mono>
            )}
          </div>
        }
      />

      <div role="tablist" aria-label={t('report.tabsLabel')} className="rd-psych-report-tabs">
        <TabButton
          tab="tests"
          label={t('report.tabTests')}
          note={t('report.tabTestsNote')}
          active={tab === 'tests'}
          onClick={() => switchTab('tests')}
          onKeyDown={handleTabKeyDown}
        />
        <TabButton
          tab="review"
          label={t('report.tabReview')}
          note={!historyReady ? '' : editedCount > 0 ? t('report.tabReviewEdited', { count: editedCount }) : t('report.tabReviewClean')}
          noteAccent={editedCount > 0}
          active={tab === 'review'}
          onClick={() => switchTab('review')}
          onKeyDown={handleTabKeyDown}
        />
      </div>

      <div id="report-panel-tests" role="tabpanel" aria-labelledby="report-tab-tests" tabIndex={0} hidden={tab !== 'tests'}>
        {tab === 'tests' && (
          <div className="rd-psych-report-tests flex flex-col gap-4">
            <div className="rd-psych-report-notice">
              <ShieldCheck size={19} aria-hidden="true" />
              <Text variant="body-sm">{t('report.testsIntro')}</Text>
            </div>
            {tests.isLoading && <AdminLoading />}
            {tests.notFound && !tests.isLoading && <AdminError message={t('report.testsNotFound')} />}
            {tests.error && !tests.isLoading && <AdminError message={t('report.testsError')} onRetry={tests.refetch} />}
            {tests.testResults && !tests.isLoading && (
              <ReportSectionsBlock
                testResults={tests.testResults}
                artifacts={student.data?.artifacts ?? []}
                aiAnalysis={tests.aiAnalysis}
                onRegenerateAiAnalysis={tests.regenerateAiAnalysis}
                regeneratingAiAnalysis={tests.regeneratingAiAnalysis}
                regenerateAiAnalysisError={tests.regenerateAiAnalysisError}
                openIds={openSections}
                onToggle={toggleSection}
              />
            )}
          </div>
        )}
      </div>

      {/* Keep local editor controls, including undo, when switching tabs. */}
      <div id="report-panel-review" role="tabpanel" aria-labelledby="report-tab-review" tabIndex={0} hidden={tab !== 'review'}>
        {review.isLoading ? (
          <AdminLoading />
        ) : review.loadError ? (
          <AdminError message={review.loadError} onRetry={review.reload} />
        ) : (
          <PsychologistStudentReportEditor
            key={`${studentId}/${assessmentId}`}
            review={review}
            historyPath={`/psychologist/students/${studentId}/assessments/${assessmentId}/report/history`}
          />
        )}
      </div>

      {pending && (
        <div className="rd-psych-report-actions">
          <div className="flex items-center gap-2.5 min-w-0" aria-live="polite">
            {review.actionError ? (
              <p role="alert" className={cn(typeClass.bodySm, 'text-danger m-0')}>
                {review.actionError}
              </p>
            ) : (
              <>
                <span
                  aria-hidden="true"
                  className={cn(
                    'w-2 h-2 rounded-full flex-none',
                    review.isDirty || editedCount > 0 ? 'bg-[color:var(--dawn)]' : 'bg-[color:var(--pine)]',
                  )}
                />
                <Text as="span" variant="caption" className="text-muted">
                  {saveLabel}
                </Text>
              </>
            )}
          </div>
          <div className="rd-psych-report-action-buttons">
            {tab === 'tests' ? (
              <Button type="button" className="col-span-2 py-2.5" muteSound onClick={() => switchTab('review')}>
                {t('report.bar.toReview')}
                <ArrowRight size={16} aria-hidden="true" />
              </Button>
            ) : (
              <>
                <Button
                  type="button"
                  variant="ghost"
                  className="px-3 py-2.5 sm:px-5"
                  muteSound
                  isLoading={review.saving}
                  disabled={!review.isDirty || review.publishing}
                  onClick={() => void review.saveDraft()}
                >
                  {t('report.bar.save')}
                </Button>
                <Button
                  type="button"
                  className="px-3 py-2.5 sm:px-5"
                  muteSound
                  disabled={review.saving || review.publishing || !review.draft}
                  onClick={requestPublish}
                >
                  {t('report.bar.publish')}
                </Button>
              </>
            )}
          </div>
        </div>
      )}

      <ConfirmDialog
        className="rd-psych-report-dialog"
        portalTarget={document.getElementById('psychologist-overlays')}
        open={publishOpen}
        size="md"
        kicker={t('report.publish.kicker')}
        title={t('report.publish.title')}
        body={t('report.publish.body', { name })}
        confirmLabel={t('report.publish.confirm')}
        cancelLabel={t('report.publish.cancel')}
        confirming={review.publishing}
        onConfirm={() => void confirmPublish()}
        onCancel={() => {
          if (!review.publishing) setPublishOpen(false);
        }}
      >
        <div className="flex flex-col gap-4">
          {historyReady && <LedgerRows rows={[{ label: t('report.publish.edits'), value: editedCount }]} />}
          {review.isDirty && (
            <Text variant="body-sm" className="text-secondary m-0">
              {t('report.publish.unsavedNote')}
            </Text>
          )}
          {historyReady && editedCount === 0 && (
            <Text
              variant="body-sm"
              className="m-0 px-4 py-3 border-l-[3px] border-l-[color:var(--dawn)] bg-accent-soft text-secondary"
            >
              {t('report.publish.noEdits')}
            </Text>
          )}
        </div>
      </ConfirmDialog>

      {publishedToast && (
        <div
          role="status"
          className="fixed left-1/2 bottom-7 -translate-x-1/2 z-50 flex items-center gap-3 rounded-[10px] bg-inverse text-inverse px-5 py-3.5 shadow-pop"
        >
          <span aria-hidden="true" className="w-2.5 h-2.5 rounded-full bg-[color:var(--dawn)]" />
          <Text as="span" variant="body-sm" className="text-inverse">
            {t('report.publish.done', { name })}
          </Text>
        </div>
      )}
    </PageContainer>
  );
}
