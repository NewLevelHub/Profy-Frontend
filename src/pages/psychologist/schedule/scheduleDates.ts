// Calendar arithmetic for the schedule. Days are `YYYY-MM-DD` Asia/Almaty
// dates, exactly as the API sends them; the server owns "today" and the
// freeze (`GET /scheduling/config`), never the browser clock.
import { formatDate } from '@/shared/i18n/format';
import type { ScheduleDay, ScheduleEditableState, ScheduleTemplate, ScheduleWeek } from '@/shared/types';

const SCHEDULE_TIMEZONE = 'Asia/Almaty';

function parseDay(day: string): Date {
  return new Date(`${day}T00:00:00Z`);
}

export function addDays(day: string, days: number): string {
  const date = parseDay(day);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

/** Monday of the week `day` is in. */
export function mondayOf(day: string): string {
  const weekday = (parseDay(day).getUTCDay() + 6) % 7;
  return addDays(day, -weekday);
}

/** Which week to open first: from Friday on, the week to fill is the next one. */
export function defaultWeek(today: string): string {
  const weekday = (parseDay(today).getUTCDay() + 6) % 7;
  return addDays(mondayOf(today), weekday >= 4 ? 7 : 0);
}

/** Noon in Almaty — a moment that formats as `day` in any viewer timezone. */
function almatyNoon(day: string): Date {
  return new Date(`${day}T12:00:00+05:00`);
}

export function formatDayShort(day: string): string {
  return formatDate(almatyNoon(day), { weekday: 'short', day: 'numeric', timeZone: SCHEDULE_TIMEZONE });
}

export function formatWeekRange(monday: string): string {
  const sunday = addDays(monday, 6);
  const from = formatDate(almatyNoon(monday), { day: 'numeric', month: 'long', timeZone: SCHEDULE_TIMEZONE });
  const to = formatDate(almatyNoon(sunday), { day: 'numeric', month: 'long', year: 'numeric', timeZone: SCHEDULE_TIMEZONE });
  return `${from} – ${to}`;
}

/** `HH:MM` of the n-th slot of a day — machine time, not locale copy. */
export function slotWallTime(dayStart: string, index: number, slotMinutes: number): string {
  const [hours, minutes] = dayStart.split(':').map(Number);
  const total = hours * 60 + minutes + index * slotMinutes;
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}

/** The week as a reusable template: runs of equal free/personal slots per weekday. */
export function weekToTemplate(week: ScheduleWeek, dayStart: string, slotMinutes: number): ScheduleTemplate {
  const days: ScheduleTemplate['days'] = {};
  week.days.forEach((day: ScheduleDay, dayIndex) => {
    const intervals: ScheduleTemplate['days'][string] = [];
    let run: { start: number; state: 'free' | 'personal' } | null = null;
    const close = (end: number) => {
      if (!run) return;
      intervals.push({
        start: slotWallTime(dayStart, run.start, slotMinutes),
        end: slotWallTime(dayStart, end, slotMinutes),
        state: run.state,
      });
      run = null;
    };
    day.slots.forEach((slot, index) => {
      const state = slot.state === 'free' || slot.state === 'personal' ? slot.state : null;
      if (run && run.state !== state) close(index);
      if (state && !run) run = { start: index, state };
    });
    close(day.slots.length);
    days[String(dayIndex + 1)] = intervals;
  });
  return { days };
}

/** Slot starts grouped into contiguous same-day runs, each one change. */
export function toChanges(
  week: ScheduleWeek,
  selected: ReadonlySet<string>,
  state: ScheduleEditableState,
) {
  const changes: { start: string; end: string; state: ScheduleEditableState }[] = [];
  for (const day of week.days) {
    let open: { start: string; end: string } | null = null;
    for (const slot of day.slots) {
      if (selected.has(slot.start)) {
        if (open) open.end = slot.end;
        else open = { start: slot.start, end: slot.end };
      } else if (open) {
        changes.push({ ...open, state });
        open = null;
      }
    }
    if (open) changes.push({ ...open, state });
  }
  return changes;
}
