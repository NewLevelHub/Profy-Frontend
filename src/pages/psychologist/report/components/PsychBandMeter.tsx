import { useTranslation } from 'react-i18next';
import { cn } from '@/shared/lib/cn';
import { ADMIN_NUM } from '@/shared/ui/admin/density';

export interface BandMark {
  label: string;
  min: number;
  max: number;
  color?: string;
  isCurrent?: boolean;
}

interface PsychBandMeterProps {
  value: number;
  max: number;
  bands?: BandMark[];
  label?: string;
  unit?: string;
}

/**
 * Visual meter with normative marks (equivalent to RIASEC's LevelMeter)
 * for the psychologist to quickly verify where the student's score lands.
 */
export function PsychBandMeter({ value, max, bands, label, unit }: PsychBandMeterProps) {
  const { t } = useTranslation('psychReport');
  const displayUnit = unit ?? t('psychReport:bandMeter.unit');
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className="flex flex-col gap-1.5 w-full">
      <div className="flex items-center justify-between gap-2">
        {label && <span className="text-caption font-medium text-secondary">{label}</span>}
        <span className={cn(ADMIN_NUM, 'text-primary font-semibold text-caption ml-auto')}>
          {value}/{max} {displayUnit}
        </span>
      </div>

      <div className="relative h-2.5 rounded-full overflow-hidden bg-raised border border-default/50">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-brand transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {bands && bands.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 pt-1 font-sans text-body-sm">
          {bands.map((b, i) => {
            const active = value >= b.min && value <= b.max;
            return (
              <div
                key={i}
                className={cn(
                  'px-2 py-1 rounded-[6px] text-center border transition-colors',
                  active
                    ? 'bg-brand-subtle border-brand text-brand font-semibold'
                    : 'bg-transparent border-transparent text-muted',
                )}
              >
                <span>{b.label}</span>
                <span className="font-mono text-mono-sm ml-1 opacity-75">
                  ({b.min}–{b.max})
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
