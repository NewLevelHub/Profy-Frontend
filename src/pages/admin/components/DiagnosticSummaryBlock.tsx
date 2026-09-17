import { cn } from '@/shared/lib/cn';
import { formatDate } from '@/shared/i18n/format';
import { useTranslation } from 'react-i18next';
import { ADMIN_META, ADMIN_NUM, ADMIN_TEXT, MONO_LABEL } from '@/shared/ui/admin/density';
import type { AdminAssessmentDetail, BigFiveDomain, HollandType } from '@/shared/types';

const CONSISTENCY_LABELS: Record<'high' | 'medium' | 'low', string> = {
  high: 'admin:summary.level.high',
  medium: 'admin:summary.level.medium',
  low: 'admin:summary.level.low',
};

const RIASEC_DISPLAY_ORDER: HollandType[] = ['R', 'I', 'A', 'S', 'E', 'C'];
const BIG_FIVE_DISPLAY_ORDER: BigFiveDomain[] = ['O', 'C', 'E', 'A', 'N'];

const RIASEC_LABELS: Record<HollandType, string> = {
  R: 'admin:riasecShort.R',
  I: 'admin:riasecShort.I',
  A: 'admin:riasecShort.A',
  S: 'admin:riasecShort.S',
  E: 'admin:riasecShort.E',
  C: 'admin:riasecShort.C',
};

const BIG_FIVE_LABELS: Record<BigFiveDomain, string> = {
  O: 'admin:bigfiveShort.O',
  C: 'admin:bigfiveShort.C',
  E: 'admin:bigfiveShort.E',
  A: 'admin:bigfiveShort.A',
  N: 'admin:bigfiveShort.N',
};

const INSTRUMENT_LABELS: Record<string, string> = {
  riasec: 'RIASEC',
  big_five: 'Big Five',
  mi: 'MI',
};

function formatElapsed(ms: number, t: (key: string, opts?: Record<string, unknown>) => string): string {
  if (!Number.isFinite(ms) || ms <= 0) return '—';
  const totalMin = Math.round(ms / 60000);
  if (totalMin < 60) return t('summary.minutes', { count: totalMin });
  const h = Math.floor(totalMin / 60);
  if (h < 24) return t('summary.hoursMinutes', { hours: h, minutes: totalMin % 60 });
  const d = Math.floor(h / 24);
  return t('summary.daysHours', { days: d, hours: h % 24 });
}

/**
 * How many questions each instrument contributed.
 *
 * This used to also show time spent per block, derived from the first and last
 * `created_at` inside each instrument. That number was meaningless: the
 * backend writes every response row at submit time, so all 314 rows of a real
 * assessment carry the same two timestamps and every block reported "<1 мин"
 * or "—". Counting questions is something the data actually supports.
 */
function blockCounts(assessment: AdminAssessmentDetail, t: (key: string) => string) {
  const counts = new Map<string, number>();
  for (const response of assessment.responses) {
    counts.set(response.instrument, (counts.get(response.instrument) ?? 0) + 1);
  }

  const blocks = [...counts.entries()].map(([instrument, count]) => ({
    id: instrument,
    label: INSTRUMENT_LABELS[instrument] ?? instrument,
    count,
  }));

  if (assessment.motivation_responses.length > 0) {
    blocks.push({
      id: 'motivation',
      label: t('feedback.sectionShort.motivation'),
      count: assessment.motivation_responses.length,
    });
  }

  return blocks;
}

/** Horizontal bar with a named scale, used for both instrument breakdowns. */
function ScoreBar({
  label,
  code,
  value,
  tone,
}: {
  label: string;
  code: string;
  value: number;
  tone: 'pine' | 'lake';
}) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div className="flex items-center gap-2.5">
      <span className={cn(ADMIN_TEXT, 'text-secondary w-[168px] flex-shrink-0 truncate')}>
        <span className={cn(ADMIN_NUM, 'text-muted mr-1.5')}>{code}</span>
        {label}
      </span>
      {/* Capped rather than full-bleed: six bars stretched across a 1200px
          card made near-equal scores impossible to compare by eye, which is
          the only reason to draw bars instead of printing the numbers. */}
      <span className="flex-1 max-w-[320px] h-2 rounded-[2px] bg-raised overflow-hidden">
        <span
          className={cn('block h-full rounded-[2px]', tone === 'pine' ? 'bg-[color:var(--pine)]' : 'bg-[color:var(--lake)]')}
          style={{ width: `${clamped}%` }}
        />
      </span>
      <span className={cn(ADMIN_NUM, 'text-primary w-8 text-right')}>{Math.round(value)}</span>
    </div>
  );
}

export function DiagnosticSummaryBlock({ assessment }: { assessment: AdminAssessmentDetail }) {
  const { t } = useTranslation('admin');
  const blocks = blockCounts(assessment, t);
  if (blocks.length === 0) return null;

  const analysis = assessment.analysis_result;

  // Guard against rendering raw Holland letters for a non-RIASEC profile — the
  // junior track puts MI categories in this same `profile` field.
  const riasecEntries = analysis
    ? RIASEC_DISPLAY_ORDER.filter((letter) => letter in analysis.profile).map((letter) => ({
        letter,
        value: analysis.profile[letter],
      }))
    : [];
  const isRiasecProfile = riasecEntries.length === RIASEC_DISPLAY_ORDER.length;

  const bigFiveEntries = analysis
    ? BIG_FIVE_DISPLAY_ORDER.map((letter) => ({ letter, value: analysis.big_five[letter] }))
    : [];

  const elapsedMs =
    assessment.completed_at && assessment.created_at
      ? new Date(assessment.completed_at).getTime() - new Date(assessment.created_at).getTime()
      : null;

  return (
    <div className="flex flex-col gap-4 py-3.5 border-y border-default">
      <div className="flex items-baseline justify-between gap-3 flex-wrap">
        <h4 className={cn(ADMIN_TEXT, 'font-semibold text-primary m-0')}>{t('summary.title')}</h4>
        {assessment.completed_at && (
          <span className={ADMIN_META}>
            {t('summary.completedOn', { date: formatDate(assessment.completed_at) })}
            {elapsedMs !== null && (
              <>
                {' · '}
                {/* Labelled as elapsed, not as time spent: it is the gap between
                    starting and finishing, which for a test left open overnight
                    reads as "20 ч 30 мин" of work that never happened. */}
                <span title={t('summary.elapsedHint')}>
                  {t('summary.elapsed', { elapsed: formatElapsed(elapsedMs, t) })}
                </span>
              </>
            )}
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-x-5 gap-y-1.5">
        {blocks.map((block) => (
          <span key={block.id} className={ADMIN_TEXT}>
            <span className="text-muted">{block.label}</span>{' '}
            <span className={cn(ADMIN_NUM, 'text-primary')}>{block.count}</span>
          </span>
        ))}
      </div>

      {isRiasecProfile && (
        <div className="flex flex-col gap-2">
          <p className={cn(MONO_LABEL, 'text-muted m-0')}>{t('summary.riasecInterests')}</p>
          <div className="flex flex-col gap-1.5">
            {riasecEntries.map(({ letter, value }) => (
              <ScoreBar key={letter} code={letter} label={RIASEC_LABELS[letter]} value={value} tone="pine" />
            ))}
          </div>
        </div>
      )}

      {bigFiveEntries.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className={cn(MONO_LABEL, 'text-muted m-0')}>Big Five</p>
          <div className="flex flex-col gap-1.5">
            {bigFiveEntries.map(({ letter, value }) => (
              <ScoreBar key={letter} code={letter} label={BIG_FIVE_LABELS[letter]} value={value} tone="lake" />
            ))}
          </div>
        </div>
      )}

      {(isRiasecProfile || bigFiveEntries.length > 0) && (
        // One short line instead of the two developer footnotes that used to
        // sit under each chart citing a contract file by name.
        <p className={ADMIN_META}>{t('summary.rawScoresNote')}</p>
      )}

      {analysis && (
        <div className="flex flex-wrap gap-x-5 gap-y-1.5">
          <span className={ADMIN_TEXT}>
            <span className="text-muted">{t('summary.consistency')}</span>{' '}
            <span className="text-primary font-medium">
              {CONSISTENCY_LABELS[analysis.meta.consistency] ?? analysis.meta.consistency}
            </span>
          </span>
          <span className={ADMIN_TEXT}>
            <span className="text-muted" title={t('summary.differentiationHint')}>
              {t('summary.differentiation')}
            </span>{' '}
            <span className={cn(ADMIN_NUM, 'text-primary')}>{Math.round(analysis.meta.differentiation)}</span>
          </span>
        </div>
      )}
    </div>
  );
}
