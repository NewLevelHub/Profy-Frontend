import { ArrowRight, ClipboardCheck, Clock3, Info, UsersRound } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import { ASSESSMENT_GOAL_LABELS } from '@/shared/lib/assessmentLabels';
import { usePsychologistReviews } from '@/shared/hooks/usePsychologistReviews';
import { AdminDataTable, type AdminColumn } from '@/shared/ui/admin/AdminDataTable';
import { AdminError } from '@/shared/ui/admin/AdminStates';
import { Button, buttonClasses } from '@/shared/ui/Button';
import { PageContainer } from '@/shared/ui/PageContainer';
import { PageHeader } from '@/shared/ui/PageHeader';
import { Mono, Text } from '@/shared/ui/typography';
import type { AssessmentGoal, PsychologistAvailableStudentItem, PsychologistReviewQueueItem } from '@/shared/types';
import { CabinetSearch } from './components/CabinetSearch';
import { StudentInitials } from './components/StudentInitials';
import { SegmentedTabs } from './components/SegmentedTabs';
import { StatusMark } from './components/StatusMark';
import { agoLabel, daysAgo, gradeShort, studentName } from './components/cabinetFormat';
import { useAvailableStudents, useClaimStudent, useMyStudents } from './hooks/useCabinetQueries';

type QueueTab = 'pool' | 'mine';

/** A report older than this in the shared pool is flagged "ждёт долго". */
const LONG_WAIT_DAYS = 3;

function reportPath(row: PsychologistReviewQueueItem) {
  return `/psychologist/students/${row.student_id}/assessments/${row.assessment_id}/report`;
}

function matches(query: string, name: string | null, email: string) {
  if (!query) return true;
  const q = query.toLowerCase();
  return email.toLowerCase().includes(q) || (name ?? '').toLowerCase().includes(q);
}

function StudentCell({ name, email }: { name: string | null; email: string }) {
  return (
    <span className="flex items-center gap-3 min-w-0">
      <StudentInitials name={studentName(name, email)} />
      <span className="flex flex-col min-w-0">
        <Text as="span" variant="body-md" className="font-medium text-heading truncate">
          {studentName(name, email)}
        </Text>
        {name?.trim() && (
          <Text as="span" variant="caption" className="text-muted truncate">
            {email}
          </Text>
        )}
      </span>
    </span>
  );
}

function GoalCell({ goal }: { goal: AssessmentGoal | null | undefined }) {
  const { t } = useTranslation();
  if (!goal) return <Mono className="text-muted">—</Mono>;
  return (
    <Text as="span" variant="body-sm" className="text-secondary">
      {t(ASSESSMENT_GOAL_LABELS[goal] ?? goal)}
    </Text>
  );
}

export default function PsychologistReviewQueuePage() {
  const { t } = useTranslation(['psychologist', 'admin']);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const tab: QueueTab = searchParams.get('tab') === 'mine' ? 'mine' : 'pool';
  const [query, setQuery] = useState('');

  const reviews = usePsychologistReviews();
  const available = useAvailableStudents();
  const myStudents = useMyStudents();
  const claim = useClaimStudent();

  // The pool is students with a finished test — before that there is
  // nothing to review and nothing to claim (PRO-402). Oldest wait first,
  // same order as the review queue itself.
  const pool = useMemo(
    () =>
      (available.data ?? [])
        .filter((row) => row.has_completed_assessment)
        .sort((a, b) => {
          if (a.has_pending_review !== b.has_pending_review) return a.has_pending_review ? -1 : 1;
          return (a.completed_at ?? '').localeCompare(b.completed_at ?? '');
        }),
    [available.data],
  );
  const mine = reviews.data ?? [];
  const poolWaiting = pool.filter((row) => row.has_pending_review).length;

  const trimmed = query.trim();
  const poolRows = pool.filter((row) => matches(trimmed, row.profile_name, row.email));
  const mineRows = mine.filter((row) => matches(trimmed, row.student_name, row.student_email));

  function setTab(next: QueueTab) {
    setSearchParams(next === 'mine' ? { tab: 'mine' } : {}, { replace: true });
  }

  function handleClaim(row: PsychologistAvailableStudentItem) {
    claim.mutate(row.id, {
      onSuccess: () => {
        // A waiting report lands in "Мои"; without one there is nothing to
        // check yet, so the student's card is the useful next screen.
        if (row.has_pending_review) setTab('mine');
        else navigate(`/psychologist/students/${row.id}`);
      },
    });
  }

  const poolColumns: AdminColumn<PsychologistAvailableStudentItem>[] = [
      {
        key: 'student',
        header: t('queue.col.student'),
        mobile: 'title',
        grow: true,
        cell: (row) => <StudentCell name={row.profile_name} email={row.email} />,
      },
      {
        key: 'goal',
        header: t('queue.col.goal'),
        mobile: 'field',
        width: '175px',
        wrap: true,
        cell: (row) => <GoalCell goal={row.goal} />,
      },
      {
        key: 'grade',
        header: t('queue.col.grade'),
        mobile: 'field',
        width: '72px',
        cell: (row) => <Mono variant="md">{gradeShort(t, row.grade)}</Mono>,
      },
      {
        key: 'received',
        header: t('queue.col.received'),
        mobile: 'field',
        width: '132px',
        wrap: true,
        cell: (row) => (
          <Mono variant="md" className="text-muted">
            {row.completed_at ? agoLabel(t, row.completed_at) : '—'}
          </Mono>
        ),
      },
      {
        key: 'status',
        header: t('queue.col.status'),
        mobile: 'badge',
        width: '142px',
        wrap: true,
        cell: (row) => {
          if (!row.has_pending_review) {
            return <StatusMark tone="mute" hollow>{t('queue.status.noReview')}</StatusMark>;
          }
          const long = row.completed_at ? daysAgo(row.completed_at) >= LONG_WAIT_DAYS : false;
          return long ? (
            <StatusMark tone="dawn">{t('queue.status.long')}</StatusMark>
          ) : (
            <StatusMark tone="mute" hollow>{t('queue.status.new')}</StatusMark>
          );
        },
      },
      {
        key: 'action',
        header: '',
        mobile: 'field',
        align: 'right',
        width: '176px',
        cell: (row) => (
          <Button
            type="button"
            size="sm"
            className="min-h-10 [@media(pointer:coarse)]:min-h-11"
            variant="ghost"
            muteSound
            isLoading={claim.isPending && claim.variables === row.id}
            disabled={claim.isPending}
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              handleClaim(row);
            }}
          >
            {t('queue.take')}
          </Button>
        ),
      },
  ];

  const mineColumns: AdminColumn<PsychologistReviewQueueItem>[] = [
      {
        key: 'student',
        header: t('queue.col.student'),
        mobile: 'title',
        grow: true,
        cell: (row) => <StudentCell name={row.student_name} email={row.student_email} />,
      },
      {
        key: 'goal',
        header: t('queue.col.goal'),
        mobile: 'field',
        width: '175px',
        wrap: true,
        cell: (row) => <GoalCell goal={row.goal} />,
      },
      {
        key: 'grade',
        header: t('queue.col.grade'),
        mobile: 'field',
        width: '72px',
        cell: (row) => <Mono variant="md">{gradeShort(t, row.grade)}</Mono>,
      },
      {
        key: 'received',
        header: t('queue.col.received'),
        mobile: 'field',
        width: '132px',
        wrap: true,
        cell: (row) => (
          <Mono variant="md" className="text-muted">
            {agoLabel(t, row.generated_at)}
          </Mono>
        ),
      },
      {
        key: 'status',
        header: t('queue.col.status'),
        mobile: 'badge',
        width: '142px',
        wrap: true,
        cell: (row) =>
          row.reviewed_at ? (
            <StatusMark tone="dawn">{t('queue.status.edited')}</StatusMark>
          ) : (
            <StatusMark tone="mute" hollow>{t('queue.status.untouched')}</StatusMark>
          ),
      },
      {
        key: 'action',
        header: '',
        // The mobile card is itself the link to the report.
        mobile: 'hidden',
        align: 'right',
        width: '176px',
        cell: (row) => (
          <Link to={reportPath(row)} className={buttonClasses({ size: 'sm', className: 'min-h-10 [@media(pointer:coarse)]:min-h-11' })}>
            {t('queue.check')}
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        ),
      },
  ];

  const loading = tab === 'pool' ? available.isLoading : reviews.isLoading;
  const failed = tab === 'pool' ? available.isError : reviews.isError;

  return (
    <PageContainer className="rd-psych-page flex flex-col pb-12">
      <PageHeader
        level="display-md"
        kicker={t('queue.kicker')}
        title={t('queue.title')}
        subtitle={t(tab === 'mine' ? 'queue.mineLead' : 'queue.lead')}
        className="rd-psych-heading"
      />

      <div className="rd-psych-stats">
        <button type="button" className="rd-psych-stat" onClick={() => setTab('pool')}>
          <span className="rd-icon-tile rd-peach"><Clock3 aria-hidden="true" /></span>
          <span><strong>{available.data ? poolWaiting : '—'}</strong><small>{t('queue.statPool')}</small></span>
        </button>
        <button type="button" className="rd-psych-stat" onClick={() => setTab('mine')}>
          <span className="rd-icon-tile rd-psych-sage"><ClipboardCheck aria-hidden="true" /></span>
          <span><strong>{reviews.data ? mine.length : '—'}</strong><small>{t('queue.statMine')}</small></span>
        </button>
        <Link to="/psychologist/students" className="rd-psych-stat">
          <span className="rd-icon-tile rd-lilac"><UsersRound aria-hidden="true" /></span>
          <span><strong>{myStudents.data ? myStudents.data.length : '—'}</strong><small>{t('queue.statStudents')}</small></span>
        </Link>
      </div>

      <section className="rd-psych-list" aria-label={t('queue.tabsLabel')}>
        <div className="rd-psych-toolbar">
          <SegmentedTabs<QueueTab>
            label={t('queue.tabsLabel')}
            active={tab}
            onChange={setTab}
            tabs={[
              { key: 'pool', label: t('queue.tabPool', { count: pool.length }) },
              { key: 'mine', label: t('queue.tabMine', { count: mine.length }) },
            ]}
          />
          <CabinetSearch value={query} onChange={setQuery} />
        </div>

        {claim.isError && <AdminError message={t('queue.claimError')} />}
        {failed && (
          <AdminError
            message={t('queue.loadError')}
            onRetry={() => void (tab === 'pool' ? available.refetch() : reviews.refetch())}
          />
        )}

        {!failed &&
          (tab === 'pool' ? (
            <AdminDataTable
              label={t('queue.tabPoolLabel')}
              columns={poolColumns}
              rows={poolRows}
              rowKey={(row) => row.id}
              loading={loading}
              emptyTitle={trimmed ? t('queue.emptySearch', { query: trimmed }) : t('queue.emptyPoolTitle')}
              emptyHint={trimmed ? undefined : t('queue.emptyPoolText')}
              emptyAction={!trimmed && mine.length > 0 ? <Button size="sm" variant="ghost" onClick={() => setTab('mine')}>{t('queue.openMine')}</Button> : undefined}
            />
          ) : (
            <AdminDataTable
              label={t('queue.tabMineLabel')}
              columns={mineColumns}
              rows={mineRows}
              rowKey={(row) => row.assessment_id}
              rowHref={reportPath}
              loading={loading}
              emptyTitle={trimmed ? t('queue.emptySearch', { query: trimmed }) : t('queue.emptyMineTitle')}
              emptyHint={trimmed ? undefined : t('queue.emptyMineText')}
            />
          ))}

      </section>
      <p className="rd-psych-footnote"><Info size={15} aria-hidden="true" />{t('queue.visibilityHint')}</p>
      <p className="sr-only" aria-live="polite">
        {claim.isSuccess ? t('queue.claimed') : ''}
      </p>
    </PageContainer>
  );
}
