import { Card } from '@/shared/ui/Card';
import { Badge } from '@/shared/ui/Badge';
import type { DirectionVerdict } from '@/shared/types';

interface InquiryVerdictProps {
  verdict: DirectionVerdict;
}

export function InquiryVerdict({ verdict }: InquiryVerdictProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <span className="text-2xl select-none" aria-hidden="true">🎯</span>
        <Badge variant="brand">{verdict.readiness}</Badge>
      </div>

      <Card className="bg-brand-subtle">
        <p className="text-body text-primary leading-relaxed">{verdict.fit_summary}</p>
      </Card>

      <Card className="flex items-start gap-3">
        <span className="text-xl select-none" aria-hidden="true">💡</span>
        <p className="text-body text-secondary leading-relaxed">{verdict.note}</p>
      </Card>
    </div>
  );
}
