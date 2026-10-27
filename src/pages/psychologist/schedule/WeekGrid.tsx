import { useCallback, useEffect, useRef, useState, type CSSProperties, type MouseEvent, type PointerEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Lock } from 'lucide-react';
import { formatNumber } from '@/shared/i18n/format';
import { cn } from '@/shared/lib/cn';
import type { ScheduleEditableState, ScheduleMeeting, ScheduleSlot, ScheduleWeek } from '@/shared/types';
import { almatyMinutes, formatDayShort, formatDayNumber, formatWeekday, slotWallTime } from './scheduleDates';

interface WeekGridProps {
  week: ScheduleWeek;
  dayStart: string;
  slotMinutes: number;
  /** `YYYY-MM-DD` in Almaty, from the server. */
  today: string;
  /** Calls booked from the CRM, drawn over their slots. */
  meetings: ScheduleMeeting[];
  /** State the brush paints — previewed on the selection while dragging. */
  tool: ScheduleEditableState;
  isEditable: (slot: ScheduleSlot) => boolean;
  /** Called once per gesture with the slot starts the brush went over. */
  onPaint: (starts: Set<string>) => void;
  onOpenMeeting: (id: string) => void;
  busy: boolean;
  /** A picked, not yet saved interval (the second call), drawn like a call. */
  pending?: { start: string; end: string; label: string } | null;
  /** Picking a call's time, not painting availability: the freeze (which
   *  only limits availability edits) is not shown, nor the all-day row. */
  picking?: boolean;
}

const RUN_STATES = new Set(['free']);

/**
 * The week in the manner of Apple Calendar: 7 day columns on a hairline grid,
 * the time gutter on the left, an all-day row with the free time of each day,
 * today's date in a filled circle and the current time as a line. Drag across
 * editable slots (mouse or touch) to paint them with the current tool;
 * Enter/Space paints one slot. Neighbouring slots of one state join into a
 * block; calls from the CRM lie on top. Frozen and past slots stay inert for
 * the specialist — the server enforces the same rules, the grid only spares a
 * doomed request.
 */
export function WeekGrid({
  week,
  dayStart,
  slotMinutes,
  today,
  meetings,
  tool,
  isEditable,
  onPaint,
  onOpenMeeting,
  busy,
  pending = null,
  picking = false,
}: WeekGridProps) {
  const { t } = useTranslation('psychologist');
  const [selection, setSelectionState] = useState<Set<string>>(() => new Set());
  // Mirror of `selection` for the pointerup handler, which must read it once
  // and outside a state updater (StrictMode runs updaters twice).
  const selectionRef = useRef<Set<string>>(selection);
  const setSelection = useCallback((next: Set<string>) => {
    selectionRef.current = next;
    setSelectionState(next);
  }, []);
  const painting = useRef(false);
  const slotsByStart = useRef(new Map<string, ScheduleSlot>());
  slotsByStart.current = new Map(week.days.flatMap((day) => day.slots.map((slot) => [slot.start, slot] as const)));
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  const add = useCallback(
    (start: string | undefined) => {
      if (!start) return;
      const slot = slotsByStart.current.get(start);
      if (!slot || !isEditable(slot)) return;
      if (selectionRef.current.has(start)) return;
      setSelection(new Set(selectionRef.current).add(start));
    },
    [isEditable, setSelection],
  );

  // Finish the gesture wherever the pointer is released, even off the grid.
  useEffect(() => {
    function finish() {
      if (!painting.current) return;
      painting.current = false;
      const painted = selectionRef.current;
      setSelection(new Set());
      if (painted.size) onPaint(painted);
    }
    window.addEventListener('pointerup', finish);
    window.addEventListener('pointercancel', finish);
    return () => {
      window.removeEventListener('pointerup', finish);
      window.removeEventListener('pointercancel', finish);
    };
  }, [onPaint, setSelection]);

  function handlePointerDown(event: PointerEvent<HTMLButtonElement>, slot: ScheduleSlot) {
    if (busy || !isEditable(slot) || event.button !== 0) return;
    event.preventDefault();
    // Touch captures the pointer to the first cell; release it so the
    // move handler can find the cell under the finger.
    event.currentTarget.releasePointerCapture?.(event.pointerId);
    painting.current = true;
    setSelection(new Set([slot.start]));
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (!painting.current) return;
    const cell = document.elementFromPoint(event.clientX, event.clientY)?.closest<HTMLElement>('[data-slot]');
    add(cell?.dataset.slot);
  }

  function handleClick(event: MouseEvent<HTMLButtonElement>, slot: ScheduleSlot) {
    // detail === 0: keyboard activation. Pointer clicks are handled as a gesture.
    if (event.detail !== 0 || busy || !isEditable(slot)) return;
    onPaint(new Set([slot.start]));
  }

  const rows = week.days[0]?.slots.length ?? 0;
  const startMinutes = almatyMinutes(week.days[0]?.slots[0]?.start ?? '') ?? 0;
  const shown = (slot: ScheduleSlot | undefined) =>
    slot ? (selection.has(slot.start) ? tool : slot.state) : undefined;
  const todayIndex = week.days.findIndex((day) => day.date === today);
  const nowMinutes = almatyMinutes(new Date(now).toISOString()) ?? -1;
  const nowOffset = (nowMinutes - startMinutes) / slotMinutes;
  const showNow = todayIndex >= 0 && nowOffset >= 0 && nowOffset <= rows;

  return (
    <div
      className="rd-cal"
      style={{ '--days': week.days.length, '--rows': rows } as CSSProperties}
      onPointerMove={handlePointerMove}
      aria-busy={busy}
    >
      <div className="rd-cal-row rd-cal-head">
        <div className="rd-cal-corner" />
        {week.days.map((day, index) => (
          <div
            key={day.date}
            className={cn('rd-cal-dh', day.date === today && 'is-today', index >= 5 && 'is-weekend', day.past && 'is-past')}
          >
            <span className="rd-cal-dow">{formatWeekday(day.date)}</span>
            <span className="rd-cal-dnum">{formatDayNumber(day.date)}</span>
            {day.frozen && !picking && (
              <span className="rd-cal-lock" title={t('schedule.frozenHint')} aria-label={t('schedule.frozen')}>
                <Lock size={12} aria-hidden="true" />
              </span>
            )}
          </div>
        ))}
      </div>

      {!picking && <div className="rd-cal-row rd-cal-allday">
        <div className="rd-cal-ad-label">{t('schedule.allDay')}</div>
        {week.days.map((day, index) => {
          const free = day.slots.filter((slot) => slot.state === 'free' && !slot.past).length;
          const booked = day.slots.filter((slot) => slot.state === 'booked').length;
          return (
            <div key={day.date} className={cn('rd-cal-ad', index >= 5 && 'is-weekend')}>
              {day.frozen ? (
                <span className="rd-cal-chip is-frozen">{t('schedule.frozen')}</span>
              ) : free ? (
                <span className="rd-cal-chip is-free">
                  {t('schedule.freeHours', { hours: formatNumber((free * slotMinutes) / 60) })}
                </span>
              ) : (
                <span className="rd-cal-chip">{t('schedule.noFree')}</span>
              )}
              {booked > 0 && (
                <span className="rd-cal-chip is-booked">{t('schedule.bookedCount', { count: booked })}</span>
              )}
            </div>
          );
        })}
      </div>}

      <div className="rd-cal-row rd-cal-body">
        <div className="rd-cal-times" aria-hidden="true">
          {Array.from({ length: rows }, (_, row) => {
            const time = slotWallTime(dayStart, row, slotMinutes);
            return (
              <div key={time} className={cn('rd-cal-time', !time.endsWith(':00') && 'is-half')}>
                <span>{time}</span>
              </div>
            );
          })}
        </div>

        {week.days.map((day, index) => (
          <div
            key={day.date}
            className={cn('rd-cal-day', day.date === today && 'is-today', index >= 5 && 'is-weekend')}
          >
            {day.slots.map((slot, row) => {
              const state = shown(slot)!;
              const editable = isEditable(slot);
              const time = slotWallTime(dayStart, row, slotMinutes);
              const end = slotWallTime(dayStart, row + 1, slotMinutes);
              // Neighbouring slots of one state read as one block.
              const runStart = RUN_STATES.has(state) && shown(day.slots[row - 1]) !== state;
              const runEnd = RUN_STATES.has(state) && shown(day.slots[row + 1]) !== state;
              return (
                <button
                  key={slot.start}
                  type="button"
                  data-slot={slot.start}
                  className={cn(
                    'rd-cal-slot',
                    `is-${state}`,
                    !time.endsWith(':00') && 'is-half',
                    runStart && 'is-run-start',
                    runEnd && 'is-run-end',
                    slot.frozen && !picking && 'is-frozen',
                    slot.past && 'is-past',
                    selection.has(slot.start) && 'is-selected',
                  )}
                  aria-disabled={!editable}
                  title={t('schedule.cellTitle', { day: formatDayShort(day.date), from: time, to: end })}
                  aria-label={t('schedule.cellLabel', {
                    day: formatDayShort(day.date),
                    time,
                    state: t(`schedule.state.${slot.state}`),
                  })}
                  onPointerDown={(event) => handlePointerDown(event, slot)}
                  onClick={(event) => handleClick(event, slot)}
                >
                  {runStart && state === 'free' && <span className="rd-cal-slot-label">{t('schedule.tool.free')}</span>}
                </button>
              );
            })}

            {meetings
              .filter(
                (meeting) =>
                  meeting.status !== 'cancelled' &&
                  day.slots.some((slot) => Date.parse(slot.start) === Date.parse(meeting.start)),
              )
              .map((meeting) => {
                const from = (almatyMinutes(meeting.start)! - startMinutes) / slotMinutes;
                const length = (Date.parse(meeting.end) - Date.parse(meeting.start)) / 60_000 / slotMinutes;
                return (
                  <button
                    key={meeting.id}
                    type="button"
                    className={cn('rd-cal-ev', meeting.type === 'main60' && 'is-long', length <= 1 && 'is-short')}
                    style={{ '--from': from, '--len': length } as CSSProperties}
                    title={`${meeting.handoff.student_name} · ${t(`schedule.meetings.type.${meeting.type}`)}`}
                    onClick={() => onOpenMeeting(meeting.id)}
                  >
                    <b>{meeting.handoff.student_name}</b>
                    {length > 1 && <span>{t(`schedule.meetings.type.${meeting.type}`)}</span>}
                  </button>
                );
              })}

            {pending && day.slots.some((slot) => Date.parse(slot.start) === Date.parse(pending.start)) && (
              <span
                className="rd-cal-ev is-pending"
                style={
                  {
                    '--from': (almatyMinutes(pending.start)! - startMinutes) / slotMinutes,
                    '--len': (Date.parse(pending.end) - Date.parse(pending.start)) / 60_000 / slotMinutes,
                  } as CSSProperties
                }
              >
                <b>{pending.label}</b>
              </span>
            )}
          </div>
        ))}

        {showNow && (
          <div className="rd-cal-now" style={{ '--at': nowOffset, '--ti': todayIndex } as CSSProperties} aria-hidden="true">
            <span className="rd-cal-now-label">{slotWallTime('00:00', nowMinutes, 1)}</span>
            <i className="rd-cal-now-all" />
            <i className="rd-cal-now-today" />
          </div>
        )}
      </div>
    </div>
  );
}
