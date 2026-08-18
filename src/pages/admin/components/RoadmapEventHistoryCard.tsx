import { MONO_LABEL, MONO_MUTE } from '@/shared/ui/admin/density';

/**
 * Roadmap event history: date / event / horizon / source (e.g. "user" vs.
 * "gen v4.2"), with a Clay-colored row reserved for a generation-failure
 * event — one of Clay's explicitly-allowed 4 error cases in this system.
 *
 * BACKEND GAP: `RoadmapMilestone` (see shared/types) only carries
 * `horizon` / `title` / `tasks` — a *current-state* snapshot, not a dated
 * event log. There is no `date`, no `source`, and no history of past
 * generations (successful or failed) anywhere in `AdminAssessmentDetail`.
 * Rendering the real table shape with an honest empty state (same pattern as
 * `ChangeLogTable`) rather than inventing event rows or a fake failure.
 */
export function RoadmapEventHistoryCard() {
  return (
    <div className="space-y-2">
      <div className="overflow-x-auto">
        <table className="w-full text-caption leading-[1.35]">
          <thead className="bg-raised border-b border-default">
            <tr>
              <th className={`px-2 py-1.5 text-left ${MONO_LABEL} text-muted`}>ДАТА</th>
              <th className={`px-2 py-1.5 text-left ${MONO_LABEL} text-muted`}>СОБЫТИЕ</th>
              <th className={`px-2 py-1.5 text-left ${MONO_LABEL} text-muted`}>ГОРИЗОНТ</th>
              <th className={`px-2 py-1.5 text-left ${MONO_LABEL} text-muted`}>ИСТОЧНИК</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={4} className="px-2 py-3 text-secondary font-semibold">
                История событий roadmap не ведётся — бэкенд отдаёт только текущий
                снимок вех (без даты/источника/лога генераций)
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
