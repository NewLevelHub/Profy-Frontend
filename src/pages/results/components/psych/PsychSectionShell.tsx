import type { ReactNode } from 'react';
import { Card } from '@/shared/ui/Card';
import { SectionHeading } from '@/shared/ui/SectionHeading';

interface PsychSectionShellProps {
  emoji: string;
  title: string;
  /** Section body. Omitted in the Phase-0 skeleton → the "appears later"
   *  placeholder is shown instead; Фазы 1/2/3 pass their real content. */
  children?: ReactNode;
}

const PLACEHOLDER = 'Раздел появится позже — блок ещё в разработке.';

/**
 * Shared frame for the three psych-block sections — same heading + card
 * shell so ValiditySection / PsychoEmotionalSection / MacSection only carry
 * their own emoji/title and (later) their own body.
 */
export function PsychSectionShell({ emoji, title, children }: PsychSectionShellProps) {
  return (
    <section aria-label={title}>
      <SectionHeading emoji={emoji} title={title} as="h3" />
      <Card className="flex flex-col gap-2">
        {children ?? (
          <p className="text-body text-secondary leading-relaxed">{PLACEHOLDER}</p>
        )}
      </Card>
    </section>
  );
}
