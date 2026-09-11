import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Button } from '@/shared/ui/Button';

interface DirectionVerdictCardProps {
  directionName: string;
  inquiryPath: string;
}

/**
 * Left column of the spec-07 verdict/subjects row: "ПОДХОДИТ ЛИ ТЕБЕ ЭТО —
 * ВЕРДИКТ".
 *
 * Investigated whether the real `DirectionVerdict` (readiness/fit_summary/
 * note, from `POST /inquiry/:assessmentId/directions/:slug/verdict`, shown
 * once by `InquiryVerdict.tsx`) could be surfaced here instead of a link.
 * It can't, honestly: the endpoint is POST-only (no GET verdict route in
 * `shared/api/endpoints.ts`), the response isn't cached in any store
 * (`useDirectionRoadmapStore` only persists the roadmap, not the verdict),
 * and `DirectionInquiryPage` keeps the verdict in local mutation state that
 * unmounts the moment the student leaves the page. Reaching this roadmap
 * screen does prove the inquiry was completed once (`generate` 400s with
 * `needs_inquiry` otherwise), but the actual verdict text from that run is
 * gone. Rather than fabricate a "Скорее да"-style readout, this links to
 * the real inquiry flow so retaking it (a couple of minutes, self-report
 * only) produces a genuine, current verdict.
 */
export function DirectionVerdictCard({ directionName, inquiryPath }: DirectionVerdictCardProps) {
  const navigate = useNavigate();
  const { t } = useTranslation('roadmap');

  return (
    <div className="flex flex-col gap-3">
      <span className="font-mono text-mono-xs font-bold uppercase tracking-label text-muted">
        {t('verdict.kicker')}
      </span>

      <div
        className="flex flex-col gap-3 px-5 py-5 h-full"
        style={{
          background: 'var(--bg-surface)',
          borderRadius: 'var(--radius)',
          border: '1px solid var(--border)',
          borderLeft: '3px solid var(--pine)',
        }}
      >
        <p
          className="font-sans font-semibold text-body-lg leading-snug"
          style={{ color: 'var(--pine)' }}
        >
          {t('verdict.title')}
        </p>
        <p className="text-body-md text-primary leading-relaxed">
          {t('verdict.body', { name: directionName })}
        </p>
        <Button
          variant="primary"
          size="md"
          className="self-start mt-1"
          onClick={() => navigate(inquiryPath)}
        >
          {t('direction.takeInquiry')}
        </Button>
      </div>
    </div>
  );
}
