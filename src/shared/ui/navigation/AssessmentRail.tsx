import { useLayoutEffect, useRef } from 'react';
import { ArrowLeft, Volume2, VolumeX, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useSoundEnabled } from '@/shared/hooks/useSoundEnabled';
import { Spine } from '@/shared/ui/Spine';
import { ThemeToggle } from '@/shared/ui/ThemeToggle';
import { Brand } from '@/shared/ui/redesign/Brand';

export interface AssessmentRailProps {
  /** Text next to the back button (e.g. "Вопрос 3 из 20" or the flow's static title). Omit to show only the back button. */
  title?: string;
  /** Constant label shown inline before the progress bar (e.g. "Тест RIASEC"). */
  sectionLabel: string;
  /** aria-label for the progress bar element itself. */
  progressAriaLabel: string;
  /** 0–100 */
  progress: number;
  /** Shown when the learner can step back to the previous question. */
  showBack?: boolean;
  onBack?: () => void;
  onExit: () => void;
  exitDisabled?: boolean;
  /** Dev-only "autofill" affordance already present on these flows; kept as
   *  a 4th, dev-gated slot rather than folded into the 3 production slots. */
  devAutofill?: { onClick: () => void; loading: boolean };
  /** Dev-only "autofill main battery, then stop right before motivation" —
   *  a separate action from `devAutofill` (which races through motivation
   *  too): for testing the motivation screen itself by hand without
   *  clicking through the whole Likert/pairs battery first. Only offered on
   *  the main-battery screen (AssessmentPage), not on
   *  the motivation screens themselves (nothing left to skip to). */
  devAutofillToMotivation?: { onClick: () => void; loading: boolean };
  /** Dev-only "autofill main battery + motivation + Belbin, then stop right
   *  before АСТУР" — same idea as `devAutofillToMotivation` but one phase
   *  further, for testing the АСТУР flow itself without clicking through
   *  everything ahead of it. Only offered on the main-battery screens. */
  devAutofillToAstur?: { onClick: () => void; loading: boolean };
  /** Ref for an empty slot left of the theme toggle. A screen that owns
   *  live status for the header (АСТУР's countdown) portals it in here, so
   *  the state stays with the screen instead of being lifted to the page. */
  statusSlotRef?: (el: HTMLDivElement | null) => void;
}

// The single collapsed rail used by every assessment-flow screen
// (AssessmentPage, MotivationTripletFlow). Per the nav-shell spec these screens don't get the
// full TopRail — they collapse to exactly three elements: progress
// indicator · sound toggle · exit action.
//
// Decision: the previous bespoke header also had a back-arrow + title above
// the bar. Rather than drop that behavior, it's folded into the "progress
// indicator" slot (back button + title + bar all read as one unit) so
// back-navigation isn't silently lost — see AppLayout/AssessmentPage report
// notes for the full rationale.
export function AssessmentRail({
  title,
  sectionLabel,
  progressAriaLabel,
  progress,
  showBack = false,
  onBack,
  onExit,
  exitDisabled = false,
  devAutofill,
  devAutofillToMotivation,
  devAutofillToAstur,
  statusSlotRef,
}: AssessmentRailProps) {
  const { t } = useTranslation();
  const { soundEnabled, toggleSound } = useSoundEnabled();
  const soundLabel = t(soundEnabled ? 'common:sound.disable' : 'common:sound.enable');
  const railRef = useRef<HTMLElement>(null);

  // The rail sits in flow, so anything centered *below* it lands half a rail
  // too low on screen. Publish the measured height so the stage card
  // (AssessmentStageShell) can center itself against the viewport instead of
  // against the strip under the rail. Measured, not hardcoded: the title wraps
  // on narrow screens and the rail grows.
  useLayoutEffect(() => {
    const el = railRef.current;
    if (!el) return;

    const publish = () => {
      document.documentElement.style.setProperty(
        '--assessment-rail-h',
        `${Math.round(el.getBoundingClientRect().height)}px`,
      );
    };

    publish();
    const observer = new ResizeObserver(publish);
    observer.observe(el);

    return () => {
      observer.disconnect();
      document.documentElement.style.removeProperty('--assessment-rail-h');
    };
  }, []);

  const devButtons = import.meta.env.DEV && (devAutofill || devAutofillToMotivation || devAutofillToAstur);

  return (
    <>
      <header ref={railRef} className="rd-assessment-rail">
        <div className="rd-assessment-rail-inner">
          <Brand linked={false} />
          <div className="rd-assessment-progress">
            <div className="rd-assessment-progress-label">
              <span>{sectionLabel}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Spine value={progress} ariaLabel={progressAriaLabel} flat thickness={5 / 3} />
            {(showBack || (title && title !== sectionLabel)) && (
              <div className="rd-assessment-progress-detail">
                {showBack && (
                  <button type="button" onClick={onBack}>
                    <ArrowLeft size={15} aria-hidden="true" />{t('common:back')}
                  </button>
                )}
                {title && title !== sectionLabel && <span>{title}</span>}
              </div>
            )}
          </div>
          <div className="rd-assessment-controls">
            {statusSlotRef && <div ref={statusSlotRef} className="rd-assessment-status flex empty:hidden" />}
            <ThemeToggle />
            <button type="button" onClick={toggleSound} role="switch" aria-checked={soundEnabled}
              aria-label={soundLabel} title={soundLabel} className="rd-icon-button">
              {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
            </button>
            <button type="button" onClick={onExit} disabled={exitDisabled} aria-label={t('assessment:rail.exit')}
              title={t('assessment:rail.exit')} className="rd-icon-button disabled:cursor-not-allowed disabled:opacity-40">
              <X size={19} aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      {/* Dev-only autofill — pre-existing dev tool, kept out of the rail so
          the 720px row stays as it ships. Rendered outside the sticky <header>,
          so `fixed` stays viewport-relative. Strings are gated behind
          import.meta.env.DEV, never ship to users, so they're intentionally
          left un-localized. */}
      {devButtons && (
        <details className="rd-assessment-dev fixed left-3 bottom-3 z-20 rounded-xl bg-surface p-2 text-secondary text-caption shadow-pop">
          <summary className="cursor-pointer px-2 py-1">Dev</summary>
          <div className="flex flex-col items-start gap-2 pt-2">
          {devAutofill && (
            <button
              type="button"
              onClick={devAutofill.onClick}
              disabled={devAutofill.loading}
              aria-label="Автозаполнить тест (dev)"
              title="Автозаполнить тест случайными ответами (только в dev)"
              className="h-[38px] px-3 flex items-center justify-center gap-1 rounded-pill bg-surface text-secondary text-caption font-bold transition-colors hover:bg-brand-subtle hover:text-brand disabled:opacity-50"
              style={{ boxShadow: 'var(--shadow-pop)' }}
            >
              {devAutofill.loading ? '…' : '⚡ Автозаполнить'}
            </button>
          )}

          {devAutofillToMotivation && (
            <button
              type="button"
              onClick={devAutofillToMotivation.onClick}
              disabled={devAutofillToMotivation.loading}
              aria-label="Автозаполнить до мотивации (dev)"
              title="Автозаполнить основную батарею и остановиться перед блоком мотивации (только в dev)"
              className="h-[38px] px-3 flex items-center justify-center gap-1 rounded-pill bg-surface text-secondary text-caption font-bold transition-colors hover:bg-brand-subtle hover:text-brand disabled:opacity-50"
              style={{ boxShadow: 'var(--shadow-pop)' }}
            >
              {devAutofillToMotivation.loading ? '…' : '⚡ До мотивации'}
            </button>
          )}

          {devAutofillToAstur && (
            <button
              type="button"
              onClick={devAutofillToAstur.onClick}
              disabled={devAutofillToAstur.loading}
              aria-label="Автозаполнить до Астур теста (dev)"
              title="Автозаполнить основную батарею, мотивацию и Белбина, остановиться перед АСТУР (только в dev)"
              className="h-[38px] px-3 flex items-center justify-center gap-1 rounded-pill bg-surface text-secondary text-caption font-bold transition-colors hover:bg-brand-subtle hover:text-brand disabled:opacity-50"
              style={{ boxShadow: 'var(--shadow-pop)' }}
            >
              {devAutofillToAstur.loading ? '…' : '⚡ До Астур теста'}
            </button>
          )}
          </div>
        </details>
      )}
    </>
  );
}
