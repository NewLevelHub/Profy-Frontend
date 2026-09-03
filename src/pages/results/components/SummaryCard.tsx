import { useTranslation } from 'react-i18next';
import { Card } from '@/shared/ui/Card';
import { SectionHeading } from '@/shared/ui/SectionHeading';

interface SummaryCardProps {
  summary: string;
  disclaimer: string;
}

// summary + disclaimer are rendered together, never deduplicated by
// meaning — disclaimer is a fixed, server-authored guarantee, summary is
// the personalized (LLM or fallback) text (contract §4.2).
export function SummaryCard({ summary, disclaimer }: SummaryCardProps) {
  const { t } = useTranslation('results');
  return (
    <section aria-label={t('summary.aria')}>
      <Card className="bg-brand-subtle flex flex-col gap-3">
        <p className="text-body text-primary leading-relaxed">{summary}</p>
        <p className="text-caption text-secondary border-t border-default pt-3">{disclaimer}</p>
      </Card>
    </section>
  );
}
