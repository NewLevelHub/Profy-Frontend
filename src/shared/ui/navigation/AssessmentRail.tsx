import { ArrowLeft, Volume2, VolumeX } from 'lucide-react';
import { useLayoutEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useSoundEnabled } from '@/shared/hooks/useSoundEnabled';
import { Spine } from '@/shared/ui/Spine';
import { ThemeToggle } from '@/shared/ui/ThemeToggle';

export interface AssessmentRailProps {
  /** Text next to the back button (e.g. "Вопрос 3 из 20" or the flow's static title). */
  title: string;
  /** Constant label shown bottom-left under the progress bar (e.g. "Тест RIASEC"). */
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
}: AssessmentRailProps) {
  const { t } = useTranslation();
  const { soundEnabled, toggleSound } = useSoundEnabled();
  const soundLabel = t(soundEnabled ? 'common:sound.disable' : 'common:sound.enable');
  const headerRef = useRef<HTMLElement>(null);

  // The rail is sticky; things that stick below it (the ASTUR timer) read
  // its live height from --assessment-rail-h instead of guessing per breakpoint.
  useLayoutEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const root = document.documentElement;
    const sync = () => root.style.setProperty('--assessment-rail-h', `${el.offsetHeight}px`);
    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(el);
    return () => {
      ro.disconnect();
      root.style.removeProperty('--assessment-rail-h');
    };
  }, []);

  return (
    <header
      ref={headerRef}
      className="sticky top-0 z-10 px-3 pt-[18px] pb-4 sm:px-4 lg:px-6"
      style={{ background: 'color-mix(in srgb, var(--fog) 90%, transparent)', backdropFilter: 'blur(8px)' }}
    >
      <div className="flex items-center justify-between w-full max-w-7xl mx-auto mb-[14px] gap-2">
        {/* Slot 1: progress indicator (back + title fold in here) */}
        <div className="flex items-center gap-2 min-w-0 flex-1">
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
          <span className="font-extrabold text-primary truncate text-body-sm">
            {title}
          </span>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Dev-only autofill — pre-existing dev tool, kept out of the 3 prod
              slots. Strings are gated behind import.meta.env.DEV, never ship to
              users, so they're intentionally left un-localized. */}
          {import.meta.env.DEV && devAutofill && (
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

          {import.meta.env.DEV && devAutofillToMotivation && (
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

          {import.meta.env.DEV && devAutofillToAstur && (
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

      <div className="w-full max-w-7xl mx-auto">
        <Spine value={progress} ariaLabel={progressAriaLabel} flat />
        <div className="flex justify-between mt-2 mx-0.5 text-mono-sm">
          <span className="font-bold text-muted">{sectionLabel}</span>
          <span className="font-bold text-muted">{Math.round(progress)}%</span>
        </div>
      </div>
    </header>
  );
}
