import { useNavigate } from 'react-router';
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

  return (
    <div className="flex flex-col gap-3">
      <span className="font-mono text-mono-xs font-bold uppercase tracking-label text-muted">
        Подходит ли тебе это — вердикт
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
          Сверься с направлением
        </p>
        <p className="text-body-md text-primary leading-relaxed">
          Ты уже проходил опрос по «{directionName}» — вывод показывается сразу после ответов
          и не сохраняется здесь. Пройди его ещё раз за пару минут, если хочешь свежий взгляд
          на то, что совпадает, а что расходится.
        </p>
        <Button
          variant="primary"
          size="md"
          className="self-start mt-1"
          onClick={() => navigate(inquiryPath)}
        >
          Пройти опрос
        </Button>
      </div>
    </div>
  );
}
