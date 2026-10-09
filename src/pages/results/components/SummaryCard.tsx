import { useTranslation } from 'react-i18next';
import { UserRound } from 'lucide-react';

interface SummaryCardProps {
  summary: string;
  disclaimer: string;
}

// summary + disclaimer are rendered together, never deduplicated by
// meaning — disclaimer is a fixed, server-authored guarantee, summary is
// the personalized (LLM or fallback) text (contract §4.2).
export function SummaryCard({ summary, disclaimer }: SummaryCardProps) {
  const { t } = useTranslation('results');
  return <section className="rd-report-summary" aria-label={t('summary.aria')}>
    <div><p className="rd-eyebrow"><UserRound size={16} aria-hidden="true" />{t('redesign.sections.summary')}</p>
      <p className="rd-report-summary-text">{summary}</p>
      <p className="rd-report-disclaimer">{disclaimer}</p>
    </div>
    <img src="/mascot/redesign/celebrate.png" alt="" width={190} height={220} />
  </section>;
}
