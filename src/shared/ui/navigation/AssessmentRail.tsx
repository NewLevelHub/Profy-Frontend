import { useLayoutEffect, useRef } from 'react';
import { ArrowLeft, Volume2, VolumeX } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useSoundEnabled } from '@/shared/hooks/useSoundEnabled';
import { Spine } from '@/shared/ui/Spine';
import { ThemeToggle } from '@/shared/ui/ThemeToggle';

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
      <header
        ref={railRef}
        className="sticky top-0 z-10 px-3 pt-[18px] pb-4 sm:px-4 lg:px-6"
        style={{ background: 'color-mix(in srgb, var(--fog) 90%, transparent)', backdropFilter: 'blur(8px)' }}
      >
        {/* Same width as the stage card below (assessment-stage, 720px), so the
            back button, bar and exit line up with the card edges instead of
            stretching across the whole screen. */}
        <div className="w-full max-w-[720px] mx-auto">
          <div className="flex items-center justify-between mb-3 gap-2">
            {/* Slot 1: progress indicator (back + title fold in here) */}
            <div className="flex items-center gap-2 min-w-0 flex-1 min-h-[38px]">
              {showBack ? (
                <button
                  type="button"
                  onClick={onBack}
                  className="inline-flex items-center gap-1.5 shrink-0 text-brand text-label font-extrabold hover:opacity-70 transition-opacity border-none bg-transparent cursor-pointer p-0"
                >
                  <ArrowLeft className="w-4 h-4 flex-shrink-0" strokeWidth={2.25} aria-hidden="true" />
                  {t('common:back')}
                </button>
              ) : null}
              {title ? (
                <span className="font-extrabold text-primary truncate text-body-sm">
                  {title}
                </span>
              ) : null}
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              {statusSlotRef && <div ref={statusSlotRef} className="flex empty:hidden" />}
              <ThemeToggle />
              {/* Slot 2: sound toggle */}
              <button
                type="button"
                onClick={toggleSound}
                role="switch"
                aria-checked={soundEnabled}
                aria-label={soundLabel}
                title={soundLabel}
                className="w-[38px] h-[38px] flex items-center justify-center rounded-full bg-surface text-secondary transition-colors hover:bg-brand-subtle flex-shrink-0"
                style={{ boxShadow: 'var(--shadow-pop)' }}
              >
                {soundEnabled ? <Volume2 size={17} /> : <VolumeX size={17} />}
              </button>

              {/* Slot 3: exit action */}
              <button
                type="button"
                onClick={onExit}
                aria-label={t('assessment:rail.exit')}
                className="w-[38px] h-[38px] flex items-center justify-center rounded-full bg-surface text-muted text-body-md leading-none transition-colors hover:bg-danger-subtle hover:text-danger flex-shrink-0"
                style={{ boxShadow: 'var(--shadow-pop)' }}
              >
                ✕
              </button>
            </div>
          </div>

          {/* Section label · bar · percent on one line, so the label and the
              number read as belonging to the bar rather than to opposite
              screen edges. */}
          <div className="flex items-center gap-3 text-mono-sm">
            <span className="font-bold text-muted shrink-0 max-w-[45%] truncate">{sectionLabel}</span>
            <Spine value={progress} ariaLabel={progressAriaLabel} flat thickness={4 / 3} className="flex-1" />
            <span className="font-bold text-muted shrink-0 w-[4ch] text-right tabular-nums">{Math.round(progress)}%</span>
          </div>
        </div>
      </header>

      {/* Dev-only autofill — pre-existing dev tool, kept out of the rail so
          the 720px row stays as it ships. Rendered outside <header>: its
          backdrop-filter would turn `fixed` into header-relative. Strings are gated behind
          import.meta.env.DEV, never ship to users, so they're intentionally
          left un-localized. */}
      {devButtons && (
        <div className="fixed left-3 bottom-3 z-20 flex flex-col items-start gap-2">
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
      )}
    </>
  );
}
