import { cn } from '@/shared/lib/cn';
import { Button } from '@/shared/ui/Button';
import type { RevealLeaf } from '@/shared/types';

interface RevealClusterProps {
  leaves: RevealLeaf[];
  onLike: (leaf: RevealLeaf) => void;
  onReject: (slug: string) => void;
}

// 2-3 near-tied finalists shown side by side as peers — no hero, no backups,
// visually distinct from RevealSingle's one-big-pick layout.
export function RevealCluster({ leaves, onLike, onReject }: RevealClusterProps) {
  return (
    <div>
      <p className="font-bold text-secondary text-caption mb-2 text-center">
        ⚖️ Несколько похожих вариантов — сравни их
      </p>
      <div className={cn('grid gap-3', leaves.length >= 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-2')}>
        {leaves.map(leaf => (
          <div
            key={leaf.slug}
            className="flex flex-col items-center text-center gap-3 p-4 rounded-xl border border-brand bg-active-tint/20"
          >
            <span className="font-bold text-primary text-subtitle">{leaf.name}</span>
            <div className="flex items-center gap-2">
              <Button size="sm" onClick={() => onLike(leaf)}>
                🔍 Узнать, подходит ли мне
              </Button>
              <button
                type="button"
                onClick={() => onReject(leaf.slug)}
                aria-label={`Не моё: ${leaf.name}`}
                className="w-8 h-8 flex items-center justify-center rounded-full text-danger hover:bg-danger-subtle transition-colors"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
