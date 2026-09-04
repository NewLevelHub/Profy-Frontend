import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/shared/lib/cn';
import { Button, Input, Mascot } from '@/shared/ui';
import { Heading } from '@/shared/ui/typography/Heading';
import { useProfileSetup, PROFILE_STEPS, NAME_MAX_LENGTH, sanitizeName } from './hooks/useProfileSetup';
import { OnboardingProgress } from './components/OnboardingProgress';
import { SelectableChip } from './components/SelectableChip';
import { ExamScoresBlock } from './components/ExamScoresBlock';
import { TOTAL_ONBOARDING_STEPS } from './onboardingSteps';

// `value` is the canonical (ru) string stored on the profile and sent to the
// API — locale-independent, unchanged when the UI switches to kk. `key` is the
// display label, resolved with t(). Custom subjects the student types are kept
// verbatim. A backend `subject_code` catalog is deferred to KZ-503.
const SUBJECT_OPTIONS = [
  { value: 'Математика', key: 'subject.math' },
  { value: 'Физика', key: 'subject.physics' },
  { value: 'Химия', key: 'subject.chemistry' },
  { value: 'Биология', key: 'subject.biology' },
  { value: 'История', key: 'subject.history' },
  { value: 'География', key: 'subject.geography' },
  { value: 'Русский язык', key: 'subject.russian' },
  { value: 'Литература', key: 'subject.literature' },
  { value: 'Английский язык', key: 'subject.english' },
  { value: 'Информатика', key: 'subject.informatics' },
  { value: 'Физкультура', key: 'subject.pe' },
  { value: 'Рисование', key: 'subject.art' },
  { value: 'Музыка', key: 'subject.music' },
] as const;
const SUBJECT_VALUES: string[] = SUBJECT_OPTIONS.map(s => s.value);
const SUBJECT_KEY: Record<string, string> = Object.fromEntries(
  SUBJECT_OPTIONS.map(s => [s.value, s.key]),
);

const AGES = Array.from({ length: 5 }, (_, i) => 14 + i); // 14–18

// One mascot per step, `position: fixed` to the viewport's bottom-right
// corner (not inline with the heading anymore — content/buttons stay
// centered in their own column, the mascot floats independently of that
// axis) — a different pose per step so the 4 onboarding screens read as
// distinct moments rather than a repeated icon. Sizes are calibrated per
// pose to a common ~182px rendered character height (all 4 onboarding
// poses scaled up ~2.5x together from the original ~73px calibration, so
// the relative proportions between poses stay intact) — each pose is a
// separate PNG with its own canvas padding (measured via each sprite's
// alpha bounding box: greeting 461/480h, book 467/430h), so the same
// `size` prop would otherwise render visibly different heights.
// 'transition'/'pause' (the other two calibrated poses) are used on
// ArtifactsSetupPage's two steps — see its own MASCOT_*_SIZE constants.
const MASCOT_WELCOME_SIZE = 192;
const MASCOT_WAITING_SIZE = 168;

// ── Sub-components ────────────────────────────────────────────────────────────

/** Subject chip — per spec, selection is marked with a dawn border (not a
 *  fill), unselected chips sit on a plain hairline border. Deliberately
 *  neutral: never colored to imply "good"/"bad" (screen 6 relies on this
 *  for its easy vs. struggle columns). */
function SubjectChip({
  label, selected, onClick, disabled, disabledTitle,
}: {
  label: string; selected: boolean; onClick: () => void; disabled?: boolean; disabledTitle?: string;
}) {
  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      aria-disabled={disabled}
      title={disabled ? disabledTitle : undefined}
      className="px-3 py-1.5 rounded-pill text-small font-medium transition-colors disabled:cursor-not-allowed"
      style={{
        background: 'var(--bg-surface)',
        color: disabled ? 'var(--mute)' : selected ? 'var(--midnight)' : 'var(--ink)',
        border: selected ? '1.5px solid var(--dawn)' : '1.5px solid var(--line)',
        opacity: disabled ? 0.45 : 1,
      }}
    >
      {label}
    </button>
  );
}

/** The dashed "+ своё" chip — click reveals an inline text field to add a
 *  subject that isn't in the fixed catalog. */
function AddCustomChip({ onAdd }: { onAdd: (value: string) => void }) {
  const { t } = useTranslation('onboarding');
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('');

  function commit() {
    const trimmed = value.trim();
    if (trimmed) onAdd(trimmed);
    setValue('');
    setOpen(false);
  }

  if (open) {
    return (
      <input
        autoFocus
        value={value}
        onChange={e => setValue(e.target.value)}
        onBlur={commit}
        onKeyDown={e => {
          if (e.key === 'Enter') { e.preventDefault(); commit(); }
          if (e.key === 'Escape') { setValue(''); setOpen(false); }
        }}
        placeholder={t('profile.customSubjectPlaceholder')}
        className="px-3 py-1.5 rounded-pill text-small font-medium w-32 focus:outline-none"
        style={{ background: 'var(--bg-surface)', border: '1.5px solid var(--dawn)', color: 'var(--midnight)' }}
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => setOpen(true)}
      className="px-3 py-1.5 rounded-pill text-small font-medium transition-colors"
      style={{ background: 'transparent', color: 'var(--mute)', border: '1.5px dashed var(--hairline)' }}
    >
      {t('profile.addCustom')}
    </button>
  );
}

function SubjectGroup({
  title, note, selected, onToggle, onAddCustom, otherSelected,
}: {
  title: string; note?: string; selected: string[];
  onToggle: (s: string) => void;
  onAddCustom?: (s: string) => void;
  /** Subjects already picked in the sibling group (e.g. "легко" vs.
   *  "стараться больше") — same subject can't mean both, so these render
   *  disabled here until deselected on the other side. */
  otherSelected?: string[];
}) {
  const { t } = useTranslation('onboarding');
  const custom = selected.filter(s => !SUBJECT_VALUES.includes(s));
  return (
    <div className="flex flex-col gap-2">
      <div>
        <p className="text-label font-semibold" style={{ color: 'var(--midnight)' }}>{title}</p>
        {note && <p className="text-small text-muted mt-0.5">{note}</p>}
      </div>
      <div className="flex flex-wrap gap-2">
        {SUBJECT_OPTIONS.map(s => (
          <SubjectChip
            key={s.value}
            label={t(s.key)}
            selected={selected.includes(s.value)}
            onClick={() => onToggle(s.value)}
            disabled={otherSelected?.includes(s.value)}
            disabledTitle={t('profile.chipAlreadyPicked')}
          />
        ))}
        {custom.map(s => (
          <SelectableChip key={s} label={s} selected onClick={() => onToggle(s)} />
        ))}
        {onAddCustom && <AddCustomChip onAdd={onAddCustom} />}
      </div>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function ProfileSetupPage() {
  const { t } = useTranslation('onboarding');
  const { t: tc } = useTranslation('common');
  const {
    step, totalSteps,
    name, setName,
    age, setAge,
    grade, setGrade,
    city, setCity,
    country, setCountry,
    subjectsLike, setSubjectsLike,
    subjectsDislike, setSubjectsDislike,
    subjectsEasy, setSubjectsEasy,
    subjectsHard, setSubjectsHard,
    examsTaken, toggleExam,
    examScores, setExamScore,
    errors, clearError,
    handleNext, handleBack, handleSubmit, toggle,
  } = useProfileSetup();

  const currentStepMascot = step === PROFILE_STEPS.NAME_SCHOOL
    ? { state: 'welcome' as const, size: MASCOT_WELCOME_SIZE }
    : { state: 'waiting' as const, size: MASCOT_WAITING_SIZE };

  return (
    <div className="min-h-screen bg-page flex flex-col">
      {/* Pinned to the viewport corner, independent of the centered content
          column — hidden below `sm` so it doesn't cover form fields on
          narrow phones. */}
      <Mascot
        state={currentStepMascot.state}
        size={currentStepMascot.size}
        className="hidden sm:block fixed bottom-24 right-4 sm:right-8 lg:right-10 lg:bottom-10 z-30 pointer-events-none"
      />

      {/* ── Progress header ───────────────────────────────────────────────── */}
      <div className="sticky top-0 z-10 bg-page px-5 pt-5 pb-4 flex flex-col gap-2">
        <OnboardingProgress current={step} total={TOTAL_ONBOARDING_STEPS} />
      </div>

      {/* ── Scrollable content ────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-5 pt-5 pb-40 lg:pb-8">
        <div className="max-w-2xl mx-auto">

        {step === PROFILE_STEPS.NAME_SCHOOL && (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-4">
              <Heading level="display-md">
                {t('profile.nameQuestion')}
              </Heading>

              <Input
                label={t('profile.nameLabel')}
                value={name}
                onChange={e => { setName(sanitizeName(e.target.value)); clearError('name'); }}
                placeholder={t('profile.namePlaceholder')}
                error={errors.name}
                hint={!errors.name ? t('profile.nameHint') : undefined}
                autoFocus
                maxLength={NAME_MAX_LENGTH}
              />
            </div>

            <div className="flex flex-col gap-4 pt-2 border-t border-default">
              <div className="pt-2">
                <Heading level="display-md" as="h2">
                  {t('profile.ageQuestion')}
                </Heading>
              </div>

              {/* Age picker — button row, 14–18 */}
              <div className="flex flex-wrap gap-2" role="group" aria-label={t('profile.agePickerAria')}>
                {AGES.map(a => {
                  const selected = age === String(a);
                  return (
                    <button
                      key={a}
                      type="button"
                      onClick={() => { setAge(String(a)); clearError('age'); }}
                      className="w-11 h-11 rounded-full text-label font-semibold transition-colors"
                      style={{
                        background: selected ? 'var(--pine)' : 'var(--bg-surface)',
                        color: selected ? 'var(--text-on-brand)' : 'var(--ink)',
                        border: selected ? '1.5px solid var(--pine)' : '1.5px solid var(--line)',
                      }}
                    >
                      {a}
                    </button>
                  );
                })}
              </div>
              {errors.age && <p className="text-small text-danger">{errors.age}</p>}
            </div>

            <div className="flex flex-col gap-6 pt-2 border-t border-default">
              <div className="pt-2">
                <Heading level="display-md" as="h2">
                  {t('profile.schoolQuestion')}
                </Heading>
                <p className="text-body mt-1" style={{ color: 'var(--ink)' }}>{t('profile.schoolNote')}</p>
              </div>

              <Input
                label={t('profile.gradeLabel')}
                type="number"
                inputMode="numeric"
                value={grade}
                onChange={e => { setGrade(e.target.value); clearError('grade'); }}
                placeholder={t('profile.gradePlaceholder')}
                error={errors.grade}
                min={1}
                max={12}
              />

              {/* No real city dataset/API exists in this codebase — a plain text
                  field is the honest fallback rather than a fabricated
                  autocomplete list. See onboarding rebuild notes. */}
              <Input
                label={t('profile.cityLabel')}
                value={city}
                onChange={e => setCity(e.target.value)}
                placeholder={t('profile.cityPlaceholder')}
                hint={t('profile.cityHint')}
              />

              <Input
                label={t('profile.countryLabel')}
                value={country}
                onChange={e => setCountry(e.target.value)}
                placeholder={t('profile.countryPlaceholder')}
              />
            </div>
          </div>
        )}

        {step === PROFILE_STEPS.SUBJECTS && (
          <div className="flex flex-col gap-6">
            <div>
              <Heading level="display-md">
                {t('profile.subjectsLikedQuestion')}
              </Heading>
              <p className="text-body mt-1" style={{ color: 'var(--ink)' }}>{t('profile.subjectsLikedNote')}</p>
            </div>

            {/* Same neutral chip styling and mutual-exclusion pattern as
                the easy/hard group below — a subject can't be both liked and
                disliked at once. */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <SubjectGroup
                title={t('profile.groupLiked')}
                selected={subjectsLike}
                onToggle={s => setSubjectsLike(prev => toggle(prev, s))}
                onAddCustom={s => setSubjectsLike(prev => (prev.includes(s) ? prev : [...prev, s]))}
                otherSelected={subjectsDislike}
              />
              <SubjectGroup
                title={t('profile.groupDisliked')}
                selected={subjectsDislike}
                onToggle={s => setSubjectsDislike(prev => toggle(prev, s))}
                onAddCustom={s => setSubjectsDislike(prev => (prev.includes(s) ? prev : [...prev, s]))}
                otherSelected={subjectsLike}
              />
            </div>

            <div className="flex flex-col gap-6 pt-2 border-t border-default">
              <div className="pt-2">
                <Heading level="display-md" as="h2">
                  {t('profile.subjectsRestQuestion')}
                </Heading>
                <p className="text-body mt-1" style={{ color: 'var(--ink)' }}>{t('profile.subjectsRestNote')}</p>
              </div>

              {/* Deliberately neutral: both columns use the identical chip style.
                  Dawn only ever marks "selected", never "good" vs. "bad" — the
                  framing is carried by wording alone. */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <SubjectGroup
                  title={t('profile.groupEasy')}
                  selected={subjectsEasy}
                  onToggle={s => setSubjectsEasy(prev => toggle(prev, s))}
                  otherSelected={subjectsHard}
                />
                <SubjectGroup
                  title={t('profile.groupHard')}
                  selected={subjectsHard}
                  onToggle={s => setSubjectsHard(prev => toggle(prev, s))}
                  otherSelected={subjectsEasy}
                />
              </div>
            </div>

            {/* Third block on this same screen, not a 5th step — the scores
                are optional in exactly the way the subject picks above are,
                so they belong to the same "расскажи о себе" beat rather than
                to a step of their own that implies they're expected. */}
            <ExamScoresBlock
              examsTaken={examsTaken}
              onToggleExam={toggleExam}
              examScores={examScores}
              onScoreChange={setExamScore}
              errors={errors}
            />

          </div>
        )}
        </div>
      </div>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      {/* Surface/shadow/rounding live on the inner, centered bar (not this
          outer full-width one) so the visible "card" wraps tightly around
          the buttons instead of spanning edge-to-edge into the corner where
          the fixed mascot sits — it was painting over the mascot before. */}
      <div className={cn(
        'bg-page sm:bg-transparent px-5 py-4 z-20',
        'fixed bottom-0 inset-x-0 lg:static',
      )}>
        <div className="max-w-2xl mx-auto w-full flex items-center gap-3 lg:mb-6 lg:p-3 lg:rounded-[var(--radius)] lg:bg-surface lg:shadow-card">
        {step > 1 && (
          <Button
            variant="ghost"
            size="lg"
            className="h-14 px-6 rounded-pill"
            onClick={handleBack}
          >
            {tc('back')}
          </Button>
        )}

        {step < totalSteps ? (
          <Button
            size="lg"
            className="ml-auto h-14 px-10 rounded-pill font-extrabold shadow-button"
            onClick={handleNext}
          >
            {tc('next')}
          </Button>
        ) : (
          <Button
            size="lg"
            className="ml-auto h-14 px-10 rounded-pill font-extrabold shadow-button"
            onClick={handleSubmit}
          >
            {/* Saves the profile and moves on to artifacts (steps 3-4 of the
                same onboarding flow) — "Далее", not "Готово", since this
                isn't the end of onboarding. */}
            {tc('next')}
          </Button>
        )}
        </div>
      </div>

    </div>
  );
}
