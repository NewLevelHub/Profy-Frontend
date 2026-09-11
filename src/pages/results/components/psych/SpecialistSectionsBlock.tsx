import type {
  PsychValiditySection,
  PsychEmotionalSection,
  PsychMacSection,
} from '@/shared/types';
import { ValiditySection } from './ValiditySection';
import { PsychoEmotionalSection } from './PsychoEmotionalSection';
import { MacSection } from './MacSection';

interface SpecialistSectionsBlockProps {
  validity?: PsychValiditySection | null;
  psychoemotional?: PsychEmotionalSection | null;
  mac?: PsychMacSection | null;
}

/**
 * Groups the three psych-block sections (шкала лжи / психоэмоциональный тест
 * / МАК) below the main report. Renders nothing while all three are
 * absent/`null`, so it never leaves an empty gap on the page.
 *
 * No wrapping heading/intro card here (dropped by product decision, PRO-321
 * rework): `report_service.psych_sections_for` now gates all three sections
 * to a psychologist/admin viewer only — a student never sees this block — so
 * a plaque explaining "these are supplementary, a psychologist reviews them"
 * was talking to the psychologist about the psychologist. Each section still
 * carries its own heading (ValiditySection/PsychoEmotionalSection/MacSection).
 *
 * Takes only the section objects as props — no `useResults`, no store — so
 * PRO-320 can drop it straight into the admin client-review screen, fed from
 * whatever payload that screen already has.
 */
export function SpecialistSectionsBlock({
  validity,
  psychoemotional,
  mac,
}: SpecialistSectionsBlockProps) {
  if (!validity && !psychoemotional && !mac) return null;

  return (
    <div className="flex flex-col gap-4">
      <ValiditySection section={validity} />
      <PsychoEmotionalSection section={psychoemotional} />
      <MacSection section={mac} />
    </div>
  );
}
