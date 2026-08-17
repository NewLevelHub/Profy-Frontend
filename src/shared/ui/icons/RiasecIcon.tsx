import type { ReactElement, SVGAttributes } from 'react';

/** Matches RIASEC_TYPES in shared/config/constants.ts */
export type RiasecType = 'R' | 'I' | 'A' | 'S' | 'E' | 'C';

export interface RiasecIconProps extends Omit<SVGAttributes<SVGSVGElement>, 'viewBox'> {
  type: RiasecType;
  size?: number;
  strokeWidth?: number;
}

/**
 * "Тропа" visual system — RIASEC pictograms built from one shared primitive set
 * (circle, square, triangle, stroke) instead of a per-type color/emoji rainbow.
 * Color is not how types are told apart; only the leading type gets a color accent
 * via `className`/`stroke`, everything else stays currentColor.
 */
export function RiasecIcon({ type, size = 44, strokeWidth = 1.75, ...props }: RiasecIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 44 44"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {RIASEC_PATHS[type]}
    </svg>
  );
}

const RIASEC_PATHS: Record<RiasecType, ReactElement> = {
  R: (
    <>
      <rect x="8" y="8" width="28" height="28" />
      <line x1="8" y1="36" x2="36" y2="8" />
    </>
  ),
  I: (
    <>
      <circle cx="19" cy="19" r="11" />
      <circle cx="19" cy="19" r="3" fill="currentColor" stroke="none" />
      <line x1="27" y1="27" x2="37" y2="37" />
    </>
  ),
  A: (
    <>
      <polygon points="14,34 26,10 38,34" />
      <circle cx="15" cy="16" r="7" />
    </>
  ),
  S: (
    <>
      <circle cx="17" cy="22" r="9" />
      <circle cx="29" cy="22" r="9" />
    </>
  ),
  E: <polyline points="8,34 20,34 20,20 32,20 32,8 40,8" />,
  C: (
    <>
      <rect x="8" y="9" width="28" height="26" />
      <line x1="8" y1="18" x2="36" y2="18" />
      <line x1="8" y1="26" x2="36" y2="26" />
    </>
  ),
};
