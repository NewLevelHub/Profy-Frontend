import { useState } from 'react';
import { cn } from '@/shared/lib/cn';
import { Button, Input, Mascot } from '@/shared/ui';
import { Heading } from '@/shared/ui/typography/Heading';
import { useProfileSetup, PROFILE_STEPS, NAME_MAX_LENGTH, sanitizeName } from './hooks/useProfileSetup';
import { OnboardingProgress } from './components/OnboardingProgress';
import { TOTAL_ONBOARDING_STEPS } from './onboardingSteps';

const SUBJECTS = [
  'Математика', 'Физика', 'Химия', 'Биология',
  'История', 'География', 'Русский язык', 'Литература',
  'Английский язык', 'Информатика', 'Физкультура', 'Рисование', 'Музыка',
];

const AGES = Array.from({ length: 5 }, (_, i) => 14 + i); // 6–18

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
  label, selected, onClick, disabled,
}: {
  label: string; selected: boolean; onClick: () => void; disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      aria-disabled={disabled}
      title={disabled ? 'Уже выбрано в другом списке' : undefined}
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
        placeholder="Свой предмет"
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
      + своё
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
  const custom = selected.filter(s => !SUBJECTS.includes(s));
  return (
    <div className="flex flex-col gap-2">
      <div>
        <p className="text-label font-semibold" style={{ color: 'var(--midnight)' }}>{title}</p>
        {note && <p className="text-small text-muted mt-0.5">{note}</p>}
      </div>
      <div className="flex flex-wrap gap-2">
        {SUBJECTS.map(s => (
          <SubjectChip
            key={s}
            label={s}
            selected={selected.includes(s)}
            onClick={() => onToggle(s)}
            disabled={otherSelected?.includes(s)}
          />
        ))}
        {custom.map(s => (
          <SubjectChip key={s} label={s} selected onClick={() => onToggle(s)} />
        ))}
        {onAddCustom && <AddCustomChip onAdd={onAddCustom} />}
      </div>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function ProfileSetupPage() {
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
                Как тебя зовут?
              </Heading>

              <Input
                label="Имя"
                value={name}
                onChange={e => { setName(sanitizeName(e.target.value)); clearError('name'); }}
                placeholder="Например, Арман"
                error={errors.name}
                hint={!errors.name ? 'Так я буду к тебе обращаться. Можно поменять потом.' : undefined}
                autoFocus
                maxLength={NAME_MAX_LENGTH}
              />
            </div>

            <div className="flex flex-col gap-4 pt-2 border-t border-default">
              <div className="pt-2">
                <Heading level="display-md" as="h2">
                  Сколько тебе лет?
                </Heading>
              </div>

              {/* Age picker — button row, 6–18 */}
              <div className="flex flex-wrap gap-2" role="group" aria-label="Выбери возраст">
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
                  Где ты учишься?
                </Heading>
                <p className="text-body mt-1" style={{ color: 'var(--ink)' }}>Класс и город — поможет точнее подобрать вопросы и рекомендации</p>
              </div>

              <Input
                label="Класс"
                type="number"
                inputMode="numeric"
                value={grade}
                onChange={e => { setGrade(e.target.value); clearError('grade'); }}
                placeholder="от 1 до 12"
                error={errors.grade}
                min={1}
                max={12}
              />

              {/* No real city dataset/API exists in this codebase — a plain text
                  field is the honest fallback rather than a fabricated
                  autocomplete list. See onboarding rebuild notes. */}
              <Input
                label="Город"
                value={city}
                onChange={e => setCity(e.target.value)}
                placeholder="Например, Алматы"
                hint="Пока без подсказок — просто впиши город"
              />

              <Input
                label="Страна"
                value={country}
                onChange={e => setCountry(e.target.value)}
                placeholder="Например, Казахстан"
              />
            </div>
          </div>
        )}

        {step === PROFILE_STEPS.SUBJECTS && (
          <div className="flex flex-col gap-6">
            <div>
              <Heading level="display-md">
                Какие предметы тебе нравятся?
              </Heading>
              <p className="text-body mt-1" style={{ color: 'var(--ink)' }}>Сколько хочешь — или ни одного</p>
            </div>

            {/* Same neutral chip styling and mutual-exclusion pattern as
                the easy/hard group below — a subject can't be both liked and
                disliked at once. */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <SubjectGroup
                title="Нравятся"
                selected={subjectsLike}
                onToggle={s => setSubjectsLike(prev => toggle(prev, s))}
                onAddCustom={s => setSubjectsLike(prev => (prev.includes(s) ? prev : [...prev, s]))}
                otherSelected={subjectsDislike}
              />
              <SubjectGroup
                title="Не нравятся"
                selected={subjectsDislike}
                onToggle={s => setSubjectsDislike(prev => toggle(prev, s))}
                onAddCustom={s => setSubjectsDislike(prev => (prev.includes(s) ? prev : [...prev, s]))}
                otherSelected={subjectsLike}
              />
            </div>

            <div className="flex flex-col gap-6 pt-2 border-t border-default">
              <div className="pt-2">
                <Heading level="display-md" as="h2">
                  А как с остальными предметами?
                </Heading>
                <p className="text-body mt-1" style={{ color: 'var(--ink)' }}>Необязательно — но поможет точнее</p>
              </div>

              {/* Deliberately neutral: both columns use the identical chip style.
                  Dawn only ever marks "selected", never "good" vs. "bad" — the
                  framing is carried by wording alone. */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <SubjectGroup
                  title="А что из предметов даётся легко?"
                  selected={subjectsEasy}
                  onToggle={s => setSubjectsEasy(prev => toggle(prev, s))}
                  otherSelected={subjectsHard}
                />
                <SubjectGroup
                  title="А где приходится стараться больше?"
                  selected={subjectsHard}
                  onToggle={s => setSubjectsHard(prev => toggle(prev, s))}
                  otherSelected={subjectsEasy}
                />
              </div>
            </div>

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
            Назад
          </Button>
        )}

        {step < totalSteps ? (
          <Button
            size="lg"
            className="ml-auto h-14 px-10 rounded-pill font-extrabold shadow-button"
            onClick={handleNext}
          >
            Далее
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
            Далее
          </Button>
        )}
        </div>
      </div>

    </div>
  );
}
