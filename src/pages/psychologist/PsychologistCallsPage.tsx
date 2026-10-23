import { useEffect } from 'react';
import { useLocation } from 'react-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { schedulingApi, schedulingKeys } from '@/shared/api/scheduling';
import { AdminError, AdminLoading } from '@/shared/ui/admin/AdminStates';
import { PageContainer } from '@/shared/ui/PageContainer';
import { PageHeader } from '@/shared/ui/PageHeader';
import type { ScheduleMeeting } from '@/shared/types';
import { MeetingCard } from './components/MeetingCard';
import { addDays } from './schedule/scheduleDates';
import { useScheduleConfig } from './schedule/useSchedule';

// The API serves at most 42 days per request: two weeks back, four ahead.
const PAST_DAYS = 14;
const AHEAD_DAYS = 27;
const OPEN = new Set<ScheduleMeeting['status']>(['pending', 'confirmed']);

/**
 * «Созвоны» — the specialist's home: calls to mark after they happened,
 * the coming ones with their handoff cards, and the recent history. The
 * first call the manager books from the CRM; the second one — the report
 * review — the specialist sets in the student card.
 */
export default function PsychologistCallsPage() {
  const { t } = useTranslation('psychologist');
  const queryClient = useQueryClient();
  const { hash } = useLocation();
  const today = useScheduleConfig().data?.today;
  const from = today ? addDays(today, -PAST_DAYS) : '';
  const to = today ? addDays(today, AHEAD_DAYS) : '';
  const key = [...schedulingKeys.all, 'meetings', 'me', 'calls', from] as const;
  const calls = useQuery({
    queryKey: key,
    queryFn: () => schedulingApi.meetings('me', from, to),
    enabled: Boolean(today),
    refetchOnWindowFocus: true,
  });
  const refresh = () => void queryClient.invalidateQueries({ queryKey: [...schedulingKeys.all, 'meetings'] });

  // From the schedule grid: /psychologist/calls#meeting-<id>.
  useEffect(() => {
    if (calls.data && hash) document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [calls.data, hash]);

  const now = Date.now();
  const all = calls.data ?? [];
  const started = (m: ScheduleMeeting) => Date.parse(m.start) <= now;
  const toMark = all.filter((m) => OPEN.has(m.status) && started(m));
  const upcoming = all.filter((m) => m.status !== 'cancelled' && !started(m));
  const past = all.filter((m) => m.status === 'done' || m.status === 'no_show').reverse();

  const section = (title: string, items: ScheduleMeeting[], empty: string) => (
    <section className="rd-schedule-meetings" aria-label={title}>
      <h2>{title}</h2>
      {items.length ? (
        <ul>
          {items.map((meeting) => (
            <MeetingCard key={meeting.id} meeting={meeting} specialist="me" onMarked={refresh} showStudentLink />
          ))}
        </ul>
      ) : (
        <p className="rd-schedule-notice">{empty}</p>
      )}
    </section>
  );

  return (
    <PageContainer className="rd-psych-page flex flex-col gap-8 pb-12">
      <PageHeader
        level="display-md"
        kicker={t('calls.kicker')}
        title={t('calls.title')}
        subtitle={t('calls.lead')}
        className="rd-psych-heading"
      />
      {calls.isError ? (
        <AdminError message={t('calls.loadError')} onRetry={() => void calls.refetch()} />
      ) : !calls.data ? (
        <AdminLoading />
      ) : (
        <>
          {toMark.length > 0 && section(t('calls.toMark'), toMark, '')}
          {section(t('calls.upcoming'), upcoming, t('calls.upcomingEmpty'))}
          {section(t('calls.past'), past, t('calls.pastEmpty'))}
        </>
      )}
    </PageContainer>
  );
}
