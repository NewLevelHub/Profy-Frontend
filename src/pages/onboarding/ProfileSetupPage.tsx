import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/shared/lib/cn';
import { Button, Input, Mascot } from '@/shared/ui';
import { Heading } from '@/shared/ui/typography/Heading';
import { Text } from '@/shared/ui/typography/Text';
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

const AGES = Array.from({ length: 5 }, (_, i) => 14 + i); // 14–18

// One mascot per step, fixed to the viewport corner — sizes calibrated per
// pose to a common ~182px rendered character height. 'transition'/'pause'
// live on ArtifactsSetupPage.
// Подобраны под лунку .journey-mascot-well (112px), а не под угол экрана:
// у поз разная доля пустого поля в спрайте, поэтому числа разные, а
// нарисованный персонаж выходит одного роста.
const MASCOT_WELCOME_SIZE = 96;
const MASCOT_WAITING_SIZE = 84;

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
        className="field-tile px-3.5 py-2 rounded-pill text-caption font-semibold w-36 focus:outline-none border-[color:var(--pine)]"
        style={{ color: 'var(--text-heading)' }}
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => setOpen(true)}
      className="px-3.5 py-2 rounded-pill text-caption font-semibold transition-colors press-scale"
      style={{
        background: 'transparent',
        color: 'var(--mute)',
        border: '1.5px dashed color-mix(in srgb, var(--pine) 28%, var(--hairline))',
      }}
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
  otherSelected?: string[];
}) {
  const { t } = useTranslation('onboarding');
  const custom = selected.filter(s => !SUBJECT_VALUES.includes(s));
  return (
    <div className="panel-glass flex flex-col gap-3 !p-4 sm:!p-5">
      <div>
        <p className="text-body-sm font-semibold text-[color:var(--text-heading)] m-0">{title}</p>
        {note && <p className="text-body-sm text-muted mt-0.5 m-0">{note}</p>}
      </div>
      <div className="flex flex-wrap gap-2">
        {SUBJECT_OPTIONS.map(s => (
          <SelectableChip
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
    <div className="journey-page journey-page--lit min-h-screen flex flex-col">
      {/* Ни заливки, ни блюра: полоса шагов — flex-сосед НАД областью прокрутки,
          а не слой поверх неё, и прятать ей нечего. Тонировка --bg-page на 72%
          ничего не скрывала, зато клала плоский фог поверх градиента холста и
          давала видимый горизонтальный шов. */}
      <div className="relative z-10 px-4 pt-4 pb-3 sm:px-5 sm:pt-5 sm:pb-4">
        <div className="max-w-6xl mx-auto">
          <OnboardingProgress current={step} total={TOTAL_ONBOARDING_STEPS} />
        </div>
      </div>

      <div className="relative z-[1] flex-1 overflow-y-auto px-3 pt-4 pb-40 sm:px-4 lg:px-6 lg:pb-10">
        <div className="w-full max-w-6xl mx-auto">
          <div className="journey-shell flex flex-col gap-7 px-5 py-7 sm:px-8 sm:py-9">
            {/* Маскот живёт в углу карточки, а не приколот к углу экрана.
                Пока карточка была узкой, ему хватало бокового поля; на
                широкой (1152) зазор меньше самого спрайта, и он ложился
                поверх «Далее». Здесь он заодно занимает пустой верхний
                правый угол — заголовки шагов короткие и туда не достают. */}
            {/* !absolute — потому что .journey-shell > * принудительно ставит детям
                position: relative (чтобы поднять их над декоративным свечением
                ::after), и обычный `absolute` из слоя утилит это правило не
                перебивает. */}
            {/* Показ живёт на обёртке, а не на самой лунке: `.journey-mascot-well`
                объявлен вне слоёв Tailwind и его `display: flex` перебивает
                утилиту `hidden` — на мобильном маскот вылезал на кикер. */}
            <div className="pointer-events-none !absolute right-6 top-6 hidden lg:block">
              <div className="journey-mascot-well">
                <Mascot state={currentStepMascot.state} size={currentStepMascot.size} />
              </div>
            </div>


            {step === PROFILE_STEPS.NAME_SCHOOL && (
              <div className="flex flex-col gap-7">
                <div className="flex flex-col gap-4">
                  <span className="journey-kicker">{t('profile.kickerIntro')}</span>
                  <Heading level="display-md" className="text-[color:var(--text-heading)] text-balance">
                    {t('profile.nameQuestion')}
                  </Heading>

                  {/* Ширину полю задаёт содержимое, а не карточка: имя — это
                      два-три слова, и подчёркивание во всю ширину карточки
                      читается как ошибка вёрстки, а не как поле ввода. */}
                  <div className="max-w-md">
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
                </div>

                <div className="flex flex-col gap-4 pt-1 border-t border-default">
                  <Heading level="display-md" as="h2" className="text-[color:var(--text-heading)] pt-5">
                    {t('profile.ageQuestion')}
                  </Heading>

                  <div className="flex flex-wrap gap-2" role="group" aria-label={t('profile.agePickerAria')}>
                    {AGES.map(a => {
                      const selected = age === String(a);
                      return (
                        <button
                          key={a}
                          type="button"
                          onClick={() => { setAge(String(a)); clearError('age'); }}
                          className={cn(
                            'w-11 h-11 rounded-[12px] text-body-sm font-bold border transition-colors press-scale',
                            selected
                              ? 'bg-brand text-on-brand border-transparent'
                              : 'field-tile text-secondary hover:border-[color:var(--pine)] hover:text-[color:var(--pine)]',
                          )}
                        >
                          {a}
                        </button>
                      );
                    })}
                  </div>
                  {errors.age && <p className="text-small text-danger m-0">{errors.age}</p>}
                </div>

                <div className="flex flex-col gap-5 pt-1 border-t border-default">
                  <div className="pt-5">
                    <Heading level="display-md" as="h2" className="text-[color:var(--text-heading)]">
                      {t('profile.schoolQuestion')}
                    </Heading>
                    <Text variant="body-md" className="text-secondary mt-1.5">
                      {t('profile.schoolNote')}
                    </Text>
                  </div>

                  {/* Три коротких ответа в ряд, а не стопкой: по отдельности
                      каждый занимал всю ширину карточки и оставлял справа
                      пустоту, а вместе они её заполняют. */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-6 items-start">
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
              </div>
            )}

            {step === PROFILE_STEPS.SUBJECTS && (
              <div className="flex flex-col gap-7">
                <div>
                  <span className="journey-kicker">{t('profile.kickerSubjects')}</span>
                  <Heading level="display-md" className="text-[color:var(--text-heading)] text-balance mt-3">
                    {t('profile.subjectsLikedQuestion')}
                  </Heading>
                  <Text variant="body-md" className="text-secondary mt-1.5">
                    {t('profile.subjectsLikedNote')}
                  </Text>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
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

                <div className="flex flex-col gap-4 pt-1 border-t border-default">
                  <div className="pt-5">
                    <Heading level="display-md" as="h2" className="text-[color:var(--text-heading)]">
                      {t('profile.subjectsRestQuestion')}
                    </Heading>
                    <Text variant="body-md" className="text-secondary mt-1.5">
                      {t('profile.subjectsRestNote')}
                    </Text>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
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
      </div>

      <div className={cn(
        'px-3 py-4 z-20 sm:px-4',
        'fixed bottom-0 inset-x-0 lg:static',
        'action-bar-scrim',
      )}>
        <div className="max-w-6xl mx-auto w-full flex items-center gap-3 p-3 lg:mb-6">
          {step > 1 && (
            <Button
              variant="ghost"
              size="lg"
              className="h-12 sm:h-14 px-5 sm:px-6 rounded-pill press-scale"
              onClick={handleBack}
            >
              {tc('back')}
            </Button>
          )}

          {step < totalSteps ? (
            <Button
              size="lg"
              className="ml-auto h-12 sm:h-14 px-8 sm:px-10 rounded-pill font-extrabold shadow-button press-scale"
              onClick={handleNext}
            >
              {tc('next')}
            </Button>
          ) : (
            <Button
              size="lg"
              className="ml-auto h-12 sm:h-14 px-8 sm:px-10 rounded-pill font-extrabold shadow-button press-scale"
              onClick={handleSubmit}
            >
              {tc('next')}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
