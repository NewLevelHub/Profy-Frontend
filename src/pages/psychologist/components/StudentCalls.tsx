import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiErrorCode } from '@/shared/api/client';
import { psychologistApi } from '@/shared/api/psychologist';
import { psychologistKeys } from '@/shared/api/psychologistKeys';
import { formatDate } from '@/shared/i18n/format';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { Mono, Text } from '@/shared/ui/typography';
import type { ScheduleMeeting } from '@/shared/types';
import { StatusMark, type StatusTone } from './StatusMark';

const PANEL = 'rd-psych-panel bg-surface border border-strong rounded-[10px]';
// The schedule grid is 08:00–22:00 Almaty; a 60-minute call starts by 21:00.
const START_TIMES = Array.from({ length: 27 }, (_, i) => {
  const minutes = 8 * 60 + i * 30;
  return `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
});
const ERROR_CODES = [
  'slot_taken',
  'slot_in_past',
  'slot_misaligned',
  'slot_out_of_grid',
  'second_meeting_first_not_started',
  'second_meeting_already_scheduled',
  'second_meeting_no_consultation',
] as const;

const STATUS_TONE: Record<ScheduleMeeting['status'], StatusTone> = {
  pending: 'dawn',
  confirmed: 'lake',
  done: 'pine',
  no_show: 'clay',
  cancelled: 'mute',
};

/** «19 окт., пн, 15:00» — Almaty wall time, like the rest of the schedule. */
function callTime(value: string): string {
  return formatDate(value, {
    day: 'numeric',
    month: 'short',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Almaty',
  });
}

function todayInAlmaty(): string {
  return new Date(Date.now() + 5 * 3_600_000).toISOString().slice(0, 10);
}

/** The student's calls with this specialist: the first one the manager booked
 *  from the CRM and the second one — the report review — the specialist sets
 *  here once the first has begun. Hidden for a tariff without a specialist. */
export function StudentCalls({ studentId }: { studentId: string }) {
  const { t } = useTranslation('psychologist');
  const queryClient = useQueryClient();
  const key = psychologistKeys.secondMeeting(studentId);
  const calls = useQuery({ queryKey: key, queryFn: () => psychologistApi.secondMeeting(studentId), enabled: !!studentId });
  const [day, setDay] = useState('');
  const [time, setTime] = useState('15:00');
  const [error, setError] = useState<string | null>(null);

  const schedule = useMutation({
    mutationFn: (start: string) => psychologistApi.setSecondMeeting(studentId, start),
    onSuccess: (state) => {
      queryClient.setQueryData(key, state);
      setError(null);
    },
    onError: (err) => {
      const code = apiErrorCode(err);
      setError(
        code && (ERROR_CODES as readonly string[]).includes(code)
          ? t(`detail.calls.errors.${code}`)
          : t('detail.calls.errors.generic'),
      );
    },
  });

  const state = calls.data;
  if (!state || (state.blocker === 'no_consultation' && !state.first && !state.second)) return null;

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!day) return;
    // Almaty is UTC+5 all year.
    schedule.mutate(`${day}T${time}:00+05:00`);
  };

  const row = (label: string, meeting: ScheduleMeeting | null, empty: string) => (
    <li className="flex flex-wrap items-center justify-between gap-3 px-6 py-3.5 border-t border-default">
      <div className="min-w-0">
        <Text variant="body-md" className="text-heading m-0">
          {label}
        </Text>
        <Mono variant="sm" className="text-muted">
          {meeting ? callTime(meeting.start) : empty}
        </Mono>
      </div>
      {meeting && (
        <StatusMark tone={STATUS_TONE[meeting.status]} hollow={meeting.status === 'pending'}>
          {t(`schedule.meetings.status.${meeting.status}`)}
        </StatusMark>
      )}
    </li>
  );

  return (
    <section className={PANEL}>
      <header className="px-6 pt-5 pb-3">
        <Text as="h2" variant="body-lg" className="font-semibold text-heading m-0">
          {t('detail.calls.title')}
        </Text>
        <Text variant="body-sm" className="text-muted mt-1 mb-0">
          {t('detail.calls.hint')}
        </Text>
      </header>
      <ul className="m-0 p-0 list-none">
        {row(t('detail.calls.first'), state.first, t('detail.calls.firstMissing'))}
        {row(t('detail.calls.second'), state.second, t('detail.calls.secondMissing'))}
      </ul>

      <div className="px-6 py-4 border-t border-default flex flex-col gap-3">
        {state.can_schedule ? (
          <form className="flex flex-wrap items-end gap-3" onSubmit={submit}>
            <div className="w-44">
              <Input
                label={t('detail.calls.date')}
                type="date"
                required
                min={todayInAlmaty()}
                value={day}
                onChange={(e) => setDay(e.target.value)}
              />
            </div>
            <label className="flex flex-col">
              {/* Same label as Input's, so the two fields read as one row. */}
              <span className="font-mono text-mono-xs tracking-label uppercase text-muted mb-1">{t('detail.calls.time')}</span>
              <select
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="min-h-11 px-3 rounded-[var(--radius)] border border-default bg-surface text-primary"
              >
                {START_TIMES.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </label>
            <Button type="submit" size="md" isLoading={schedule.isPending} disabled={!day} muteSound>
              {t('detail.calls.schedule')}
            </Button>
          </form>
        ) : (
          state.blocker &&
          state.blocker !== 'already_scheduled' && (
            <Text variant="body-sm" className="text-muted m-0">
              {t(`detail.calls.blocker.${state.blocker}`)}
            </Text>
          )
        )}
        {error && (
          <div role="alert">
            <Text variant="body-sm" className="text-danger m-0">
              {error}
            </Text>
          </div>
        )}
        <Text variant="body-sm" className="text-muted m-0">
          {t('detail.calls.statusHint')}{' '}
          <Link to="/psychologist/schedule" className="text-brand underline underline-offset-4">
            {t('detail.calls.toSchedule')}
          </Link>
        </Text>
      </div>
    </section>
  );
}
