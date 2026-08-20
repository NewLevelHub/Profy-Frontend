import { Card } from '@/shared/ui/Card';
import { SectionHeading } from '@/shared/ui/SectionHeading';

interface FinalAnalysisSectionProps {
  text: string;
}

// Last section on the page — ties every earlier section together, deliberately
// distinct from SummaryCard (written first, before the reader has seen the rest).
export function FinalAnalysisSection({ text }: FinalAnalysisSectionProps) {
  if (!text) return null;

  return (
    <section aria-label="Итог">
      <Card className="bg-brand-subtle">
        <p className="text-body text-primary leading-relaxed">{text}</p>
      </Card>
    </section>
  );
}
