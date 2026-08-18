import { useNavigate } from 'react-router';
import { cn } from '@/shared/lib/cn';
import { Button } from '@/shared/ui/Button';
import { RiasecIcon, type RiasecType } from '@/shared/ui/icons/RiasecIcon';
import { RIASEC_TYPES, MI_ICONS, CAREER_TIER_LABELS } from '@/shared/config/constants';
import type { InterestLevel, ResultResponse } from '@/shared/types';
import { formatDiagnosisDate, formatUpdatedAgo, pluralizeRu } from '../utils/format';
import { Heading } from '@/shared/ui/typography/Heading';
import { Text } from '@/shared/ui/typography/Text';
import { type as typeClass } from '@/shared/ui/typography/tokens';
import { KICKER_CLASS } from './HomeFrame';

const RIASEC_CODE_SET = new Set<string>(RIASEC_TYPES);

function isRiasecCode(code: string): code is RiasecType {
  return RIASEC_CODE_SET.has(code);
}

const STATUS_META: Record<InterestLevel, { label: string; color: string }> = {
  high: { label: 'ВЕДУЩЕЕ', color: 'var(--pine)' },
  medium: { label: 'ЗАМЕТНО', color: 'var(--ink)' },
  low: { label: 'ПОЧТИ НЕ ПРОЯВИЛОСЬ', color: 'var(--mute)' },
};

const LEVEL_ORDER: Record<InterestLevel, number> = { high: 0, medium: 1, low: 2 };

interface CompletedOverviewProps {
  report: ResultResponse;
  isJunior: boolean;
  onRetake: () => void;
}

/**
 * Completed-diagnosis state — spec §04 layout: headline+meta row, 3-column
 * stat strip, "БЛИЖАЙШИЙ ШАГ" card, "ЧТО ТЕБЕ БЛИЖЕ" status list.
 *
 * Age differences (junior/mi vs senior/riasec) are wording-only per the
 * spec's own framing ("Age differences live entirely in copy/content
 * selection, never in structure") — branched on `report.interest_instrument`
 * (`isJunior`), the same signal InterestMapSection/ResultsPage already use,
 * never on profile.age_group directly (result-v2 contract §3).
 *
 * DATA-GAP NOTES (see task report for the full writeup):
 * 1. No numeric RIASEC/MI scores are ever rendered here — the result-v2
 *    contract forbids them server-side (extra="forbid"), consistent with
 *    the RIASEC-letters-only-in-admin rule elsewhere in this migration.
 *    The age-copy table's junior "три твоих стороны" / senior "баллы 0-100"
 *    phrasing is treated as descriptive, not literal — every age gets the
 *    same qualitative ВЕДУЩЕЕ/ЗАМЕТНО/ПОЧТИ-НЕ-ПРОЯВИЛОСЬ status words.
 * 2. The mockup's "БЛИЖАЙШИЙ ШАГ" meta line ("ГОРИЗОНТ 1 МЕС · ВЛИЯЕТ НА 4
 *    ПРОГРАММЫ") has no backing field anywhere in ResultResponse/StudentCareer
 *    — no duration, no "affected programs" count. Substituted with real,
 *    honestly-available fields instead (career tier + career/activity name)
 *    rather than inventing numbers.
 * 3. "ГОТОВНОСТЬ" is locally derived from real fields (career tier for
 *    riasec, presence of a high-level interest for mi) rather than a
 *    server-provided readiness field, which doesn't exist in the contract.
 */
export function CompletedOverview({ report, isJunior, onRetake }: CompletedOverviewProps) {
  const navigate = useNavigate();

  const leadingItems = report.interest_map.filter(i => i.level === 'high');
  const leadingLabel =
    leadingItems.length > 0
      ? leadingItems.map(i => i.sphere).join(' и ')
      : 'Профиль пока ровный';

  const directionsValue = isJunior ? report.exploration_activities.length : report.careers.length;

  const topCareer = !isJunior ? report.careers[0] : undefined;

  const readinessLabel = isJunior
    ? leadingItems.length > 0
      ? 'уже есть на что опереться'
      : 'только начинаем нащупывать'
    : topCareer
      ? topCareer.tier === 'strong'
        ? 'можно пробовать уже сейчас'
        : topCareer.tier === 'good'
          ? 'есть с чего начать'
          : 'стоит присмотреться'
      : 'есть с чего начать';

  const nextStepText = isJunior
    ? report.exploration_activities[0]
    : topCareer?.try_now;

  const nextStepMeta = isJunior
    ? report.exploration_activities.length > 0
      ? `${report.exploration_activities.length} ${pluralizeRu(report.exploration_activities.length, ['ИДЕЯ', 'ИДЕИ', 'ИДЕЙ'])} ДЛЯ ПРОБЫ`
      : null
    : topCareer
      ? `${CAREER_TIER_LABELS[topCareer.tier].toUpperCase()} · «${topCareer.name.toUpperCase()}»`
      : null;

  function handleOpenNextStep() {
    if (!isJunior && topCareer) {
      navigate(`/results/directions/${encodeURIComponent(topCareer.slug)}`);
    } else {
      navigate('/results');
    }
  }

  const headline = isJunior ? 'Ты прошёл половину пути' : `Диагностика пройдена ${formatDiagnosisDate(report.created_at)}`;

  const sortedItems = [...report.interest_map].sort((a, b) => LEVEL_ORDER[a.level] - LEVEL_ORDER[b.level]);

  return (
    <div className="flex flex-col gap-7">

      {/* ── Top row: headline + updated-ago meta ─────────────────────── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <Heading level="display-lg" className="text-[color:var(--midnight)]">
          {headline}
        </Heading>
        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
          <span className={KICKER_CLASS}>{formatUpdatedAgo(report.created_at)}</span>
          <Button variant="text" size="sm" className="!p-0 !min-h-0 text-mono-sm" onClick={onRetake}>
            Пройти заново
          </Button>
        </div>
      </div>

      {/* ── 3-column stat strip ──────────────────────────────────────── */}
      <div
        className="grid grid-cols-1 sm:grid-cols-3 overflow-hidden"
        style={{ border: '1px solid var(--hairline)', borderRadius: 'var(--radius)' }}
      >
        <StatCell label="ВЕДУЩИЙ ТИП" value={leadingLabel} />
        <StatCell label="НАПРАВЛЕНИЙ" value={String(directionsValue)} />
        <StatCell label="ГОТОВНОСТЬ" value={readinessLabel} valueColor="var(--dawn)" isLast />
      </div>

      {/* ── БЛИЖАЙШИЙ ШАГ ─────────────────────────────────────────────── */}
      {nextStepText && (
        <section aria-label="Ближайший шаг">
          <h2 className={`${KICKER_CLASS} mb-2.5`}>БЛИЖАЙШИЙ ШАГ</h2>
          <div
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5"
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              borderLeft: '3px solid var(--dawn)',
              borderRadius: 'var(--radius)',
            }}
          >
            <div className="flex flex-col gap-1.5 min-w-0 flex-1">
              <Text variant="body-md" className="text-[color:var(--midnight)]">
                {nextStepText}
              </Text>
              {nextStepMeta && <span className={KICKER_CLASS}>{nextStepMeta}</span>}
            </div>
            <Button variant="primary" size="sm" className="w-full sm:w-auto flex-shrink-0" onClick={handleOpenNextStep}>
              Открыть
            </Button>
          </div>
        </section>
      )}

      {/* ── ЧТО ТЕБЕ БЛИЖЕ ────────────────────────────────────────────── */}
      {sortedItems.length > 0 && (
        <section aria-label="Что тебе ближе">
          <h2 className={`${KICKER_CLASS} mb-2.5`}>ЧТО ТЕБЕ БЛИЖЕ</h2>
          <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}>
            {sortedItems.map((item, i) => {
              const meta = STATUS_META[item.level];
              return (
                <div
                  key={item.code}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-4 px-4 py-3"
                  style={{ borderTop: i === 0 ? undefined : '1px solid var(--border-faint)' }}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="flex-shrink-0 flex items-center justify-center" style={{ width: 28, height: 28, color: meta.color }}>
                      {isRiasecCode(item.code) ? (
                        <RiasecIcon type={item.code} size={26} strokeWidth={1.75} />
                      ) : (
                        <span className="text-lg leading-none" aria-hidden="true">{MI_ICONS[item.code] ?? '🧭'}</span>
                      )}
                    </span>
                    <span className="truncate sm:max-w-none text-body-sm font-book text-primary">{item.sphere}</span>
                  </div>
                  {/* Below sm, the status word sits under the sphere name (indented
                     to align with it) instead of sharing the row — at narrow widths
                     a long mono status like "ПОЧТИ НЕ ПРОЯВИЛОСЬ" otherwise eats
                     most of the row and truncates even short sphere names. */}
                  <span
                    className={`${typeClass.monoLabel} flex-shrink-0 pl-[40px] sm:pl-0`}
                    style={{ color: meta.color }}
                  >
                    {meta.label}
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}

function StatCell({
  label, value, valueColor = 'var(--midnight)', isLast = false,
}: {
  label: string; value: string; valueColor?: string; isLast?: boolean;
}) {
  return (
    <div
      className={cn('flex flex-col gap-1.5 p-4 sm:p-5', !isLast && 'border-b sm:border-b-0 sm:border-r')}
      style={{ background: 'var(--bg-surface)', borderColor: 'var(--hairline)' }}
    >
      <span className={KICKER_CLASS}>{label}</span>
      <span className={`${typeClass.bodyLg} truncate font-semibold`} style={{ color: valueColor }}>
        {value}
      </span>
    </div>
  );
}
