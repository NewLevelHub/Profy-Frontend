import { Trans, useTranslation } from 'react-i18next';
import { RiasecIcon, type RiasecType } from '@/shared/ui/icons/RiasecIcon';
import type { InterestLevel, InterestMapItem, InterestMapItemDetails } from '@/shared/types';
import { LEVEL_HIGH_MIN, LEVEL_MEDIUM_MIN } from '../utils/interestHeadline';
import { LEVEL_STATUS_LABEL } from './DomainCardParts';

const LEVEL_FILL: Record<InterestLevel, string> = {
  high: 'var(--pine)',
  medium: 'var(--dawn)',
  low: 'var(--text-subtle)',
};

// Strongest liking first — same order as `details.distribution`. Pine for
// liking, clay for rejecting, a neutral line color for "не уверен".
const ANSWER_COLORS = [
  'var(--pine)',
  'color-mix(in srgb, var(--pine) 50%, var(--bg-surface))',
  'var(--border)',
  'color-mix(in srgb, var(--clay) 50%, var(--bg-surface))',
  'var(--clay)',
];

const VERDICT_KEY: Record<InterestLevel, string> = {
  high: 'results:interestDetail.verdictHigh',
  medium: 'results:interestDetail.verdictMedium',
  low: 'results:interestDetail.verdictLow',
};

export function DetailTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-caption font-semibold uppercase tracking-label" style={{ color: 'var(--text-muted)' }}>
      {children}
    </h3>
  );
}

interface InterestTypeDetailProps {
  item: InterestMapItem & { details: InterestMapItemDetails };
  label: string;
  summary: string;
}

/**
 * The expanded "why" panel under the interest grid (PRO-336) — one RIASEC
 * type at a time, in the order a counsellor explains it: what the interest
 * looks like in life, what the level is made of (the student's own answer
 * counts against the two level marks), and the actual statements behind it.
 */
export function InterestTypeDetail({ item, label, summary }: InterestTypeDetailProps) {
  const { t } = useTranslation();
  const { details, level } = item;
  const isLow = level === 'low';

  return (
    <div
      id="interest-type-detail"
      aria-live="polite"
      className="border border-[var(--border)] rounded-[var(--radius)] bg-surface"
    >
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 sm:px-5 py-4 border-b border-[var(--border)]">
        <span
          className="w-11 h-11 rounded-[var(--radius)] grid place-items-center flex-shrink-0"
          style={{
            background: isLow ? 'var(--bg-raised)' : LEVEL_FILL[level],
            color: isLow ? 'var(--text-muted)' : 'var(--text-on-brand)',
          }}
        >
          <RiasecIcon type={item.code as RiasecType} size={28} strokeWidth={2} />
        </span>
        <div className="flex flex-col items-start gap-1">
          <p className="text-body font-bold leading-tight text-[color:var(--text-heading)]">{label}</p>
          <span
            className="font-mono text-tiny uppercase tracking-label px-2 py-0.5 rounded-[6px]"
            style={{
              background: isLow ? 'var(--bg-raised)' : LEVEL_FILL[level],
              color: isLow ? 'var(--text-muted)' : 'var(--text-on-brand)',
            }}
          >
            {t(LEVEL_STATUS_LABEL[level])}
          </span>
        </div>
        <p className="text-body-sm flex-1 min-w-[240px]" style={{ color: 'var(--text-muted)' }}>{summary}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_1fr_1fr] divide-y lg:divide-y-0 lg:divide-x divide-[var(--border)]">
        <div className="p-4 sm:p-5 flex flex-col gap-3 min-w-0">
          <DetailTitle>{t('results:interestDetail.meansTitle')}</DetailTitle>
          <div className="flex flex-col gap-1">
            <p className="text-body-sm font-semibold text-[color:var(--text-heading)]">{t('results:interestDetail.meansSub')}</p>
            <p className="text-body-sm leading-relaxed" style={{ color: 'var(--ink)' }}>{details.means}</p>
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-body-sm font-semibold text-[color:var(--text-heading)]">{t('results:interestDetail.followsSub')}</p>
            <p className="text-body-sm leading-relaxed" style={{ color: 'var(--ink)' }}>{details.follows}</p>
          </div>
        </div>

        <div className="p-4 sm:p-5 flex flex-col gap-3 min-w-0">
          <DetailTitle>{t('results:interestDetail.whyTitle')}</DetailTitle>
          <p className="text-body-sm leading-relaxed" style={{ color: 'var(--ink)' }}>
            <Trans
              i18nKey="results:interestDetail.whyCounts"
              values={{ answered: details.answered, likes: details.likes, dislikes: details.dislikes }}
              components={{ 1: <strong className="font-mono font-semibold tabular-nums text-[color:var(--text-heading)]" /> }}
            />
          </p>
          <AnswerDistribution distribution={details.distribution} />
          <LevelMeter score={details.score} level={level} />
          <p className="text-caption" style={{ color: 'var(--text-muted)' }}>{t(VERDICT_KEY[level])}</p>
        </div>

        <div className="p-4 sm:p-5 flex flex-col gap-3 min-w-0">
          <DetailTitle>{t('results:interestDetail.quotesTitle')}</DetailTitle>
          {details.quotes.length > 0 ? (
            <ul className="flex flex-col gap-2.5">
              {details.quotes.map((quote) => (
                <li
                  key={quote.text}
                  className="flex flex-col gap-0.5 pl-3 border-l-2"
                  style={{ borderColor: quote.answer === 'like' ? 'var(--pine)' : 'var(--clay)' }}
                >
                  <span className="text-body-sm text-[color:var(--text-heading)]">«{quote.text}»</span>
                  <span className="font-mono text-tiny uppercase tracking-label" style={{ color: 'var(--text-muted)' }}>
                    {t(quote.answer === 'like' ? 'results:interestDetail.quoteLike' : 'results:interestDetail.quoteDislike')}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-caption" style={{ color: 'var(--text-muted)' }}>{t('results:interestDetail.quotesEmpty')}</p>
          )}
        </div>
      </div>
    </div>
  );
}

function AnswerDistribution({ distribution }: { distribution: number[] }) {
  const { t } = useTranslation();
  const labels = distribution.map((_, i) => t(`results:interestDetail.answer${i}`));
  return (
    <div className="flex flex-col gap-2">
      <div
        className="flex h-3.5 rounded-[4px] overflow-hidden gap-0.5"
        role="img"
        aria-label={distribution.map((count, i) => `${labels[i]}: ${count}`).join(', ')}
      >
        {distribution.map((count, i) =>
          count > 0 ? <span key={i} className="h-full" style={{ flex: count, background: ANSWER_COLORS[i] }} /> : null,
        )}
      </div>
      <div className="grid grid-cols-[auto_1fr_auto] gap-x-2 gap-y-1 items-center text-caption" style={{ color: 'var(--ink)' }}>
        {distribution.map((count, i) => (
          <div key={i} className="contents">
            <span className="w-2.5 h-2.5 rounded-[2px]" style={{ background: ANSWER_COLORS[i] }} aria-hidden="true" />
            <span>{labels[i]}</span>
            <span className="font-mono tabular-nums text-right text-[color:var(--text-heading)]">{count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function LevelMeter({ score, level }: { score: number; level: InterestLevel }) {
  const { t } = useTranslation();
  const marks = [
    { at: LEVEL_MEDIUM_MIN, label: t('results:interestDetail.markMedium') },
    { at: LEVEL_HIGH_MIN, label: t('results:interestDetail.markHigh') },
  ];
  return (
    <div className="relative pt-1 pb-7 mt-1" aria-hidden="true">
      <div className="relative h-2.5 rounded-full overflow-hidden bg-[var(--bg-raised)]">
        <div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{ width: `${Math.min(100, Math.max(0, score))}%`, background: LEVEL_FILL[level] }}
        />
      </div>
      {marks.map((mark) => (
        <span
          key={mark.at}
          className="absolute top-0 h-[18px] border-l-[1.5px] border-dashed"
          style={{ left: `${mark.at}%`, borderColor: 'var(--text-muted)' }}
        >
          <span
            className="absolute top-5 -translate-x-1/2 font-mono text-tiny uppercase tracking-label whitespace-nowrap"
            style={{ color: 'var(--text-muted)' }}
          >
            {mark.label}
          </span>
        </span>
      ))}
    </div>
  );
}
