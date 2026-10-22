import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { apiErrorCode } from '@/shared/api/client';
import { schedulingApi, schedulingKeys } from '@/shared/api/scheduling';
import { formatDate } from '@/shared/i18n/format';
import { Button } from '@/shared/ui/Button';
import type { ScheduleMeeting, ScheduleMeetingMark } from '@/shared/types';
import { useWeekMeetings } from './useSchedule';

const KNOWN_ERRORS = ['meeting_not_started', 'meeting_cancelled'];

const TIMEZONE = 'Asia/Almaty';

function when(meeting: ScheduleMeeting): string {
  const day = formatDate(meeting.start, { weekday: 'short', day: 'numeric', month: 'long', timeZone: TIMEZONE });
  const time = (value: string) => formatDate(value, { hour: '2-digit', minute: '2-digit', timeZone: TIMEZONE });
  return `${day}, ${time(meeting.start)}–${time(meeting.end)}`;
}

/**
 * Calls booked into this week from the CRM, with the handoff card the
 * manager filled (ТЗ §3.10, §4.3) — what the specialist needs before the
 * call. Prices and the sales chat never reach this view (ТЗ §4.8). The
 * specialist marks each call: confirmed, and after the start held or no-show
 * (ТЗ §4.5); the CRM sees the status at once.
 */
export function WeekMeetings({ specialist, weekStart }: { specialist: string; weekStart: string }) {
  const { t } = useTranslation('psychologist');
  const meetings = useWeekMeetings(specialist, weekStart);
  const items = (meetings.data ?? []).filter((m) => m.status !== 'cancelled');
  const queryClient = useQueryClient();
  const [failed, setFailed] = useState<{ id: string; message: string } | null>(null);
  const mark = useMutation({
    mutationFn: ({ id, status }: { id: string; status: ScheduleMeetingMark }) =>
      schedulingApi.setMeetingStatus(specialist, id, status),
    onMutate: () => setFailed(null),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: schedulingKeys.meetings(specialist, weekStart) }),
    onError: (error, { id }) => {
      const code = apiErrorCode(error);
      setFailed({
        id,
        message: t(code && KNOWN_ERRORS.includes(code) ? `schedule.meetings.errors.${code}` : 'schedule.meetings.errors.generic'),
      });
    },
  });

  return (
    <section className="rd-schedule-meetings" aria-label={t('schedule.meetings.title')}>
      <h2>{t('schedule.meetings.title')}</h2>
      {meetings.isError ? (
        <p className="rd-schedule-notice">{t('schedule.errors.generic')}</p>
      ) : !items.length ? (
        <p className="rd-schedule-notice">{meetings.isLoading ? '' : t('schedule.meetings.empty')}</p>
      ) : (
        <ul>
          {items.map((meeting) => {
            const h = meeting.handoff;
            const started = Date.now() >= Date.parse(meeting.start);
            const busy = mark.isPending && mark.variables?.id === meeting.id;
            const set = (status: ScheduleMeetingMark) => mark.mutate({ id: meeting.id, status });
            return (
              <li key={meeting.id} id={`meeting-${meeting.id}`} className="rd-schedule-meeting">
                <div className="rd-schedule-meeting-head">
                  <strong>{when(meeting)}</strong>
                  <span>{t(`schedule.meetings.type.${meeting.type}`)}</span>
                </div>
                <p className={`rd-schedule-meeting-status is-${meeting.status}`}>
                  {t(`schedule.meetings.status.${meeting.status}`)}
                </p>
                <p>
                  <strong>{h.student_name}</strong>
                  {' · '}
                  {t('schedule.meetings.student', {
                    age: h.age,
                    grade: h.grade,
                    gender: t(`schedule.meetings.gender.${h.gender}`),
                  })}
                </p>
                <dl>
                  <dt>{t('schedule.meetings.request')}</dt>
                  <dd>{h.family_request}</dd>
                  <dt>{t('schedule.meetings.tariff')}</dt>
                  <dd>{h.tariff}</dd>
                  <dt>{t('schedule.meetings.language')}</dt>
                  <dd>
                    {t(`schedule.meetings.lang.${h.study_language}`)} ·{' '}
                    {t(`schedule.meetings.russian.${h.russian_level}`)}
                  </dd>
                  <dt>{t('schedule.meetings.contact')}</dt>
                  <dd>
                    {t(`schedule.meetings.contactWho.${h.contact}`)}: {h.contact_phone}
                    {' · '}
                    {t(h.parent_participates ? 'schedule.meetings.parentJoins' : 'schedule.meetings.parentAbsent')}
                  </dd>
                  {h.manager_comment && (
                    <>
                      <dt>{t('schedule.meetings.comment')}</dt>
                      <dd>{h.manager_comment}</dd>
                    </>
                  )}
                </dl>
                <div className="rd-schedule-meeting-actions">
                  {meeting.status === 'pending' && (
                    <Button variant="ghost" size="sm" muteSound disabled={busy} onClick={() => set('confirmed')}>
                      {t('schedule.meetings.actions.confirm')}
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    muteSound
                    disabled={busy || !started || meeting.status === 'done'}
                    onClick={() => set('done')}
                  >
                    {t('schedule.meetings.actions.done')}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    muteSound
                    disabled={busy || !started || meeting.status === 'no_show'}
                    onClick={() => set('no_show')}
                  >
                    {t('schedule.meetings.actions.noShow')}
                  </Button>
                </div>
                {!started && <p className="rd-schedule-hint">{t('schedule.meetings.afterStart')}</p>}
                {failed?.id === meeting.id && (
                  <p className="rd-schedule-notice" role="alert">
                    {failed.message}
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
