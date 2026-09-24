import type { PsychEmotionalSection } from '@/shared/types';
import { PsychoEmotionalSection } from './PsychoEmotionalSection';

interface SpecialistSectionsBlockProps {

  psychoemotional?: PsychEmotionalSection | null;
}

/**
 * Groups the two psych-block sections (шкала лжи / психоэмоциональный тест)
 * below the main report. Renders nothing while both are absent/`null`, so it
 * never leaves an empty gap on the page.
 *
 * No wrapping heading/intro card here (dropped by product decision, PRO-321
 * rework): `report_service.psych_sections_for` now gates both sections
 * to a psychologist/admin viewer only — a student never sees this block — so
 * a plaque explaining "these are supplementary, a psychologist reviews them"
 * was talking to the psychologist about the psychologist. Each section still
 * carries its own heading (ValiditySection/PsychoEmotionalSection).
 *
 * Takes only the section objects as props — no `useResults`, no store — so
 * PRO-320 can drop it straight into the admin client-review screen, fed from
 * whatever payload that screen already has.
 */
export function SpecialistSectionsBlock({

  psychoemotional,
}: SpecialistSectionsBlockProps) {
  if (!psychoemotional) return null;

  return (
    <div className="flex flex-col gap-4">

      <PsychoEmotionalSection section={psychoemotional} />
    </div>
  );
}
