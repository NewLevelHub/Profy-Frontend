import { Spine, type SpineNode } from '@/shared/ui/Spine';
import { cn } from '@/shared/lib/cn';
import { MONO_LABEL, MONO_MUTE } from '@/shared/ui/admin/density';
import type { AdminAssessmentDetail, AdminResponseItem, HollandType } from '@/shared/types';

const CONSISTENCY_LABELS: Record<'high' | 'medium' | 'low', string> = {
  high: 'высокая',
  medium: 'средняя',
  low: 'низкая',
};

// Spec order is I/A/E/R/S/C (not the usual RIASEC reading order) — followed
// literally here since that's the exact sequence called out in the design spec.
const RIASEC_DISPLAY_ORDER: HollandType[] = ['I', 'A', 'E', 'R', 'S', 'C'];

function formatDuration(ms: number): string {
  if (!Number.isFinite(ms) || ms <= 0) return '—';
  const totalMin = Math.round(ms / 60000);
  if (totalMin < 1) return '<1 мин';
  if (totalMin < 60) return `${totalMin} мин`;
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return m ? `${h} ч ${m} мин` : `${h} ч`;
}

interface BlockSpan {
  id: string;
  label: string;
  count: number;
  durationMs: number | null;
}

/**
 * Derives real per-block time-spent from response timestamps instead of a
 * backend-provided duration field (none exists) — first/last `created_at`
 * within each instrument's answered questions, which IS real data already on
 * `AdminAssessmentDetail.responses[].created_at`.
 */
function computeBlockSpans(assessment: AdminAssessmentDetail): BlockSpan[] {
  const byInstrument = new Map<string, AdminResponseItem[]>();
  for (const r of assessment.responses) {
    const list = byInstrument.get(r.instrument) ?? [];
    list.push(r);
    byInstrument.set(r.instrument, list);
  }

  const spans: BlockSpan[] = [];

  // "goal" — the assessment's chosen goal, not a scored/timed block: no
  // response rows exist for it, so duration is honestly "—", not fabricated.
  spans.push({ id: 'goal', label: 'Цель', count: 1, durationMs: null });

  const INSTRUMENT_LABELS: Record<string, string> = {
    riasec: 'RIASEC',
    big_five: 'Big Five',
    mi: 'MI',
  };

  for (const [instrument, items] of byInstrument.entries()) {
    const times = items.map((i) => new Date(i.created_at).getTime()).filter((t) => !Number.isNaN(t));
    const durationMs = times.length >= 2 ? Math.max(...times) - Math.min(...times) : null;
    spans.push({
      id: instrument,
      label: INSTRUMENT_LABELS[instrument] ?? instrument,
      count: items.length,
      durationMs,
    });
  }

  // Motivation triplets (MOST/NEUTRAL/LEAST) are the forced-choice format in
  // this data model — the closest real match to the spec's "forced-choice"
  // sub-block (there is no separate "forced-choice" instrument key anywhere
  // in AdminAssessmentDetail).
  if (assessment.motivation_responses.length > 0) {
    const times = assessment.motivation_responses
      .map((i) => new Date(i.created_at).getTime())
      .filter((t) => !Number.isNaN(t));
    const durationMs = times.length >= 2 ? Math.max(...times) - Math.min(...times) : null;
    spans.push({
      id: 'motivation',
      label: 'Мотивация (форс-выбор)',
      count: assessment.motivation_responses.length,
      durationMs,
    });
  }

  return spans;
}

export function DiagnosticSummaryBlock({ assessment }: { assessment: AdminAssessmentDetail }) {
  const spans = computeBlockSpans(assessment);
  const hasAnySpan = spans.some((s) => s.id !== 'goal');
  if (!hasAnySpan) return null;

  const nodes: SpineNode[] = spans.map((s, i) => ({
    id: s.id,
    status: assessment.status === 'completed' || i < spans.length - 1 ? 'done' : 'current',
    label: s.label,
    goal: i === spans.length - 1,
  }));

  const analysis = assessment.analysis_result;
  // Guard against rendering raw Holland letters+numbers for a non-RIASEC
  // profile (junior track uses MI categories in this same field) — the spec
  // is explicit that this is the ONE place raw RIASEC scores may appear, so
  // it must actually BE RIASEC data, not any Record<string, number>.
  const riasecEntries = analysis
    ? RIASEC_DISPLAY_ORDER
        .filter((letter) => letter in analysis.profile)
        .map((letter) => ({ letter, value: analysis.profile[letter] }))
    : [];
  const isRiasecProfile = riasecEntries.length === RIASEC_DISPLAY_ORDER.length;

  const totalDurationMs =
    assessment.completed_at && assessment.created_at
      ? new Date(assessment.completed_at).getTime() - new Date(assessment.created_at).getTime()
      : null;

  return (
    <div className="space-y-4 py-3 border-y border-default">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <span className={MONO_MUTE}>СВОДКА ДИАГНОСТИКИ</span>
        {assessment.completed_at && (
          <span className={MONO_MUTE}>
            ЗАВЕРШЕНА {new Date(assessment.completed_at).toLocaleDateString('ru-RU')}
            {totalDurationMs !== null ? ` · ${formatDuration(totalDurationMs).toUpperCase()}` : ''}
          </span>
        )}
      </div>

      <div>
        <Spine nodes={nodes} thickness={0.85} showLabels ariaLabel="Прогресс по блокам диагностики" />
        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
          {spans.map((s) => (
            <span key={s.id} className={MONO_MUTE}>
              {s.label.toUpperCase()}: {s.durationMs !== null ? formatDuration(s.durationMs).toUpperCase() : '—'}
            </span>
          ))}
        </div>
      </div>

      {isRiasecProfile && (
        <div className="space-y-2">
          <p className={MONO_MUTE}>
            RIASEC — ТОЛЬКО ДЛЯ АДМИНИСТРАТОРА
          </p>
          <div className="space-y-1.5">
            {riasecEntries.map(({ letter, value }) => (
              <div key={letter} className="flex items-center gap-2">
                <span className={cn(MONO_LABEL, 'w-4 text-primary')}>{letter}</span>
                <div className="flex-1 h-2 rounded-[2px] bg-raised overflow-hidden">
                  <div
                    className="h-full bg-[color:var(--pine)] rounded-[2px]"
                    style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
                  />
                </div>
                <span className="font-mono text-mono-xs text-secondary w-8 text-right">{Math.round(value)}</span>
              </div>
            ))}
          </div>
          <p className="text-mono-xs text-muted leading-[1.35]">
            Необработанные баллы и буквы RIASEC показываются только здесь — ни `/home` ("ЧТО ТЕБЕ БЛИЖЕ"),
            ни `/results` не должны раскрывать эти значения (см. frontend-result-api-contract.md).
          </p>
        </div>
      )}

      {analysis && (
        <div className={MONO_MUTE}>
          СОГЛАСОВАННОСТЬ: {CONSISTENCY_LABELS[analysis.meta.consistency]?.toUpperCase() ?? analysis.meta.consistency.toUpperCase()}
          {' · '}ДИФФЕРЕНЦИАЦИЯ: {Math.round(analysis.meta.differentiation)}
          {' · '}СКОРОСТЬ ПРОХОЖДЕНИЯ: НЕТ ДАННЫХ
        </div>
      )}
    </div>
  );
}
