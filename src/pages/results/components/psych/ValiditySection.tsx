import type { PsychValiditySection } from '@/shared/types';
import { PsychSectionShell } from './PsychSectionShell';

interface ValiditySectionProps {
  section?: PsychValiditySection | null;
}

/**
 * «Достоверность протокола» ("шкала лжи"). Phase-0 slot (PRO-292): a `null`
 * section renders nothing; a present one shows the placeholder shell. Фаза 1
 * (PRO-296…300) passes the traffic-light indicator + breakdown into the
 * shell's body. Takes only the section object as a prop — no hook/store
 * coupling — so PRO-320 can render it in the admin client-review screen too.
 */
export function ValiditySection({ section }: ValiditySectionProps) {
  if (!section) return null;

  return (
    <PsychSectionShell
      emoji="🛡️"
      title="Достоверность протокола"
      consentOk={section.consent_ok}
    />
  );
}
