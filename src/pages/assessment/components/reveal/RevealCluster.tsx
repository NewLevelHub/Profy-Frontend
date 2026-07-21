import { cn } from '@/shared/lib/cn';
import { Button } from '@/shared/ui/Button';
import type { RevealLeaf } from '@/shared/types';

interface RevealClusterProps {
  leaves: RevealLeaf[];
  strengths: string[];
  onLike: (leaf: RevealLeaf) => void;
}

// 2-3 near-tied finalists shown side by side as peers — no hero, no backups,
// visually distinct from RevealSingle's one-big-pick layout. No per-card
// reject: picking one off this list without trying it isn't offered — see
// RevealFeedbackFooter's shared "none of these" action instead.
export function RevealCluster({ leaves, strengths, onLike }: RevealClusterProps) {
  return (
    <div className="flex flex-col gap-5">
      {strengths.length > 0 ? (
        <div className="p-4 rounded-xl bg-brand-subtle flex flex-col gap-2">
          <p className="font-bold text-primary text-caption">Твои сильные стороны:</p>
          <ul className="flex flex-col gap-1">
            {strengths.map(strength => (
              <li key={strength} className="text-secondary font-medium text-caption">
                • {strength}
              </li>
            ))}
          </ul>
          <p className="text-secondary font-medium text-caption">
            Из-за этого эти варианты вышли примерно на равных — сравни их:
          </p>
        </div>
      ) : (
        <p className="font-bold text-secondary text-caption text-center">
          ⚖️ Несколько похожих вариантов — сравни их
        </p>
      )}

      <div className={cn('grid gap-3', leaves.length >= 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-2')}>
        {leaves.map(leaf => (
          <div
            key={leaf.slug}
            className="flex flex-col items-center text-center gap-2 p-4 rounded-xl border border-brand bg-active-tint/20"
          >
            <span className="font-bold text-primary text-subtitle">{leaf.name}</span>
            {leaf.description && (
              <p className="text-secondary font-medium text-caption leading-relaxed">
                {leaf.description}
              </p>
            )}
            <Button size="sm" className="mt-1" onClick={() => onLike(leaf)}>
              🔍 Узнать, подходит ли мне
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
