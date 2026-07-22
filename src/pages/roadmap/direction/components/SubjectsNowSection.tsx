import { Card } from '@/shared/ui/Card';
import type { SubjectPriority } from '@/shared/types';

interface SubjectsNowSectionProps {
  subjects: SubjectPriority[];
}

/** Ordered by real Direction.subjects_required weight (already sorted by the backend). */
export function SubjectsNowSection({ subjects }: SubjectsNowSectionProps) {
  if (subjects.length === 0) return null;

  return (
    <Card className="flex flex-col gap-4">
      <h2 className="text-label font-bold text-primary flex items-center gap-2">
        <span aria-hidden="true">📚</span>
        Что изучать сейчас
      </h2>
      <ul className="flex flex-col gap-3">
        {subjects.map((subject) => (
          <li
            key={subject.subject}
            className="flex flex-col gap-1 pb-3 border-b border-default last:border-0 last:pb-0"
          >
            <span className="text-body font-bold text-primary">{subject.subject}</span>
            <p className="text-body text-secondary leading-relaxed">{subject.note}</p>
          </li>
        ))}
      </ul>
    </Card>
  );
}
