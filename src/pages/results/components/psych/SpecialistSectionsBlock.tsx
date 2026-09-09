import type {
  PsychValiditySection,
  PsychEmotionalSection,
  PsychMacSection,
} from '@/shared/types';
import { Card } from '@/shared/ui/Card';
import { SectionHeading } from '@/shared/ui/SectionHeading';
import { ValiditySection } from './ValiditySection';
import { PsychoEmotionalSection } from './PsychoEmotionalSection';
import { MacSection } from './MacSection';

interface SpecialistSectionsBlockProps {
  validity?: PsychValiditySection | null;
  psychoemotional?: PsychEmotionalSection | null;
  mac?: PsychMacSection | null;
}

const INTRO =
  'Эти разделы — вспомогательные, их разбирает психолог на встрече. ' +
  'Вероятностные оценки, не заключение.';

/**
 * "Дополнительно для специалиста" — the single block that groups the three
 * psych-block sections (шкала лжи / психоэмоциональный тест / МАК) below the
 * main report. Renders nothing while all three sections are absent/`null`
 * (the Phase-0 state — see PRO-292), so it never leaves an empty heading on
 * the page.
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
    <section aria-label="Дополнительно для специалиста" className="flex flex-col gap-4">
      <SectionHeading emoji="🧑‍⚕️" title="Дополнительно для специалиста" />
      <Card className="bg-brand-subtle">
        <p className="text-caption text-secondary leading-snug">{INTRO}</p>
      </Card>
      <ValiditySection section={validity} />
      <PsychoEmotionalSection section={psychoemotional} />
      <MacSection section={mac} />
    </section>
  );
}
