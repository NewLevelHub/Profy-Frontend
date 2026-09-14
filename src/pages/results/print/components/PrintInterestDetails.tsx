import { Trans, useTranslation } from 'react-i18next';
import type { InterestCombination, InterestLevel, InterestMapItem, InterestMapItemDetails } from '@/shared/types';
import { LEVEL_HIGH_MIN, LEVEL_MEDIUM_MIN } from '../../utils/interestHeadline';
import { LEVEL_STATUS_LABEL } from '../../components/DomainCardParts';
import { HollandHexagon } from '../../components/InterestHowItWorks';

// Same rule-not-fill convention as PrintLevelRows: level is a colored left
// rule + the spelled-out status word, never a background fill (browsers drop
// CSS backgrounds unless "Background graphics" is ticked). The meter and the
// answer bar are SVG shapes instead, which print either way.
const LEVEL_RULE: Record<InterestLevel, string> = {
  high: 'var(--pine)',
  medium: 'var(--dawn)',
  low: 'var(--hairline)',
};

const LEVEL_FILL: Record<InterestLevel, string> = {
  high: 'var(--pine)',
  medium: 'var(--dawn)',
  low: 'var(--text-subtle)',
};

const ANSWER_COLORS = [
  'var(--pine)',
  'var(--pine-light)',
  'var(--border)',
  'color-mix(in srgb, var(--clay) 55%, white)',
  'var(--clay)',
];

const SUBHEAD = 'font-mono text-tiny font-bold uppercase tracking-label text-muted';

type DetailedItem = InterestMapItem & { details: InterestMapItemDetails };

interface PrintInterestDetailsProps {
  items: InterestMapItem[];
  labels: Record<string, string>;
  descriptions: Record<string, string>;
  combination: InterestCombination | null;
}

/**
 * Print counterpart of the on-screen interest breakdown (PRO-336). On paper
 * nothing can be clicked open, so everything is laid out expanded, in the
 * order a counsellor walks a family through it: first how the levels are
 * computed and the overall picture on Holland's hexagon, then every type as
 * its own keep-together block — level, what it means, what the level is
 * made of (answer counts against the two level marks, the student's own
 * statements).
 */
export function PrintInterestDetails({ items, labels, descriptions, combination }: PrintInterestDetailsProps) {
  const { t } = useTranslation('results');
  const detailed = items.filter((i): i is DetailedItem => Boolean(i.details));
  if (detailed.length === 0) return null;
  const answered = detailed.map((i) => i.details.answered);

  return (
    <div className="space-y-3">
      <div className="print-block grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-5 border-y border-[var(--hairline)] py-3">
        <div className="space-y-2">
          <p className={SUBHEAD}>{t('interestDetail.methodTitle')}</p>
          <ol className="space-y-1.5">
            {['method1', 'method2', 'method3'].map((key, index) => (
              <li key={key} className="grid grid-cols-[16px_1fr] gap-1.5 text-caption leading-snug" style={{ color: 'var(--ink)' }}>
                <span className="font-mono font-bold" style={{ color: 'var(--pine)' }}>{index + 1}</span>
                <span>
                  <Trans
                    t={t}
                    i18nKey={`interestDetail.${key}`}
                    values={{
                      total: answered.reduce((sum, n) => sum + n, 0),
                      min: Math.min(...answered),
                      max: Math.max(...answered),
                    }}
                    components={{ 1: <strong className="font-semibold text-[color:var(--text-heading)]" /> }}
                  />
                </span>
              </li>
            ))}
          </ol>
          <p className="text-caption leading-snug text-muted">{t('interestDetail.methodNote')}</p>
        </div>
        <div className="space-y-1.5">
          <p className={SUBHEAD}>{t('interestDetail.hexTitle')}</p>
          <HollandHexagon items={items} labels={labels} combination={combination} />
          <p className="text-caption leading-snug" style={{ color: 'var(--ink)' }}>{t('interestDetail.hexIntro')}</p>
          {combination && (
            <p className="text-caption leading-snug font-semibold text-[color:var(--text-heading)]">{combination.text}</p>
          )}
        </div>
      </div>

      <p className="text-caption leading-snug" style={{ color: 'var(--ink)' }}>
        {t('print.interestIntro')}
      </p>

      {detailed.map((item) => (
        <PrintInterestType
          key={item.code}
          item={item}
          label={labels[item.code] ?? item.sphere}
          summary={descriptions[item.code] ?? ''}
        />
      ))}
    </div>
  );
}

function PrintInterestType({ item, label, summary }: { item: DetailedItem; label: string; summary: string }) {
  const { t } = useTranslation('results');
  const { details, level } = item;
  const isLow = level === 'low';

  return (
    <div className="print-block border-l-[3px] pl-3 py-1 space-y-1.5" style={{ borderLeftColor: LEVEL_RULE[level] }}>
      <div className="flex items-start gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-body-sm font-semibold leading-snug text-[color:var(--text-heading)]">
            {label}
            <span
              className="ml-2 font-mono text-tiny font-bold uppercase tracking-label align-middle"
              style={{ color: isLow ? 'var(--text-muted)' : LEVEL_RULE[level] }}
            >
              {t(LEVEL_STATUS_LABEL[level])}
            </span>
          </p>
          {summary && <p className="text-caption leading-snug text-muted">{summary}</p>}
        </div>
        <div className="flex-shrink-0 w-[190px] space-y-0.5">
          <p className="font-mono text-tiny text-right tabular-nums text-[color:var(--text-heading)]">
            {t('interestDetail.cellCount', { likes: details.likes, answered: details.answered })}
          </p>
          <PrintMeter score={details.score} level={level} />
        </div>
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-5">
        <div className="space-y-1">
          <div>
            <p className={SUBHEAD}>{t('interestDetail.meansSub')}</p>
            <p className="text-caption leading-snug" style={{ color: 'var(--ink)' }}>{details.means}</p>
          </div>
          <div>
            <p className={SUBHEAD}>{t('interestDetail.followsSub')}</p>
            <p className="text-caption leading-snug" style={{ color: 'var(--ink)' }}>{details.follows}</p>
          </div>
        </div>

        <div className="space-y-1">
          <p className={SUBHEAD}>{t('interestDetail.whyTitle')}</p>
          <p className="text-caption leading-snug" style={{ color: 'var(--ink)' }}>
            <Trans
              t={t}
              i18nKey="interestDetail.whyCounts"
              values={{ answered: details.answered, likes: details.likes, dislikes: details.dislikes }}
              components={{ 1: <strong className="font-mono font-semibold tabular-nums text-[color:var(--text-heading)]" /> }}
            />
          </p>
          <PrintAnswerBar distribution={details.distribution} />
          {details.quotes.length > 0 && (
            <ul className="space-y-0.5 pt-0.5">
              {details.quotes.map((quote) => (
                <li key={quote.text} className="text-caption leading-snug" style={{ color: 'var(--ink)' }}>
                  <span
                    className="font-mono text-tiny font-bold mr-1.5"
                    style={{ color: quote.answer === 'like' ? 'var(--pine)' : 'var(--clay)' }}
                  >
                    {quote.answer === 'like' ? '+' : '−'}
                  </span>
                  «{quote.text}»
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function PrintMeter({ score, level }: { score: number; level: InterestLevel }) {
  const { t } = useTranslation('results');
  const width = 190;
  const x = (value: number) => (Math.min(100, Math.max(0, value)) / 100) * width;
  // "заметно" hangs left of its mark, "ведущий" right of its — the two marks
  // sit only 20 points apart, centered labels would run into each other.
  const marks = [
    { at: LEVEL_MEDIUM_MIN, label: t('interestDetail.markMedium'), anchor: 'end' as const, dx: -2 },
    { at: LEVEL_HIGH_MIN, label: t('interestDetail.markHigh'), anchor: 'start' as const, dx: 2 },
  ];
  return (
    <svg viewBox={`0 0 ${width} 22`} className="w-full h-auto block" aria-hidden="true">
      <rect x={0.5} y={2.5} width={width - 1} height={6} rx={3} fill="none" stroke="var(--hairline)" strokeWidth={1} />
      <rect x={0} y={2} width={x(score)} height={7} rx={3.5} fill={LEVEL_FILL[level]} />
      {marks.map((mark) => (
        <g key={mark.at}>
          <line x1={x(mark.at)} x2={x(mark.at)} y1={0} y2={20} stroke="var(--text-muted)" strokeWidth={0.8} strokeDasharray="2 1.5" />
          <text x={x(mark.at) + mark.dx} y={19} textAnchor={mark.anchor} fontSize={7} fill="var(--text-muted)" fontFamily="var(--font-mono)">
            {mark.label}
          </text>
        </g>
      ))}
    </svg>
  );
}

function PrintAnswerBar({ distribution }: { distribution: number[] }) {
  const { t } = useTranslation('results');
  const total = distribution.reduce((sum, n) => sum + n, 0) || 1;
  const width = 300;
  let offset = 0;
  return (
    <div className="space-y-0.5">
      <svg viewBox={`0 0 ${width} 8`} className="w-full h-auto block" aria-hidden="true">
        {distribution.map((count, i) => {
          const w = (count / total) * width;
          const rect = count > 0 ? <rect key={i} x={offset} y={0} width={Math.max(0, w - 1)} height={8} fill={ANSWER_COLORS[i]} /> : null;
          offset += w;
          return rect;
        })}
      </svg>
      <p className="text-tiny leading-snug text-muted">
        {distribution.map((count, i) =>
          count > 0 ? (
            <span key={i} className="whitespace-nowrap mr-2.5">
              <svg viewBox="0 0 6 6" width={6} height={6} className="inline-block mr-1 align-middle" aria-hidden="true">
                <rect width={6} height={6} fill={ANSWER_COLORS[i]} />
              </svg>
              {t(`interestDetail.answer${i}`)} — {count}
            </span>
          ) : null,
        )}
      </p>
    </div>
  );
}
