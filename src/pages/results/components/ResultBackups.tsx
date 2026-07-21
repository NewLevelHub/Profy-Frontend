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
      <div className="flex flex-col gap-3">
        {backups.map(backup => (
          <Card key={backup.slug} className="flex flex-col gap-2">
            <h3 className="text-base font-extrabold text-primary m-0">{backup.name}</h3>
            {backup.description && (
              <p className="text-[15px] font-semibold text-secondary leading-relaxed m-0">
                {backup.description}
              </p>
            )}
            {backup.professions && backup.professions.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-1">
                {backup.professions.map(profession => (
                  <span
                    key={profession}
                    className="font-bold text-secondary bg-raised rounded-pill px-3.5 py-2"
                    style={{ fontSize: 13.5 }}
                  >
                    {profession}
                  </span>
                ))}
              </div>
            )}
          </Card>
        ))}
      </div>
    </section>
  );
}
