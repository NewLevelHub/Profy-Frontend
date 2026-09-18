import { useEffect, useState } from 'react';
import { useParams, useSearchParams, Link } from 'react-router';
import { AlertCircle, ArrowLeft, BarChart3, FileEdit } from 'lucide-react';
import { psychologistApi } from '@/shared/api/psychologist';
import { cn } from '@/shared/lib/cn';
import { AdminPageHeader } from '@/shared/ui/admin/AdminBreadcrumbs';
import { AdminBadge } from '@/shared/ui/admin/AdminBadge';
import { AdminError, AdminLoading } from '@/shared/ui/admin/AdminStates';
import { ADMIN_BUTTON } from '@/shared/ui/admin/density';
import { PageContainer } from '@/shared/ui/PageContainer';
import type { PsychologistStudentDetail } from '@/shared/types';
import { usePsychologistReport } from './report/hooks/usePsychologistReport';
import { ReportSectionsBlock } from './report/components/ReportSectionsBlock';
import { PsychologistStudentReportEditor } from './review/PsychologistStudentReportEditor';

export default function PsychologistReportPage() {
  const { studentId = '', assessmentId = '' } = useParams<{ studentId: string; assessmentId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') === 'review' ? 'review' : 'diagnostics';

  const [student, setStudent] = useState<PsychologistStudentDetail | null>(null);
  const [reviewStatus, setReviewStatus] = useState<'pending_review' | 'published' | null>(null);

  const {
    report,
    newTests,
    aiAnalysis,
    isLoading: isReportLoading,
    notFound,
    error: reportError,
    refetch,
    regenerateAiAnalysis,
    regeneratingAiAnalysis,
    regenerateAiAnalysisError,
  } = usePsychologistReport(studentId, assessmentId);

  useEffect(() => {
    if (!studentId) return;
    psychologistApi
      .getStudent(studentId)
      .then((data) => {
        setStudent(data);
        const match = data.assessments.find((a) => a.id === assessmentId);
        if (match?.review_status) {
          setReviewStatus(match.review_status);
        }
      })
      .catch(() => {
        // Non-fatal if student detail fails to load
      });
  }, [studentId, assessmentId]);

  function switchTab(tab: 'diagnostics' | 'review') {
    if (tab === 'review') {
      setSearchParams({ tab: 'review' }, { replace: true });
    } else {
      setSearchParams({}, { replace: true });
    }
  }

  const studentName = student?.profile?.name ?? student?.email ?? null;
  const pageTitle = studentName ? `Отчёт: ${studentName}` : 'Отчёт по диагностике';

  return (
    <PageContainer className="flex flex-col gap-5 pb-12">
      <Link
        to={`/psychologist/students/${studentId}`}
        className={cn(ADMIN_BUTTON, 'self-start gap-1.5 hover:border-strong')}
      >
        <ArrowLeft size={14} />
        Карточка ученика
      </Link>

      <AdminPageHeader
        crumbs={[
          { label: 'Ученики', to: '/psychologist/students' },
          { label: studentName ?? 'Карточка', to: `/psychologist/students/${studentId}` },
          { label: 'Отчёт' },
        ]}
        title={pageTitle}
        meta={
          reviewStatus && (
            <div className="flex items-center gap-2 mt-1">
              <AdminBadge tone={reviewStatus === 'published' ? 'brand' : 'accent'}>
                {reviewStatus === 'published' ? 'Опубликован ученику' : 'На проверке'}
              </AdminBadge>
            </div>
          )
        }
      />

      {/* Unified Tab Switcher */}
      <nav aria-label="Разделы отчёта" className="flex items-center gap-1.5 p-1 rounded-[16px] bg-[color-mix(in_srgb,var(--paper)_65%,transparent)] border border-default self-start shadow-xs">
        <button
          type="button"
          onClick={() => switchTab('diagnostics')}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-[12px] font-sans text-body-sm transition-all focus:outline-none focus:ring-2 focus:ring-brand',
            currentTab === 'diagnostics'
              ? 'bg-brand text-on-brand shadow-sm font-semibold'
              : 'text-secondary hover:text-primary hover:bg-raised font-medium',
          )}
        >
          <BarChart3 size={15} />
          Психодиагностика и тесты
        </button>

        <button
          type="button"
          onClick={() => switchTab('review')}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-[12px] font-sans text-body-sm transition-all focus:outline-none focus:ring-2 focus:ring-brand',
            currentTab === 'review'
              ? 'bg-brand text-on-brand shadow-sm font-semibold'
              : 'text-secondary hover:text-primary hover:bg-raised font-medium',
          )}
        >
          <FileEdit size={15} />
          Отчёт для ученика
          {reviewStatus === 'pending_review' && (
            <span
              className="px-1.5 py-0.2 rounded-full text-caption font-bold bg-accent text-on-brand leading-tight"
              title="Отчёт ожидает проверки"
            >
              1
            </span>
          )}
        </button>
      </nav>

      {/* Tab 1: Full Psychometrics & Diagnostics */}
      {currentTab === 'diagnostics' && (
        <div className="flex flex-col gap-5">
          {reviewStatus === 'pending_review' && (
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-[14px] bg-[color-mix(in_srgb,var(--dawn)_12%,var(--paper))] border border-[color-mix(in_srgb,var(--dawn)_35%,var(--border))]">
              <div className="flex items-center gap-3 min-w-0">
                <AlertCircle className="text-dawn flex-shrink-0" size={20} />
                <div>
                  <p className="font-sans text-body-md font-semibold text-primary m-0">
                    Отчёт ожидает вашей проверки перед показом ученику
                  </p>
                  <p className="font-sans text-body-sm text-secondary m-0">
                    Ознакомьтесь с результатами диагностики ниже и перейдите во вкладку «Отчёт для ученика», чтобы скорректировать формулировки и опубликовать результат.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => switchTab('review')}
                className={cn(
                  ADMIN_BUTTON,
                  'bg-brand text-on-brand border-brand hover:bg-brand-hover hover:border-brand-hover hover:text-on-brand shadow-sm font-semibold',
                )}
              >
                Перейти к отчёту для ученика →
              </button>
            </div>
          )}

          {isReportLoading && <AdminLoading />}

          {notFound && !isReportLoading && (
            <AdminError message="Отчёт ещё не готов или недоступен для этой диагностики" />
          )}

          {reportError && !isReportLoading && (
            <AdminError message={reportError} onRetry={() => void refetch()} />
          )}

          {report && newTests && !isReportLoading && (
            <ReportSectionsBlock
              report={report}
              newTests={newTests}
              aiAnalysis={aiAnalysis}
              onRegenerateAiAnalysis={regenerateAiAnalysis}
              regeneratingAiAnalysis={regeneratingAiAnalysis}
              regenerateAiAnalysisError={regenerateAiAnalysisError}
            />
          )}
        </div>
      )}

      {/* Tab 2: Student Report Review & Editor */}
      {currentTab === 'review' && (
        <PsychologistStudentReportEditor
          studentId={studentId}
          assessmentId={assessmentId}
          onPublished={() => {
            setReviewStatus('published');
            void refetch();
          }}
        />
      )}
    </PageContainer>
  );
}
