import { Button } from '@/shared/ui/Button';
import type { RevealLeaf } from '@/shared/types';

interface RevealInconclusiveProps {
  strengths: string[];
  leaves: RevealLeaf[];
  onLike: (leaf: RevealLeaf) => void;
  onRetakeTest: () => void;
}

// The one true dead end: the question ceiling was hit without the engine
// ever converging (StopDecision.reason === "ceiling" — see
// akinator_report_service.build_reveal_report's "inconclusive" branch).
// Reads as an honest "couldn't pin it down" instead of a normal cluster's
// "a few close options, pick one" — no ✕ reject here, nothing left to
// re-derive from. Two ways out: retake the whole test fresh (onRetakeTest,
// offered right here since strengths/shortlist are exactly what makes "try
// again" feel worthwhile instead of a dead end), or finish with a comment
// (RevealFeedbackFooter's variant="final", rendered by the parent RevealCard).
export function RevealInconclusive({ strengths, leaves, onLike, onRetakeTest }: RevealInconclusiveProps) {
  return (
    <div className="flex flex-col gap-5">
      {strengths.length > 0 && (
        <div className="p-4 rounded-xl bg-brand-subtle flex flex-col gap-2">
          <p className="font-bold text-primary text-caption">Твои сильные стороны:</p>
          <ul className="flex flex-col gap-1">
            {strengths.map(strength => (
              <li key={strength} className="text-secondary font-medium text-caption">
                • {strength}
              </li>
            ))}
          </ul>
        </div>
      )}

      {leaves.length > 0 && (
        <div>
          <p className="font-bold text-secondary text-caption mb-2 text-center">
            Без обязательств — вот на что можно посмотреть:
          </p>
          <div className="flex flex-col gap-2">
            {leaves.map(leaf => (
              <div
                key={leaf.slug}
                className="flex items-center justify-between p-3 rounded-lg border border-default bg-surface/50"
              >
                <span className="font-semibold text-secondary">{leaf.name}</span>
                <Button size="sm" variant="ghost" onClick={() => onLike(leaf)}>
                  🔍 Узнать, подходит ли мне
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      <Button size="lg" className="w-full rounded-pill" onClick={onRetakeTest}>
        🔄 Пройти тест заново
      </Button>
    </div>
  );
}
