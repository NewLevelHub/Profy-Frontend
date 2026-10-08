import { useEffect, useRef, type ReactNode } from 'react';
import { Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { JourneyShell } from '@/shared/ui/redesign/JourneyShell';
import { OnboardingProgress } from './OnboardingProgress';
import { TOTAL_ONBOARDING_STEPS } from '../onboardingSteps';

const STEP_KEYS = ['about', 'subjects', 'interests', 'dreams'] as const;

export function OnboardingShell({ current, children, actions, sections, onSectionSelect, showCompanion = true }: {
  current: number;
  children: ReactNode;
  actions: ReactNode;
  sections?: string[];
  onSectionSelect?: (index: number) => void;
  showCompanion?: boolean;
}) {
  const { t } = useTranslation('onboarding');
  const labels = sections ?? STEP_KEYS.map(key => t(`redesign.steps.${key}`));
  const contentRef = useRef<HTMLElement>(null);
  useEffect(() => {
    contentRef.current?.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [current]);

  return (
    <JourneyShell>
      <div className="rd-setup-layout">
        <aside className="rd-setup-sidebar">
          
          <h2>{t(sections ? 'artifacts.editTitle' : 'redesign.title')}</h2>
          <ol className={`rd-setup-steps${sections ? ' rd-setup-steps--editable' : ''}`} aria-label={t('redesign.stepsLabel')}>
            {labels.map((label, index) => {
              const number = index + 1;
              const marker = <span className="rd-step-number" aria-hidden="true">{!sections && number < current ? <Check size={16} /> : number}</span>;
              return (
                <li key={label} className={number === current ? 'is-current' : !sections && number < current ? 'is-done' : undefined}>
                  {onSectionSelect ? (
                    <button type="button" aria-current={number === current ? 'step' : undefined} onClick={() => onSectionSelect(index)}>{marker}<span>{label}</span></button>
                  ) : (
                    <div aria-current={number === current ? 'step' : undefined}>{marker}<span>{label}</span></div>
                  )}
                </li>
              );
            })}
          </ol>
          {showCompanion && <div className="rd-setup-companion">
            <img src="/mascot/redesign/book.png" alt="" width="1254" height="1254" />
            <p>{t('redesign.companion')}</p>
          </div>}
        </aside>
        <main ref={contentRef} id="journey-content" tabIndex={-1} className="rd-setup-card">
          <OnboardingProgress current={current} total={sections?.length ?? TOTAL_ONBOARDING_STEPS} />
          <div className="rd-setup-content">{children}</div>
          <footer className="rd-setup-actions">{actions}</footer>
        </main>
      </div>
    </JourneyShell>
  );
}
