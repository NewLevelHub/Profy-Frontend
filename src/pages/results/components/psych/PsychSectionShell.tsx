import type { ReactNode } from 'react';
import { Card } from '@/shared/ui/Card';

interface PsychSectionShellProps {
  title: string;
  /** Section body. Omitted in the Phase-0 skeleton → the "appears later"
   *  placeholder is shown instead; Фазы 1/2/3 pass their real content. */
  children?: ReactNode;
}

const PLACEHOLDER = 'Раздел появится позже — блок ещё в разработке.';

/**
 * Shared frame for the three psych-block sections — same heading + card
 * shell so ValiditySection / PsychoEmotionalSection / MacSection only carry
 * their own title and body. Title uses the same mono-caps kicker recipe as
 * the rest of /result's report sections (e.g. "НАПРАВЛЕНИЯ ПОД ЦЕЛЬ" in
 * ScenarioProfessional.tsx) instead of the emoji + <SectionHeading> style
 * used by the profile-facing cards elsewhere on the page — these three are
 * specialist-only and read as report sections, not student-facing cards.
 */
export function PsychSectionShell({ title, children }: PsychSectionShellProps) {
  return (
    <section aria-label={title}>
      <p className="text-label font-bold text-primary font-mono uppercase tracking-label mb-4">
        {title}
      </p>
      <Card className="flex flex-col gap-2">
        {children ?? (
          <p className="text-body text-secondary leading-relaxed">{PLACEHOLDER}</p>
        )}
      </Card>
    </section>
  );
}
