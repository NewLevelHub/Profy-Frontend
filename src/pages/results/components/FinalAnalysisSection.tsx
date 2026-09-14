import { useTranslation } from 'react-i18next';
import { Card } from '@/shared/ui/Card';
import { SectionHeading } from '@/shared/ui/SectionHeading';

interface FinalAnalysisSectionProps {
  text: string;
}

// Last section on the page — ties every earlier section together, deliberately
// distinct from SummaryCard (written first, before the reader has seen the rest).
export function FinalAnalysisSection({ text }: FinalAnalysisSectionProps) {
  const { t } = useTranslation('results');
  if (!text) return null;

  return (
    <section aria-label={t('finalAnalysis.aria')}>
      {/* rounded-[20px] — тот же радиус, что у .panel-glass на SummaryCard в
          начале отчёта: два одинаковых по смыслу текстовых блока (вступление и
          свод) не должны отличаться скруглением. Card по умолчанию берёт
          --radius (8px). */}
      <Card className="bg-brand-subtle rounded-[20px]">
        <p className="text-body text-primary leading-relaxed">{text}</p>
      </Card>
    </section>
  );
}
