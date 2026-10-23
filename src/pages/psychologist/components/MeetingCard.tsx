import { useState } from 'react';
import { Link } from 'react-router';
import { useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { apiErrorCode } from '@/shared/api/client';
import { schedulingApi } from '@/shared/api/scheduling';
import { formatDate } from '@/shared/i18n/format';
import { Button } from '@/shared/ui/Button';
import type { ScheduleMeeting, ScheduleMeetingMark } from '@/shared/types';

const KNOWN_ERRORS = ['meeting_not_started', 'meeting_cancelled'];
const TIMEZONE = 'Asia/Almaty';

function when(meeting: ScheduleMeeting): string {
  const day = formatDate(meeting.start, { weekday: 'short', day: 'numeric', month: 'long', timeZone: TIMEZONE });
  const time = (value: string) => formatDate(value, { hour: '2-digit', minute: '2-digit', timeZone: TIMEZONE });
  return `${day}, ${time(meeting.start)}–${time(meeting.end)}`;
}

/**
 * One call with the handoff card the manager filled (ТЗ §3.10, §4.3) — what
 * the specialist needs before the call; prices and the sales chat never reach
 * it (ТЗ §4.8). The specialist marks it: confirmed, and after the start held
 * or no-show (ТЗ §4.5); the CRM sees the status at once — a held second call
 * is «Разбор проведён».
 */
export function MeetingCard({
  meeting,
  specialist,
  onMarked,
  showStudentLink = false,
}: {
  meeting: ScheduleMeeting;
  specialist: string;
  onMarked: () => void;
  /** «Созвоны» links the student card; the owner's schedule does not. */
  showStudentLink?: boolean;
}) {
  const { t } = useTranslation('psychologist');
  const [failed, setFailed] = useState<string | null>(null);
  const mark = useMutation({
    mutationFn: (status: ScheduleMeetingMark) => schedulingApi.setMeetingStatus(specialist, meeting.id, status),
    onMutate: () => setFailed(null),
    onSuccess: onMarked,
    onError: (error) => {
      const code = apiErrorCode(error);
      setFailed(t(code && KNOWN_ERRORS.includes(code) ? `schedule.meetings.errors.${code}` : 'schedule.meetings.errors.generic'));
    },
  });

  const h = meeting.handoff;
  const started = Date.now() >= Date.parse(meeting.start);
  const busy = mark.isPending;
  const kind = meeting.call ? t(`calls.kind.${meeting.call}`) : t(`schedule.meetings.type.${meeting.type}`);

  return (
    <li id={`meeting-${meeting.id}`} className="rd-schedule-meeting">
      <div className="rd-schedule-meeting-head">
        <strong>{when(meeting)}</strong>
        <span>{kind}</span>
      </div>
      <p className={`rd-schedule-meeting-status is-${meeting.status}`}>{t(`schedule.meetings.status.${meeting.status}`)}</p>
      <p>
        <strong>{h.student_name}</strong>
        {' · '}
        {t('schedule.meetings.student', {
          age: h.age,
          grade: h.grade,
          gender: t(`schedule.meetings.gender.${h.gender}`),
        })}
        {showStudentLink && meeting.student_id && (
          <>
            {' · '}
            <Link to={`/psychologist/students/${meeting.student_id}`} className="text-brand underline underline-offset-4">
              {t('calls.studentCard')}
            </Link>
          </>
        )}
      </p>
      <dl>
        <dt>{t('schedule.meetings.request')}</dt>
        <dd>{h.family_request}</dd>
        <dt>{t('schedule.meetings.tariff')}</dt>
        <dd>{h.tariff}</dd>
        <dt>{t('schedule.meetings.language')}</dt>
        <dd>
          {t(`schedule.meetings.lang.${h.study_language}`)} · {t(`schedule.meetings.russian.${h.russian_level}`)}
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
      {meeting.status !== 'cancelled' && (
        <div className="rd-schedule-meeting-actions">
          {meeting.status === 'pending' && (
            <Button variant="ghost" size="sm" muteSound disabled={busy} onClick={() => mark.mutate('confirmed')}>
              {t('schedule.meetings.actions.confirm')}
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            muteSound
            disabled={busy || !started || meeting.status === 'done'}
            onClick={() => mark.mutate('done')}
          >
            {t('schedule.meetings.actions.done')}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            muteSound
            disabled={busy || !started || meeting.status === 'no_show'}
            onClick={() => mark.mutate('no_show')}
          >
            {t('schedule.meetings.actions.noShow')}
          </Button>
        </div>
      )}
      {!started && meeting.status !== 'cancelled' && <p className="rd-schedule-hint">{t('schedule.meetings.afterStart')}</p>}
      {failed && (
        <p className="rd-schedule-notice" role="alert">
          {failed}
        </p>
      )}
    </li>
  );
}
