import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { ArrowRight } from 'lucide-react';
import { AdminDataTable, type AdminColumn } from '@/shared/ui/admin/AdminDataTable';
import { AdminError } from '@/shared/ui/admin/AdminStates';
import { buttonClasses } from '@/shared/ui/Button';
import { PageContainer } from '@/shared/ui/PageContainer';
import { PageHeader } from '@/shared/ui/PageHeader';
import { Mono, Text } from '@/shared/ui/typography';
import type { PsychologistStudentListItem } from '@/shared/types';
import { StatusMark } from './components/StatusMark';
import { StudentInitials } from './components/StudentInitials';
import { gradeShort, shortDateLabel, studentName } from './components/cabinetFormat';
import { useMyStudents } from './hooks/useCabinetQueries';

function studentPath(row: PsychologistStudentListItem) {
  return `/psychologist/students/${row.id}`;
}

function ReportStatus({ status }: { status: PsychologistStudentListItem['report_status'] }) {
  const { t } = useTranslation('psychologist');
  if (status === 'pending_review') return <StatusMark tone="dawn">{t('students.status.pending')}</StatusMark>;
  if (status === 'published') return <StatusMark tone="pine">{t('students.status.published')}</StatusMark>;
  return <StatusMark tone="mute" hollow>{t('students.status.none')}</StatusMark>;
}

export default function PsychologistStudentsPage() {
  const { t } = useTranslation('psychologist');
  const students = useMyStudents();

  const columns: AdminColumn<PsychologistStudentListItem>[] = [
    {
      key: 'student',
      header: t('students.col.student'),
      mobile: 'title',
      grow: true,
      cell: (row) => {
        const name = studentName(row.profile_name, row.email);
        return (
          <Link to={studentPath(row)} className="flex items-center gap-3.5 min-w-0 group">
            <StudentInitials name={name} />
            <span className="flex flex-col min-w-0">
              <Text as="span" variant="body-md" className="font-medium text-heading truncate group-hover:underline">
                {name}
              </Text>
              {row.profile_name?.trim() && (
                <Mono variant="sm" className="text-muted truncate">
                  {row.email}
                </Mono>
              )}
            </span>
          </Link>
        );
      },
    },
    {
      key: 'grade',
      header: t('students.col.grade'),
      mobile: 'field',
      width: '96px',
      cell: (row) => <Mono variant="md">{gradeShort(t, row.grade)}</Mono>,
    },
    {
      key: 'assigned',
      header: t('students.col.assigned'),
      mobile: 'field',
      width: '120px',
      cell: (row) => (
        <Mono variant="md" className="text-muted">
          {row.assigned_at ? shortDateLabel(row.assigned_at) : '—'}
        </Mono>
      ),
    },
    {
      key: 'report',
      header: t('students.col.report'),
      mobile: 'badge',
      width: '190px',
      cell: (row) => <ReportStatus status={row.report_status} />,
    },
    {
      key: 'open',
      header: '',
      mobile: 'hidden',
      align: 'right',
      width: '56px',
      cell: (row) => (
        <Link
          to={studentPath(row)}
          aria-label={t('students.openCard', { name: studentName(row.profile_name, row.email) })}
          className="inline-flex text-brand hover:opacity-70"
        >
          <ArrowRight size={16} aria-hidden="true" />
        </Link>
      ),
    },
  ];

  return (
    <PageContainer className="flex flex-col gap-7 pb-16">
      <PageHeader
        level="display-lg"
        kicker={t('students.kicker')}
        title={t('students.title')}
        subtitle={t('students.lead')}
        className="pb-7 border-b border-strong"
      />

      {students.isError ? (
        <AdminError message={t('students.loadError')} onRetry={() => void students.refetch()} />
      ) : (
        <AdminDataTable
          label={t('students.tableLabel')}
          columns={columns}
          rows={students.data ?? []}
          rowKey={(row) => row.id}
          loading={students.isLoading}
          emptyTitle={t('students.emptyTitle')}
          emptyHint={t('students.emptyText')}
          emptyAction={
            <Link to="/psychologist/reviews" className={buttonClasses({ size: 'sm', variant: 'ghost' })}>
              {t('students.emptyAction')}
            </Link>
          }
        />
      )}
    </PageContainer>
  );
}
