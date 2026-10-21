import { useCallback, useEffect, useRef, useState, type MouseEvent, type PointerEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Lock } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import type { ScheduleEditableState, ScheduleSlot, ScheduleWeek } from '@/shared/types';
import { formatDayShort, slotWallTime } from './scheduleDates';

interface WeekGridProps {
  week: ScheduleWeek;
  dayStart: string;
  slotMinutes: number;
  /** State the brush paints — previewed on the selection while dragging. */
  tool: ScheduleEditableState;
  isEditable: (slot: ScheduleSlot) => boolean;
  /** Called once per gesture with the slot starts the brush went over. */
  onPaint: (starts: Set<string>) => void;
  busy: boolean;
}

/**
 * The week as 7 columns × 30-minute rows. Drag across editable cells (mouse
 * or touch) to paint them with the current tool; Enter/Space paints one cell.
 * Frozen and past cells stay inert for the specialist — the server enforces
 * the same rules, the grid only spares a doomed request.
 */
export function WeekGrid({ week, dayStart, slotMinutes, tool, isEditable, onPaint, busy }: WeekGridProps) {
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

  function handlePointerMove(event: PointerEvent<HTMLTableElement>) {
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

  return (
    <div className="rd-schedule-scroll">
      <table className="rd-schedule-grid" onPointerMove={handlePointerMove} aria-busy={busy}>
        <thead>
          <tr>
            <th scope="col" className="rd-schedule-corner" />
            {week.days.map((day) => (
              <th key={day.date} scope="col" className={cn(day.frozen && 'is-frozen', day.past && 'is-past')}>
                <span>{formatDayShort(day.date)}</span>
                {day.frozen && (
                  <span className="rd-schedule-frozen" title={t('schedule.frozenHint')}>
                    <Lock size={12} aria-hidden="true" />
                    {t('schedule.frozen')}
                  </span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }, (_, row) => {
            const time = slotWallTime(dayStart, row, slotMinutes);
            const end = slotWallTime(dayStart, row + 1, slotMinutes);
            // Rows are 30 minutes: every row is labelled, the hour starts get
            // a stronger divider so the two halves of an hour read as a pair.
            const hourStart = time.endsWith(':00');
            return (
              <tr key={time} className={hourStart ? 'is-hour' : 'is-half'}>
                <th scope="row" className="rd-schedule-time">
                  {time}
                </th>
                {week.days.map((day) => {
                  const slot = day.slots[row];
                  const editable = isEditable(slot);
                  const shown = selection.has(slot.start) ? tool : slot.state;
                  return (
                    <td key={slot.start}>
                      <button
                        type="button"
                        data-slot={slot.start}
                        className={cn(
                          'rd-schedule-cell',
                          `is-${shown}`,
                          slot.frozen && 'is-frozen',
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
                      />
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
