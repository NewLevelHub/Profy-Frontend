import { useState } from 'react';
import { Link } from 'react-router';
import { useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { apiErrorCode } from '@/shared/api/client';
import { schedulingApi } from '@/shared/api/scheduling';
import { formatDate } from '@/shared/i18n/format';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import type { ScheduleMeeting, ScheduleMeetingMark } from '@/shared/types';
import { CallTimePicker } from './CallTimePicker';

const KNOWN_ERRORS = ['meeting_not_started', 'meeting_cancelled', 'meeting_started', 'slot_taken', 'slot_in_past'];
const REASON_MIN = 3;
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
  canChange = false,
}: {
  meeting: ScheduleMeeting;
  specialist: string;
  onMarked: () => void;
  /** «Созвоны» links the student card; the owner's schedule does not. */
  showStudentLink?: boolean;
  /** The specialist moves and cancels their own calls (in «Созвоны»). */
  canChange?: boolean;
}) {
  const { t } = useTranslation('psychologist');
  const [failed, setFailed] = useState<string | null>(null);
  const [change, setChange] = useState<'move' | 'cancel' | null>(null);
  const [reason, setReason] = useState('');
  const reasonOk = reason.trim().length >= REASON_MIN;
  const fail = (error: unknown) => {
    const code = apiErrorCode(error);
    setFailed(t(code && KNOWN_ERRORS.includes(code) ? `schedule.meetings.errors.${code}` : 'schedule.meetings.errors.generic'));
  };
  const done = () => {
    setChange(null);
    setReason('');
    onMarked();
  };
  const move = useMutation({
    mutationFn: (start: string) => schedulingApi.rescheduleMeeting(specialist, meeting.id, start, reason.trim()),
    onMutate: () => setFailed(null),
    onSuccess: done,
    onError: fail,
  });
  const cancel = useMutation({
    mutationFn: () => schedulingApi.cancelMeeting(specialist, meeting.id, reason.trim()),
    onMutate: () => setFailed(null),
    onSuccess: done,
    onError: fail,
  });
  const mark = useMutation({
    mutationFn: (status: ScheduleMeetingMark) => schedulingApi.setMeetingStatus(specialist, meeting.id, status),
    onMutate: () => setFailed(null),
    onSuccess: onMarked,
    onError: fail,
  });

  const h = meeting.handoff;
  const started = Date.now() >= Date.parse(meeting.start);
  const busy = mark.isPending || move.isPending || cancel.isPending;
  const changeable = canChange && !started && (meeting.status === 'pending' || meeting.status === 'confirmed');
  const minutes = Math.round((Date.parse(meeting.end) - Date.parse(meeting.start)) / 60_000);
  const reasonField = (
    <div className="min-w-64 flex-1">
      <Input
        label={t('calls.reason')}
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder={t('calls.reasonPlaceholder')}
        hint={reasonOk ? undefined : t('calls.reasonNeeded')}
        maxLength={1000}
      />
    </div>
  );
  const kind = meeting.call ? t(`calls.kind.${meeting.call}`) : t(`schedule.meetings.type.${meeting.type}`);

  return (
    <li id={`meeting-${meeting.id}`} className={change === 'move' ? 'rd-schedule-meeting is-wide' : 'rd-schedule-meeting'}>
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
      {changeable && !change && (
        <div className="rd-schedule-meeting-actions">
          <Button variant="text" size="sm" muteSound onClick={() => setChange('move')}>
            {t('calls.move')}
          </Button>
          <Button variant="text" size="sm" muteSound onClick={() => setChange('cancel')}>
            {t('calls.cancel')}
          </Button>
        </div>
      )}
      {changeable && change && (
        <div className="flex flex-col gap-3 mt-3">
          {change === 'move' ? (
            <CallTimePicker
              minutes={minutes}
              label={t('calls.newTime')}
              confirmLabel={t('calls.moveConfirm')}
              onConfirm={(start) => move.mutate(start)}
              saving={move.isPending}
              canConfirm={reasonOk}
              moving={meeting.id}
              // The reason sits by the button it unlocks, not above the grid.
              footer={reasonField}
            />
          ) : (
            <>
              {reasonField}
              <Button variant="ghost" size="sm" muteSound isLoading={cancel.isPending} disabled={!reasonOk} onClick={() => cancel.mutate()}>
                {t('calls.cancelConfirm')}
              </Button>
            </>
          )}
          <Button variant="text" size="sm" muteSound disabled={busy} onClick={() => setChange(null)}>
            {t('calls.keep')}
          </Button>
        </div>
      )}
      {failed && (
        <p className="rd-schedule-notice" role="alert">
          {failed}
        </p>
      )}
    </li>
  );
}
