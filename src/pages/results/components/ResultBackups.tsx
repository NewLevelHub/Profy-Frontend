import { Card } from '@/shared/ui/Card';
import { SectionHeading } from '@/shared/ui/SectionHeading';
import type { RevealLeaf } from '@/shared/types';

interface ResultBackupsProps {
  backups: RevealLeaf[];
}

export function ResultBackups({ backups }: ResultBackupsProps) {
  if (backups.length === 0) return null;

  return (
    <section aria-label="Запасные варианты">
      <SectionHeading emoji="🗂️" title="Ещё пара вариантов на заметку" />
      <Card className="flex flex-wrap gap-2.5">
        {backups.map(backup => (
          <span
            key={backup.slug}
            className="font-bold text-secondary bg-raised rounded-pill px-3.5 py-2"
            style={{ fontSize: 13.5 }}
          >
            {backup.name}
          </span>
        ))}
      </Card>
    </section>
  );
}
