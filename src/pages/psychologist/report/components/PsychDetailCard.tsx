import type { ReactNode } from 'react';
import { AlertTriangle, CheckCircle2, HelpCircle, X } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { ADMIN_META, ADMIN_TEXT } from '@/shared/ui/admin/density';

interface PsychDetailCardProps {
  title: string;
  badge?: ReactNode;
  meaning?: string;
  means: string; // "В чём проявляется" (means)
  follows: string; // "Что из этого следует" (follows)
  why?: string; // "Почему такой результат" (evidence / norms)
  riskWarning?: string; // Зона риска
  children?: ReactNode;
  onClose?: () => void;
  className?: string;
}

/**
 * The psychologist's expanded "Why & How" detail panel under test sections.
 * Built strictly to mirror the RIASEC InterestTypeDetail gold standard pattern:
 * 1. Title, badge, essence summary
 * 2. In what way it manifests in life and studies (means)
 * 3. What follows for psychologist counseling & career choice (follows)
 * 4. Why this result occurred (evidence, norms, scoring explanation)
 * 5. Risk warnings / attention points when relevant
 */
export function PsychDetailCard({
  title,
  badge,
  meaning,
  means,
  follows,
  why,
  riskWarning,
  children,
  onClose,
  className,
}: PsychDetailCardProps) {
  return (
    <div
      role="region"
      aria-label={`Детальная расшифровка: ${title}`}
      className={cn(
        'mt-3.5 border border-brand/35 rounded-[14px] bg-[color-mix(in_srgb,var(--paper)_92%,var(--brand)_8%)] overflow-hidden shadow-sm transition-all',
        className,
      )}
    >
      {/* Header bar */}
      <div className="flex items-start justify-between gap-3 px-4 py-3 bg-[color-mix(in_srgb,var(--paper)_80%,transparent)] border-b border-brand/20">
        <div className="flex flex-col gap-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className={cn(ADMIN_TEXT, 'text-body-sm font-bold text-primary m-0')}>{title}</h3>
            {badge}
          </div>
          {meaning && <p className={cn(ADMIN_META, 'm-0 text-caption leading-snug')}>{meaning}</p>}
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-[6px] text-muted hover:text-primary hover:bg-raised transition-colors focus:outline-none focus:ring-1 focus:ring-brand flex-shrink-0"
            title="Свернуть расшифровку"
            aria-label="Свернуть"
          >
            <X size={15} />
          </button>
        )}
      </div>

      {/* Structured Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-brand/15">
        {/* Left Column: Means & Follows */}
        <div className="p-4 flex flex-col gap-3.5 min-w-0">
          <div>
            <div className="flex items-center gap-1.5 mb-1 text-primary">
              <span className="w-2 h-2 rounded-full bg-brand" />
              <h4 className="text-tiny uppercase tracking-label font-bold text-brand">В чём проявляется у подростка</h4>
            </div>
            <p className={cn(ADMIN_TEXT, 'text-primary leading-relaxed m-0')}>{means}</p>
          </div>

          <div>
            <div className="flex items-center gap-1.5 mb-1 text-primary">
              <CheckCircle2 size={13} className="text-accent flex-shrink-0" />
              <h4 className="text-tiny uppercase tracking-label font-bold text-accent">Что следует для консультации</h4>
            </div>
            <p className={cn(ADMIN_TEXT, 'text-secondary leading-relaxed m-0')}>{follows}</p>
          </div>
        </div>

        {/* Right Column: Why & Risks */}
        <div className="p-4 flex flex-col gap-3.5 min-w-0 bg-[color-mix(in_srgb,var(--paper)_65%,transparent)]">
          {why && (
            <div>
              <div className="flex items-center gap-1.5 mb-1 text-primary">
                <HelpCircle size={13} className="text-secondary flex-shrink-0" />
                <h4 className="text-tiny uppercase tracking-label font-bold text-secondary">Почему такой результат</h4>
              </div>
              <p className={cn(ADMIN_TEXT, 'text-muted leading-relaxed m-0')}>{why}</p>
            </div>
          )}

          {children && <div>{children}</div>}

          {riskWarning && (
            <div className="p-3 rounded-[10px] bg-danger-subtle/80 border border-danger/25 flex items-start gap-2.5 mt-auto">
              <AlertTriangle size={15} className="text-danger flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-tiny font-bold text-danger uppercase tracking-label m-0">Зона внимания и риски</p>
                <p className={cn(ADMIN_TEXT, 'text-danger m-0 mt-0.5 leading-snug')}>{riskWarning}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
