import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiErrorCode } from '@/shared/api/client';
import { psychologistApi } from '@/shared/api/psychologist';
import { psychologistKeys } from '@/shared/api/psychologistKeys';
import { schedulingKeys } from '@/shared/api/scheduling';
import { formatDate } from '@/shared/i18n/format';
import { Mono, Text } from '@/shared/ui/typography';
import type { ScheduleMeeting } from '@/shared/types';
import { CallTimePicker } from './CallTimePicker';
import { StatusMark, type StatusTone } from './StatusMark';

const PANEL = 'rd-psych-panel bg-surface border border-strong rounded-[10px]';
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

/** The student's calls with this specialist: the first one the manager booked
 *  from the CRM and the second one — the report review — the specialist sets
 *  here once the first has begun. Hidden for a tariff without a specialist. */
export function StudentCalls({ studentId }: { studentId: string }) {
  const { t } = useTranslation('psychologist');
  const queryClient = useQueryClient();
  const key = psychologistKeys.secondMeeting(studentId);
  const calls = useQuery({ queryKey: key, queryFn: () => psychologistApi.secondMeeting(studentId), enabled: !!studentId });
  const [error, setError] = useState<string | null>(null);

  const schedule = useMutation({
    mutationFn: (start: string) => psychologistApi.setSecondMeeting(studentId, start),
    onSuccess: (state) => {
      queryClient.setQueryData(key, state);
      // The hour is taken in the schedule and shows in «Созвоны».
      void queryClient.invalidateQueries({ queryKey: schedulingKeys.all });
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

  // The form opens as the first call begins: refresh at that moment, so a
  // card opened before the call needs no reload.
  const opensAt = calls.data?.blocker === 'first_not_started' ? calls.data.first?.start : undefined;
  useEffect(() => {
    if (!opensAt) return;
    const wait = Date.parse(opensAt) - Date.now();
    // setTimeout caps at ~24.8 days; a farther call is refreshed on revisit.
    if (wait > 2 ** 31 - 1) return;
    const timer = window.setTimeout(
      () => void queryClient.invalidateQueries({ queryKey: psychologistKeys.secondMeeting(studentId) }),
      Math.max(wait, 0) + 1000,
    );
    return () => window.clearTimeout(timer);
  }, [opensAt, queryClient, studentId]);

  const state = calls.data;
  if (!state || (state.blocker === 'no_consultation' && !state.first && !state.second)) return null;

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
          <CallTimePicker
            minutes={60}
            label={t('detail.calls.pendingLabel')}
            confirmLabel={t('detail.calls.schedule')}
            onConfirm={(start) => schedule.mutate(start)}
            saving={schedule.isPending}
          />
        ) : (
          state.blocker &&
          state.blocker !== 'already_scheduled' && (
            <Text variant="body-sm" className="text-muted m-0">
              {state.blocker === 'first_not_started' && state.first
                ? t('detail.calls.blocker.first_not_started_at', { time: callTime(state.first.start) })
                : t(`detail.calls.blocker.${state.blocker}`)}
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
