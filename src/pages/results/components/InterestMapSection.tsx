import { Card } from '@/shared/ui/Card';
import { SectionHeading } from '@/shared/ui/SectionHeading';
import { RIASEC_ICONS, MI_ICONS, INTEREST_LEVEL_LABELS } from '@/shared/config/constants';
import type { InterestMapItem } from '@/shared/types';

const LEVEL_DOTS: Record<InterestMapItem['level'], number> = { low: 1, medium: 2, high: 3 };

interface InterestMapSectionProps {
  items: InterestMapItem[];
  note: string;
  isJunior: boolean;
}

// interest_map is always the full 6/8-category set with an opaque low/
// medium/high level (contract §5) — never a percentage, so this renders a
// 3-dot indicator instead of a progress bar to avoid implying a score.
export function InterestMapSection({ items, note, isJunior }: InterestMapSectionProps) {
  if (items.length === 0) return null;
  const icons = isJunior ? MI_ICONS : RIASEC_ICONS;

  return (
    <section aria-label={isJunior ? 'Твоя карта интересов' : 'Твой профиль RIASEC'}>
      <SectionHeading emoji="📊" title={isJunior ? 'Твоя карта интересов' : 'Твой профиль RIASEC'} />
      {note && <p className="text-body text-secondary mb-3">{note}</p>}
      <Card className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {items.map((item) => (
          <div key={item.code} className="flex items-center gap-3">
            <span
              className="w-9 h-9 rounded-full flex items-center justify-center text-lg select-none flex-shrink-0 bg-brand-subtle"
              aria-hidden="true"
            >
              {icons[item.code] ?? '🧭'}
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-extrabold text-primary truncate" style={{ fontSize: 14.5 }}>{item.sphere}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="flex gap-1" role="img" aria-label={INTEREST_LEVEL_LABELS[item.level]}>
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="w-2 h-2 rounded-full"
                      style={{ background: i < LEVEL_DOTS[item.level] ? 'var(--brand)' : 'var(--brand-subtle)' }}
                    />
                  ))}
                </div>
                <span className="text-caption text-secondary">{INTEREST_LEVEL_LABELS[item.level]}</span>
              </div>
            </div>
          </div>
        ))}
      </Card>
    </section>
  );
}
