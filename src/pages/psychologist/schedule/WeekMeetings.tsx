import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { schedulingApi, schedulingKeys } from '@/shared/api/scheduling';
import { formatDate } from '@/shared/i18n/format';
import type { ScheduleMeeting } from '@/shared/types';
import { addDays } from './scheduleDates';

const TIMEZONE = 'Asia/Almaty';

function when(meeting: ScheduleMeeting): string {
  const day = formatDate(meeting.start, { weekday: 'short', day: 'numeric', month: 'long', timeZone: TIMEZONE });
  const time = (value: string) => formatDate(value, { hour: '2-digit', minute: '2-digit', timeZone: TIMEZONE });
  return `${day}, ${time(meeting.start)}–${time(meeting.end)}`;
}

/**
 * Calls booked into this week from the CRM, with the handoff card the
 * manager filled (ТЗ §3.10, §4.3) — what the specialist needs before the
 * call. Prices and the sales chat never reach this view (ТЗ §4.8).
 */
export function WeekMeetings({ specialist, weekStart }: { specialist: string; weekStart: string }) {
  const { t } = useTranslation('psychologist');
  const meetings = useQuery({
    queryKey: schedulingKeys.meetings(specialist, weekStart),
    queryFn: () => schedulingApi.meetings(specialist, weekStart, addDays(weekStart, 6)),
  });
  const items = (meetings.data ?? []).filter((m) => m.status !== 'cancelled');

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
            return (
              <li key={meeting.id} className="rd-schedule-meeting">
                <div className="rd-schedule-meeting-head">
                  <strong>{when(meeting)}</strong>
                  <span>{t(`schedule.meetings.type.${meeting.type}`)}</span>
                </div>
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
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
