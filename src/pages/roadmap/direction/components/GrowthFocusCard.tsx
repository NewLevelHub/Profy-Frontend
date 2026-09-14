import { useTranslation } from 'react-i18next';
import { Card } from '@/shared/ui/Card';
import type { GrowthFocus } from '@/shared/types';

interface GrowthFocusCardProps {
  growthFocus: GrowthFocus;
}

/**
 * A zone of growth, not a failure — deliberately neutral/warm styling.
 * Never use danger colours here.
 */
export function GrowthFocusCard({ growthFocus }: GrowthFocusCardProps) {
  const { t } = useTranslation('roadmap');
  return (
    <Card className="bg-accent-soft flex flex-col gap-2">
      <p className="text-label font-bold text-primary flex items-center gap-2">
        <span aria-hidden="true">🌱</span>
        {t('growthFocus.title')}
      </p>
      <p className="text-title font-extrabold text-accent leading-snug">{growthFocus.weakness}</p>
      <p className="text-body text-secondary leading-relaxed">{growthFocus.why_it_matters}</p>

      {growthFocus.evidence && (
        <p className="text-caption text-muted leading-relaxed border-t border-default pt-2 mt-1">
          <span className="font-semibold">{t('growthFocus.evidenceLabel')}</span>
          {growthFocus.evidence}
        </p>
      )}
    </Card>
  );
}
