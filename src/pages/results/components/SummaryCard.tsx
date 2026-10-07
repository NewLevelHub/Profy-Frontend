import { useTranslation } from 'react-i18next';
import { Card } from '@/shared/ui/Card';
import { Sparkles } from 'lucide-react';

interface SummaryCardProps {
  redesigned?: boolean;
  summary: string;
  disclaimer: string;
}

// summary + disclaimer are rendered together, never deduplicated by
// meaning — disclaimer is a fixed, server-authored guarantee, summary is
// the personalized (LLM or fallback) text (contract §4.2).
export function SummaryCard({ summary, disclaimer, redesigned = false }: SummaryCardProps) {
  const { t } = useTranslation('results');
  if (redesigned) return <section className="rd-report-summary" aria-label={t('summary.aria')}>
    <div><p className="rd-eyebrow"><Sparkles size={16} aria-hidden="true" />{t('redesign.sections.summary')}</p>
      <p className="rd-report-summary-text">{summary}</p>
      <p className="rd-report-disclaimer">{disclaimer}</p>
    </div>
    <img src="/mascot/redesign/celebrate.png" alt="" width={190} height={220} />
  </section>;
  return (
    <section aria-label={t('summary.aria')}>
      <Card className="panel-glass flex flex-col gap-3 !bg-[color-mix(in_srgb,var(--pine)_6%,var(--paper))]">
        <p className="text-body text-primary leading-relaxed">{summary}</p>
        <p className="text-caption text-secondary border-t border-default pt-3">{disclaimer}</p>
      </Card>
    </section>
  );
}
