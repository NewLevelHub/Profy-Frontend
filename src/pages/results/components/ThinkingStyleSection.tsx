import { Card } from '@/shared/ui/Card';
import { SectionHeading } from '@/shared/ui/SectionHeading';
import type { ThinkingStyleNote } from '@/shared/types';

interface ThinkingStyleSectionProps {
  notes: ThinkingStyleNote[];
}

// 0-2 items typically (contract §4.3) — an empty list is legitimate, not
// a loading/error state.
export function ThinkingStyleSection({ notes }: ThinkingStyleSectionProps) {
  if (notes.length === 0) return null;

  return (
    <section aria-label="Стиль мышления">
      <SectionHeading emoji="🧭" title="Стиль мышления" />
      <Card className="flex flex-col gap-4">
        {notes.map((note, i) => (
          <div key={i} className="flex items-start gap-3">
            <span
              className="w-8 h-8 rounded-full flex items-center justify-center text-lg select-none flex-shrink-0 bg-brand-subtle"
              aria-hidden="true"
            >
              🧭
            </span>
            <div>
              <p className="font-extrabold text-primary mb-0.5" style={{ fontSize: 15 }}>{note.title}</p>
              <p className="text-caption text-secondary leading-snug">{note.description}</p>
            </div>
          </div>
        ))}
      </Card>
    </section>
  );
}
