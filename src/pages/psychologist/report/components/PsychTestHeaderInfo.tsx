import { useState } from 'react';
import { ChevronDown, Info } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { ADMIN_META, ADMIN_TEXT } from '@/shared/ui/admin/density';
import type { TestMethodologyInfo } from '../model/psychTestExplanations';

interface PsychTestHeaderInfoProps {
  methodology: TestMethodologyInfo;
  defaultExpanded?: boolean;
}

/**
 * Collapsible methodological context block for psychologists.
 * Explains what the test measures, its scientific basis, and caveats.
 */
export function PsychTestHeaderInfo({ methodology, defaultExpanded = false }: PsychTestHeaderInfoProps) {
  const [isOpen, setIsOpen] = useState(defaultExpanded);

  return (
    <div className="mb-3.5 border border-default rounded-[12px] bg-[color-mix(in_srgb,var(--paper)_45%,transparent)] overflow-hidden transition-all">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-3 px-3.5 py-2.5 text-left hover:bg-[color-mix(in_srgb,var(--paper)_75%,transparent)] transition-colors focus:outline-none focus:ring-1 focus:ring-brand"
        aria-expanded={isOpen}
      >
        <span className="flex items-center gap-2 min-w-0">
          <Info size={14} className="text-brand flex-shrink-0" />
          <span className={cn(ADMIN_TEXT, 'font-medium text-primary')}>О тесте и методике</span>
          <span className={cn(ADMIN_META, 'truncate hidden sm:inline')}>— {methodology.subtitle}</span>
        </span>
        <span className="flex items-center gap-1.5 flex-shrink-0 text-muted">
          <span className={ADMIN_META}>{isOpen ? 'Свернуть' : 'Подробнее'}</span>
          <ChevronDown size={14} className={cn('transition-transform duration-200', isOpen && 'rotate-180')} />
        </span>
      </button>

      {isOpen && (
        <div className="px-3.5 pt-1 pb-3.5 flex flex-col gap-2.5 border-t border-default/70 text-body-sm">
          <div>
            <p className={cn(ADMIN_TEXT, 'text-primary font-semibold m-0')}>Что измеряет:</p>
            <p className={cn(ADMIN_TEXT, 'text-secondary m-0 mt-0.5 leading-relaxed')}>
              {methodology.whatItMeasures}
            </p>
          </div>

          <div>
            <p className={cn(ADMIN_TEXT, 'text-primary font-semibold m-0')}>Суть методики:</p>
            <p className={cn(ADMIN_TEXT, 'text-muted m-0 mt-0.5 leading-relaxed')}>
              {methodology.description}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1 border-t border-default/40">
            <span className={cn(ADMIN_META, 'font-sans text-body-sm')}>
              Источник: <span className="text-primary font-medium">{methodology.source}</span>
            </span>
          </div>

          {methodology.notes && (
            <div className="p-2.5 rounded-[8px] bg-brand-subtle/50 border border-brand/20">
              <p className={cn(ADMIN_TEXT, 'text-brand font-medium m-0')}>
                💡 Для специалиста: {methodology.notes}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
