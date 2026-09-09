import type { PsychMacSection } from '@/shared/types';
import { PsychSectionShell } from './PsychSectionShell';

interface MacSectionProps {
  section?: PsychMacSection | null;
}

/**
 * МАК — метафорические ассоциативные карты. No scoring, no AI (PRO-282 §4).
 * Phase-0 slot (PRO-292): `null` → nothing; present → placeholder shell.
 * Фаза 3 (PRO-314…318) passes the "стимул → карта → тексты" feed into the
 * shell's body. Section-object prop only, so PRO-320 reuses it in the admin
 * screen.
 */
export function MacSection({ section }: MacSectionProps) {
  if (!section) return null;

  return (
    <PsychSectionShell
      emoji="🃏"
      title="Метафорические карты"
      consentOk={section.consent_ok}
    />
  );
}
