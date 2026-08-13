import { Card } from '@/shared/ui/Card';
import { SectionHeading } from '@/shared/ui/SectionHeading';
import type { StudentPersonalityNote } from '@/shared/types';

interface PersonalitySectionProps {
  notes: StudentPersonalityNote[];
  note: string;
}

// Always exactly 5 items, one per Big Five domain (contract §4.3a) — unlike
// StrengthCardsSection/ThinkingStyleSection, this never renders empty.
export function PersonalitySection({ notes, note }: PersonalitySectionProps) {
  return (
    <section aria-label="Твой характер">
      <SectionHeading emoji="🌟" title="Твой характер" />
      {note && <p className="text-body text-secondary mb-3">{note}</p>}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {notes.map(note => (
          <Card key={note.trait} className="flex flex-col gap-1.5">
            <p className="font-extrabold text-primary" style={{ fontSize: 15 }}>{note.label}</p>
            <p className="text-caption text-secondary leading-snug">{note.description}</p>
          </Card>
        ))}
      </div>
    </section>
  );
}
