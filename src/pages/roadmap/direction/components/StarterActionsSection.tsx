import { Card } from '@/shared/ui/Card';

interface StarterActionsSectionProps {
  actions: string[];
}

/** Concrete, solo-executable one-liners — from Direction.first_steps when
 * curated, or the model's on-the-fly fallback in the same style otherwise. */
export function StarterActionsSection({ actions }: StarterActionsSectionProps) {
  if (actions.length === 0) return null;

  return (
    <Card className="flex flex-col gap-4">
      <h2 className="text-label font-bold text-primary flex items-center gap-2">
        <span aria-hidden="true">🚀</span>
        Что можно начать уже сейчас
      </h2>
      <ul className="flex flex-col gap-3">
        {actions.map((action, i) => (
          <li key={i} className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-brand-subtle text-brand text-caption font-bold flex items-center justify-center mt-0.5">
              {i + 1}
            </span>
            <span className="text-body text-primary leading-relaxed">{action}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}
