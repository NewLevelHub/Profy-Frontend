import { SectionHeading } from '@/shared/ui/SectionHeading';
import type { RevealLeaf } from '@/shared/types';

interface ResultBackupsProps {
  backups: RevealLeaf[];
}

// Ported from ResultsScreen.dc.html's "Ещё пара вариантов на заметку" row
// list — the mockup also shows a per-item match %, which RevealLeaf doesn't
// carry (backups have no score, only the winning direction does), so that
// badge is left out rather than faked.
export function ResultBackups({ backups }: ResultBackupsProps) {
  if (backups.length === 0) return null;

  return (
    <section aria-label="Запасные варианты">
      <SectionHeading emoji="🎒" title="Ещё пара вариантов на заметку" />
      <div className="flex flex-col gap-3.5">
        {backups.map(backup => (
          <div
            key={backup.slug}
            className="bg-surface border-2 border-strong border-b-4 rounded-2xl p-5 flex gap-4 items-center flex-wrap"
          >
            <span className="text-[30px] leading-none flex-none" aria-hidden="true">🧭</span>
            <div className="flex-1 min-w-[200px] flex flex-col gap-1">
              <h3 className="text-[17px] font-extrabold text-primary m-0">{backup.name}</h3>
              {backup.description && (
                <p className="text-[14px] font-semibold text-secondary leading-relaxed m-0">
                  {backup.description}
                </p>
              )}
              {backup.professions.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {backup.professions.map(profession => (
                    <span
                      key={profession}
                      className="font-bold text-secondary bg-raised rounded-pill px-3 py-1.5"
                      style={{ fontSize: 12.5 }}
                    >
                      {profession}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
