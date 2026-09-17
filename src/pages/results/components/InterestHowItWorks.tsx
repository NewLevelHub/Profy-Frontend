import { Trans, useTranslation } from 'react-i18next';
import type { InterestCombination, InterestMapItem } from '@/shared/types';
import { LEVEL_HIGH_MIN, LEVEL_MEDIUM_MIN } from '../utils/interestHeadline';
import { DetailTitle } from './InterestTypeDetail';

// Holland's hexagon order — neighbours are similar types, opposite corners
// are the most different. Same order as the backend's HOLLAND_ORDER.
const HEXAGON_ORDER = ['R', 'I', 'A', 'S', 'E', 'C'];

interface InterestHowItWorksProps {
  items: InterestMapItem[];
  labels: Record<string, string>;
  combination: InterestCombination | null;
}

/**
 * Bottom of the RIASEC section (PRO-336): how the levels were computed, in
 * three plain steps, next to the student's profile drawn on Holland's
 * hexagon with the two level marks as rings — the same marks the meter in
 * InterestTypeDetail uses, so both pictures read against one scale.
 */
export function InterestHowItWorks({ items, labels, combination }: InterestHowItWorksProps) {
  const { t } = useTranslation();
  const answered = items.map((i) => i.details?.answered ?? 0).filter((n) => n > 0);
  if (answered.length === 0) return null;
  const strong = <strong className="font-semibold text-[color:var(--text-heading)]" />;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-px bg-[var(--border)] border border-[var(--border)] rounded-[var(--radius)] overflow-hidden">
      <div className="bg-surface p-4 sm:p-5 flex flex-col gap-4">
        <DetailTitle>{t('results:interestDetail.methodTitle')}</DetailTitle>
        <ol className="flex flex-col gap-3.5">
          {['method1', 'method2', 'method3'].map((key, index) => (
            <li key={key} className="grid grid-cols-[28px_1fr] gap-2.5 text-body-sm leading-relaxed" style={{ color: 'var(--ink)' }}>
              <span
                className="w-[26px] h-[26px] rounded-full grid place-items-center font-mono text-mono-xs font-semibold border-[1.5px]"
                style={{ borderColor: 'var(--pine)', color: 'var(--pine)' }}
                aria-hidden="true"
              >
                {index + 1}
              </span>
              <span>
                <Trans
                  i18nKey={`results:interestDetail.${key}`}
                  values={{
                    total: answered.reduce((sum, n) => sum + n, 0),
                    min: Math.min(...answered),
                    max: Math.max(...answered),
                  }}
                  components={{ 1: strong }}
                />
              </span>
            </li>
          ))}
        </ol>
        <p className="text-caption" style={{ color: 'var(--text-muted)' }}>{t('results:interestDetail.methodNote')}</p>
      </div>

      <div className="bg-surface p-4 sm:p-5 flex flex-col gap-3">
        <DetailTitle>{t('results:interestDetail.hexTitle')}</DetailTitle>
        <HollandHexagon items={items} labels={labels} combination={combination} />
        <p className="text-body-sm leading-relaxed" style={{ color: 'var(--ink)' }}>{t('results:interestDetail.hexIntro')}</p>
        {combination && (
          <p className="text-body-sm leading-relaxed text-[color:var(--text-heading)] font-medium">{combination.text}</p>
        )}
      </div>
    </div>
  );
}

/** Also used by the printable report (print/PrintInterestDetails). */
export function HollandHexagon({ items, labels, combination }: InterestHowItWorksProps) {
  const { t } = useTranslation();
  const byCode = Object.fromEntries(items.map((i) => [i.code, i]));
  const width = 520;
  const height = 290;
  const cx = width / 2;
  const cy = height / 2;
  const radius = 100;
  const labelRadius = 116;
  const point = (index: number, r: number): [number, number] => {
    const angle = ((-90 + index * 60) * Math.PI) / 180;
    return [cx + r * Math.cos(angle), cy + r * Math.sin(angle)];
  };
  const polygon = (r: number) => HEXAGON_ORDER.map((_, i) => point(i, r).map((v) => v.toFixed(1)).join(',')).join(' ');
  const profile = HEXAGON_ORDER.map((code, i) =>
    point(i, (radius * Math.min(100, byCode[code]?.details?.score ?? 0)) / 100).map((v) => v.toFixed(1)).join(','),
  ).join(' ');
  const pair = combination?.codes.map((code) => HEXAGON_ORDER.indexOf(code)).filter((i) => i >= 0) ?? [];

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full max-w-[520px] h-auto mx-auto" role="img" aria-label={t('results:interestDetail.hexAria')}>
      <polygon points={polygon(radius)} fill="none" stroke="var(--hairline)" strokeWidth={1.2} />
      <polygon points={polygon((radius * LEVEL_HIGH_MIN) / 100)} fill="none" stroke="var(--text-muted)" strokeWidth={1} strokeDasharray="3 4" opacity={0.7} />
      <polygon points={polygon((radius * LEVEL_MEDIUM_MIN) / 100)} fill="none" stroke="var(--text-muted)" strokeWidth={1} strokeDasharray="3 4" opacity={0.45} />
      {HEXAGON_ORDER.map((code, i) => {
        const [x, y] = point(i, radius);
        return <line key={code} x1={cx} y1={cy} x2={x} y2={y} stroke="var(--border)" strokeWidth={1} />;
      })}
      {pair.length === 2 && (
        <line
          x1={point(pair[0], radius)[0]}
          y1={point(pair[0], radius)[1]}
          x2={point(pair[1], radius)[0]}
          y2={point(pair[1], radius)[1]}
          stroke="var(--dawn)"
          strokeWidth={1.6}
          strokeDasharray="5 4"
        />
      )}
      <polygon
        points={profile}
        fill="color-mix(in srgb, var(--pine) 22%, transparent)"
        stroke="var(--pine)"
        strokeWidth={2}
        strokeLinejoin="round"
      />
      {HEXAGON_ORDER.map((code, i) => {
        const item = byCode[code];
        const leading = item?.level === 'high';
        const [x, y] = point(i, radius);
        const [lx, ly] = point(i, labelRadius);
        const anchor = Math.abs(lx - cx) < 4 ? 'middle' : lx > cx ? 'start' : 'end';
        const dy = ly < cy - 60 ? -4 : ly > cy + 60 ? 14 : 5;
        return (
          <g key={code}>
            <circle
              cx={x}
              cy={y}
              r={leading ? 6 : 4}
              fill={leading ? 'var(--pine)' : 'var(--bg-surface)'}
              stroke={leading ? 'var(--pine)' : 'var(--hairline)'}
              strokeWidth={1.5}
            />
            <text
              x={lx}
              y={ly + dy}
              textAnchor={anchor}
              fontSize={12.5}
              fontWeight={leading ? 650 : 450}
              fill={leading ? 'var(--text-heading)' : 'var(--text-muted)'}
            >
              {labels[code] ?? item?.sphere ?? code}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
