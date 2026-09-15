import { useParams } from 'react-router';
import { AdminPageHeader } from '@/shared/ui/admin/AdminBreadcrumbs';
import { AdminError, AdminLoading } from '@/shared/ui/admin/AdminStates';
import { PageContainer } from '@/shared/ui/PageContainer';
import { usePsychologistReport } from './report/hooks/usePsychologistReport';
import { ReportSectionsBlock } from './report/components/ReportSectionsBlock';

export default function PsychologistReportPage() {
  const { studentId = '', assessmentId = '' } = useParams<{ studentId: string; assessmentId: string }>();
  const { report, newTests, isLoading, notFound, error, refetch } = usePsychologistReport(studentId, assessmentId);

  return (
    <PageContainer className="flex flex-col gap-5 pb-10">
      <AdminPageHeader
        crumbs={[
          { label: 'Ученики', to: '/psychologist/students' },
          { label: 'Карточка', to: `/psychologist/students/${studentId}` },
          { label: 'Отчёт' },
        ]}
        title="Отчёт"
      />

      {isLoading && <AdminLoading />}

      {notFound && !isLoading && (
        <AdminError message="Отчёт ещё не готов или недоступен для этой диагностики" />
      )}

      {error && !isLoading && <AdminError message={error} onRetry={() => void refetch()} />}

      {report && newTests && !isLoading && (
        <ReportSectionsBlock report={report} newTests={newTests} />
      )}
    </PageContainer>
  );
}
