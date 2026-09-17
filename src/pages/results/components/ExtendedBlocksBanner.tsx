import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { ListChecks } from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { SectionHeading } from '@/shared/ui/SectionHeading';
import { useExtendedBlocks } from '../hooks/useExtendedBlocks';
import type { ExtendedBlock } from '@/shared/types';

interface ExtendedBlocksBannerProps {
  assessmentId: string | null;
}

/**
 * PRO-338 post-Ф4.1 follow-up — shows Belbin/АСТУР assignments the
 * psychologist made for this assessment, so the student can launch them
 * from their own /results instead of needing a hand-delivered link.
 * Renders nothing when there's nothing pending — this is a nudge, not
 * a permanent fixture of the page.
 */
export function ExtendedBlocksBanner({ assessmentId }: ExtendedBlocksBannerProps) {
  const { t } = useTranslation('results');
  const navigate = useNavigate();
  const { pending, isLoading } = useExtendedBlocks(assessmentId);

  if (isLoading || pending.length === 0) return null;

  const nameFor = (block: ExtendedBlock) =>
    block === 'belbin' ? t('extendedBlocks.belbinName') : t('extendedBlocks.asturName');

  return (
    <section aria-label={t('extendedBlocks.title')}>
      <SectionHeading emoji="🧩" title={t('extendedBlocks.title')} />
      <Card className="flex flex-col gap-3">
        <p className="text-caption text-secondary">{t('extendedBlocks.description')}</p>
        <div className="flex flex-col gap-2">
          {pending.map((assignment) => (
            <div key={assignment.block} className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-2 font-semibold text-primary text-body-sm">
                <ListChecks size={16} className="text-brand flex-shrink-0" />
                {nameFor(assignment.block)}
              </span>
              <Button
                size="sm"
                onClick={() => navigate(`/assessment/extended/${assignment.block}/${assessmentId}`)}
              >
                {t('extendedBlocks.start')}
              </Button>
            </div>
          ))}
        </div>
      </Card>
    </section>
  );
}
