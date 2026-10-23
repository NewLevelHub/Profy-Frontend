import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { formatDate } from '@/shared/i18n/format';
import { Button } from '@/shared/ui/Button';
import type { ScheduleSlot } from '@/shared/types';
import { addDays, formatWeekRange, mondayOf } from '../schedule/scheduleDates';
import { useScheduleConfig, useScheduleWeek, useWeekMeetings } from '../schedule/useSchedule';
import { WeekGrid } from '../schedule/WeekGrid';

function wallTime(value: string): string {
  return formatDate(value, { weekday: 'short', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Almaty' });
}

/**
 * The specialist's own week, the same grid as «Расписание»: a click on a
 * time picks a call of `minutes` from there — over the specialist's other
 * calls it cannot, the past neither. Any time is allowed, free or closed:
 * the call takes it in the schedule once saved. Sets the second call and
 * moves a call (`moving` — its own time counts as free).
 */
export function CallTimePicker({
  minutes,
  label,
  confirmLabel,
  onConfirm,
  saving,
  canConfirm = true,
  moving,
}: {
  minutes: number;
  /** On the picked block, e.g. «Второй созвон». */
  label: string;
  confirmLabel: string;
  onConfirm: (start: string) => void;
  saving: boolean;
  /** False keeps the confirm button off (e.g. no reason yet). */
  canConfirm?: boolean;
  /** The call being moved: its own slots are not in the way. */
  moving?: string;
}) {
  const { t } = useTranslation('psychologist');
  const config = useScheduleConfig();
  const today = config.data?.today;
  const [week, setWeek] = useState<string | undefined>(undefined);
  const weekStart = week ?? (today ? mondayOf(today) : undefined);
  const days = useScheduleWeek('me', weekStart);
  const meetings = useWeekMeetings('me', weekStart);
  const [picked, setPicked] = useState<string | null>(null);

  const steps = config.data ? Math.max(1, Math.round(minutes / config.data.slot_minutes)) : 2;
  const taken = useCallback(
    (slot: ScheduleSlot) => slot.state === 'booked' && slot.meeting?.id !== moving,
    [moving],
  );
  // The call from `slot` fits the day and none of its slots holds another call.
  const isEditable = useCallback(
    (slot: ScheduleSlot) => {
      if (slot.past || taken(slot)) return false;
      const day = days.data?.days.find((d) => d.slots.includes(slot));
      if (!day) return false;
      const from = day.slots.indexOf(slot);
      const span = day.slots.slice(from, from + steps);
      return span.length === steps && span.every((s) => !s.past && !taken(s));
    },
    [days.data, steps, taken],
  );
  const onPaint = useCallback(
    (starts: Set<string>) => {
      const first = [...starts].sort()[0];
      if (first) setPicked(first);
    },
    [],
  );

  const pickedEnd = picked ? new Date(Date.parse(picked) + minutes * 60_000).toISOString() : null;

  return (
    <div className="flex flex-col gap-3">
      <div className="rd-cal-header">
        {weekStart && <span className="rd-cal-range">{formatWeekRange(weekStart)}</span>}
        <div className="rd-cal-nav">
          <button
            type="button"
            className="rd-cal-arrow"
            aria-label={t('schedule.prevWeek')}
            disabled={!weekStart || (today ? weekStart <= mondayOf(today) : true)}
            onClick={() => weekStart && setWeek(addDays(weekStart, -7))}
          >
            <ChevronLeft size={20} />
          </button>
          <button type="button" className="rd-cal-today" disabled={!today} onClick={() => setWeek(undefined)}>
            {t('schedule.today')}
          </button>
          <button
            type="button"
            className="rd-cal-arrow"
            aria-label={t('schedule.nextWeek')}
            disabled={!weekStart}
            onClick={() => weekStart && setWeek(addDays(weekStart, 7))}
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
      <p className="rd-schedule-notice m-0">{t('detail.calls.pickHint', { minutes })}</p>
      {days.data && config.data ? (
        <WeekGrid
          week={days.data}
          dayStart={config.data.day_start}
          slotMinutes={config.data.slot_minutes}
          today={config.data.today}
          meetings={meetings.data ?? []}
          tool="free"
          isEditable={isEditable}
          onPaint={onPaint}
          onOpenMeeting={() => undefined}
          busy={saving}
          picking
          pending={picked && pickedEnd ? { start: picked, end: pickedEnd, label } : null}
        />
      ) : (
        <div className="rd-cal-loading" />
      )}
      {picked && (
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-heading">{t('detail.calls.pickedAt', { time: wallTime(picked), minutes })}</span>
          <Button size="md" muteSound isLoading={saving} disabled={!canConfirm} onClick={() => onConfirm(picked)}>
            {confirmLabel}
          </Button>
          <Button variant="text" size="md" muteSound disabled={saving} onClick={() => setPicked(null)}>
            {t('detail.calls.cancelPick')}
          </Button>
        </div>
      )}
    </div>
  );
}
