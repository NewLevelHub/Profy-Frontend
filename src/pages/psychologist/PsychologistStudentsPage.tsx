import { useState } from 'react';
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
import { CabinetSearch } from './components/CabinetSearch';
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
  const [query, setQuery] = useState('');
  const trimmed = query.trim();
  const search = trimmed.toLowerCase();
  const rows = (students.data ?? []).filter(row =>
    !search || row.email.toLowerCase().includes(search) || (row.profile_name ?? '').toLowerCase().includes(search),
  );

  const columns: AdminColumn<PsychologistStudentListItem>[] = [
    {
      key: 'student',
      header: t('students.col.student'),
      mobile: 'title',
      grow: true,
      cell: (row) => {
        const name = studentName(row.profile_name, row.email);
        return (
          <span className="flex items-center gap-3.5 min-w-0 group">
            <StudentInitials name={name} />
            <span className="flex flex-col min-w-0">
              <Text as="span" variant="body-md" className="font-medium text-heading truncate group-hover:underline">
                {name}
              </Text>
              {row.profile_name?.trim() && (
                <Text as="span" variant="caption" className="text-muted truncate">
                  {row.email}
                </Text>
              )}
            </span>
          </span>
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
      width: '88px',
      cell: (row) => (
        <Link
          to={studentPath(row)}
          aria-label={t('students.openCard', { name: studentName(row.profile_name, row.email) })}
          className="inline-flex items-center justify-center min-w-10 min-h-10 [@media(pointer:coarse)]:min-w-11 [@media(pointer:coarse)]:min-h-11 rounded-[8px] text-brand hover:bg-hover"
        >
          <ArrowRight size={16} aria-hidden="true" />
        </Link>
      ),
    },
  ];

  return (
    <PageContainer className="rd-psych-page flex flex-col pb-12">
      <PageHeader
        level="display-md"
        kicker={t('students.kicker')}
        title={t('students.title')}
        subtitle={t('students.lead')}
        className="rd-psych-heading"
      />

      <section className="rd-psych-list" aria-label={t('students.tableLabel')}>
        <div className="rd-psych-toolbar">
          <span className="rd-psych-results-count" aria-live="polite">{students.data ? t('students.count', { count: rows.length }) : t('students.tableLabel')}</span>
          <CabinetSearch value={query} onChange={setQuery} />
        </div>
        {students.isError ? (
          <AdminError message={t('students.loadError')} onRetry={() => void students.refetch()} />
        ) : (
          <AdminDataTable
            label={t('students.tableLabel')}
            columns={columns}
            rows={rows}
            rowKey={(row) => row.id}
            rowHref={studentPath}
            loading={students.isLoading}
            emptyTitle={trimmed ? t('queue.emptySearch', { query: trimmed }) : t('students.emptyTitle')}
            emptyHint={trimmed ? undefined : t('students.emptyText')}
            emptyAction={!trimmed &&
              <Link to="/psychologist/reviews" className={buttonClasses({ size: 'sm', variant: 'ghost', className: 'min-h-10 [@media(pointer:coarse)]:min-h-11' })}>
                {t('students.emptyAction')}
              </Link>
            }
          />
        )}
      </section>
    </PageContainer>
  );
}
