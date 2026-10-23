import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { schedulingKeys } from '@/shared/api/scheduling';
import { MeetingCard } from '../components/MeetingCard';
import { useWeekMeetings } from './useSchedule';

/**
 * The owner's view of a specialist's week: the calls booked into it, with
 * their handoff cards and marks. The specialist works with their calls in
 * «Созвоны» (PsychologistCallsPage).
 */
export function WeekMeetings({ specialist, weekStart }: { specialist: string; weekStart: string }) {
  const { t } = useTranslation('psychologist');
  const meetings = useWeekMeetings(specialist, weekStart);
  const items = (meetings.data ?? []).filter((m) => m.status !== 'cancelled');
  const queryClient = useQueryClient();
  const refresh = () => void queryClient.invalidateQueries({ queryKey: schedulingKeys.meetings(specialist, weekStart) });

  return (
    <section className="rd-schedule-meetings" aria-label={t('schedule.meetings.title')}>
      <h2>{t('schedule.meetings.title')}</h2>
      {meetings.isError ? (
        <p className="rd-schedule-notice">{t('schedule.errors.generic')}</p>
      ) : !items.length ? (
        <p className="rd-schedule-notice">{meetings.isLoading ? '' : t('schedule.meetings.empty')}</p>
      ) : (
        <ul>
          {items.map((meeting) => (
            <MeetingCard key={meeting.id} meeting={meeting} specialist={specialist} onMarked={refresh} />
          ))}
        </ul>
      )}
    </section>
  );
}
