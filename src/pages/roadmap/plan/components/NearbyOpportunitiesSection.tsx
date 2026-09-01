import { Card } from '@/shared/ui/Card';
import { SectionHeading } from '@/shared/ui/SectionHeading';

const ITEMS = [
  'Олимпиада следующего этапа (городская, областная) — попроси учителя записать.',
  'Профильный кружок, факультатив или секция в твоём городе, если есть.',
  'Конкурс или проектная смена по твоей теме.',
  'Знакомый, который уже работает или учится в этой сфере — расспроси про путь.',
];

/** Optional extras — not part of the core plan. Static content, not from the API. */
export function NearbyOpportunitiesSection() {
  return (
    <Card>
      <SectionHeading title="Если рядом есть возможности" />
      <p className="text-body-xs text-muted mb-3">
        В план это не входит — план работает и без этого. Но если доступно, используй.
      </p>
      <ul className="list-disc pl-5 space-y-1.5 text-body-sm text-secondary">
        {ITEMS.map((t, i) => <li key={i}>{t}</li>)}
      </ul>
    </Card>
  );
}
