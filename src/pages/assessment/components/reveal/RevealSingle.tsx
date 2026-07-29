import { Button } from '@/shared/ui/Button';
import type { RevealLeaf } from '@/shared/types';

interface RevealSingleProps {
  leaf: RevealLeaf;
  backups: RevealLeaf[];
  onLike: (leaf: RevealLeaf) => void;
}

// One confident pick, shown large, with the spare alternatives listed small
// below it — visually distinct from RevealCluster's row of equal finalists.
// No per-card reject here: dismissing a leaf without trying it is now only
// possible via the shared "none of these" action in RevealFeedbackFooter
// (see that component's docstring for why a single silent ✕ was confusing).
export function RevealSingle({ leaf, backups, onLike }: RevealSingleProps) {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col items-center text-center gap-4 p-6 rounded-2xl border-2 border-brand bg-active-tint/30">
        <span
          className="font-extrabold text-brand tracking-[.08em] uppercase"
          style={{ fontSize: 12 }}
        >
          🏆 Вероятный вариант
        </span>
        <span className="font-black text-primary" style={{ fontSize: 26 }}>
          {leaf.name}
        </span>
        <Button size="sm" className="mt-1" onClick={() => onLike(leaf)}>
          🔍 Узнать, подходит ли мне
        </Button>
      </div>

      {backups.length > 0 && (
        <div>
          <p className="font-bold text-secondary text-caption mb-2">
            Ещё пара вариантов на заметку:
          </p>
          <div className="flex flex-col gap-2">
            {backups.map(backup => (
              <div
                key={backup.slug}
                className="flex items-center justify-between p-3 rounded-lg border-2 border-strong bg-surface/50"
              >
                <span className="font-semibold text-secondary">{backup.name}</span>
                <Button size="sm" variant="ghost" onClick={() => onLike(backup)}>
                  🔍 Узнать, подходит ли мне
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
