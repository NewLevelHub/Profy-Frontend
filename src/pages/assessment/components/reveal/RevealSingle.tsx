import { Button } from '@/shared/ui/Button';
import type { RevealLeaf } from '@/shared/types';

interface RevealSingleProps {
  leaf: RevealLeaf;
  backups: RevealLeaf[];
  onLike: (leaf: RevealLeaf) => void;
  onReject: (slug: string) => void;
}

// One confident pick, shown large, with the spare alternatives listed small
// below it — visually distinct from RevealCluster's row of equal finalists.
export function RevealSingle({ leaf, backups, onLike, onReject }: RevealSingleProps) {
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
        <div className="flex items-center gap-3 mt-1">
          <Button size="sm" onClick={() => onLike(leaf)}>
            🔍 Узнать, подходит ли мне
          </Button>
          <button
            type="button"
            onClick={() => onReject(leaf.slug)}
            aria-label={`Не моё: ${leaf.name}`}
            className="w-9 h-9 flex items-center justify-center rounded-full text-danger hover:bg-danger-subtle transition-colors"
          >
            ✕
          </button>
        </div>
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
                className="flex items-center justify-between p-3 rounded-lg border border-default bg-surface/50"
              >
                <span className="font-semibold text-secondary">{backup.name}</span>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="ghost" onClick={() => onLike(backup)}>
                    🔍 Узнать, подходит ли мне
                  </Button>
                  <button
                    type="button"
                    onClick={() => onReject(backup.slug)}
                    aria-label={`Не моё: ${backup.name}`}
                    className="w-8 h-8 flex items-center justify-center rounded-full text-danger hover:bg-danger-subtle transition-colors"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
