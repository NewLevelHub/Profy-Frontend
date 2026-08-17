import { Card } from '@/shared/ui/Card';
import { Spine } from '@/shared/ui/Spine';
import type { AttemptHistoryEntry } from '@/shared/types';

export interface AttemptHistorySectionProps {
  entries: AttemptHistoryEntry[];
}

/**
 * "ИСТОРИЯ ПРОХОЖДЕНИЙ" — no assessment-history-list endpoint exists anywhere
 * in `src/shared/api/`, and `useAssessmentStore` only ever tracks one
 * current/most-recent run (a restart overwrites it in place), so there is no
 * real plural "history" this app can derive today — not even a single real
 * entry, since "most recent run" isn't the same claim as "history of past
 * attempts". `entries` is always `[]` until a real backend list endpoint
 * exists; this renders a genuine empty state instead of fabricating rows.
 */
export function AttemptHistorySection({ entries }: AttemptHistorySectionProps) {
  return (
    <div>
      <p className="font-mono text-tiny font-bold uppercase tracking-[.06em] text-muted mb-3">
        ИСТОРИЯ ПРОХОЖДЕНИЙ
      </p>

      {entries.length === 0 ? (
        <Card>
          <Spine
            nodes={[{ id: 'placeholder', status: 'upcoming' }]}
            ariaLabel="История прохождений пока не ведётся"
            className="mb-4 opacity-60"
          />
          <p className="text-body text-secondary">
            История прохождений пока недоступна — появится здесь, когда мы сможем показывать
            прошлые попытки.
          </p>
        </Card>
      ) : (
        <>
          <Spine
            nodes={entries.map((entry, i) => ({
              id: entry.id,
              status: i === entries.length - 1 ? 'current' : 'done',
            }))}
            ariaLabel="История прохождений"
            className="mb-5"
          />
          <div className="flex flex-col gap-2.5">
            {entries.map((entry) => (
              <Card key={entry.id} className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-label font-bold text-primary">{entry.description}</p>
                  <p className="text-caption text-secondary mt-0.5">
                    {new Date(entry.completed_at).toLocaleDateString('ru-RU', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
