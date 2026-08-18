import { memo } from 'react';
import { ExternalLink } from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { SectionHeading } from '@/shared/ui/SectionHeading';
import type { RoadmapResource } from '@/shared/types';

interface AdditionalResourcesSectionProps {
  resources: RoadmapResource[];
}

export const AdditionalResourcesSection = memo(function AdditionalResourcesSection({
  resources,
}: AdditionalResourcesSectionProps) {
  if (resources.length === 0) return null;

  return (
    <div>
      <SectionHeading title="Дополнительные материалы" className="mb-4" />
      <Card className="flex flex-col gap-3">
        {resources.map((resource, i) => (
          <a
            key={i}
            href={resource.url ?? undefined}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between gap-3 rounded-[var(--radius)] border border-default p-3 hover:border-strong hover:bg-hover transition-colors"
          >
            <div className="flex flex-col gap-0.5 min-w-0">
              <p className="text-body font-bold text-primary truncate">{resource.title}</p>
              <p className="text-caption text-muted">{resource.kind}</p>
            </div>
            <ExternalLink className="w-4 h-4 text-brand flex-shrink-0" aria-hidden="true" />
          </a>
        ))}
      </Card>
    </div>
  );
});
