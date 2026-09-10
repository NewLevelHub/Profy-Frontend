import type { PsychEmotionalSection } from '@/shared/types';
import { PsychSectionShell } from './PsychSectionShell';

interface PsychoEmotionalSectionProps {
  section?: PsychEmotionalSection | null;
}

/**
 * «Психоэмоциональный тест» (МЦВ Собчик — the name «Люшер» is never shown,
 * PRO-282 §4). Phase-0 slot (PRO-292): `null` → nothing; present → placeholder
 * shell. Фаза 2 (PRO-307…309) passes the metrics + the fixed "шкала взрослая,
 * ориентировочно" note into the shell's body. Section-object prop only, so
 * PRO-320 reuses it in the admin screen.
 */
export function PsychoEmotionalSection({ section }: PsychoEmotionalSectionProps) {
  if (!section) return null;

  return (
    <PsychSectionShell emoji="🎨" title="Психоэмоциональный тест" />
  );
}
