import { cn } from '@/shared/lib/cn';
import { Button, Input, ProgressBar } from '@/shared/ui';
import { useProfileSetup } from './hooks/useProfileSetup';

const LANGUAGES = ['Русский', 'Казахский', 'Английский'];

const SUBJECTS = [
  'Математика', 'Физика', 'Химия', 'Биология',
  'История', 'География', 'Русский язык', 'Литература',
  'Английский язык', 'Информатика', 'Физкультура', 'Рисование', 'Музыка',
];

// ── Sub-components ────────────────────────────────────────────────────────────

function Chip({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'px-3 py-1.5 rounded-pill text-small font-semibold border transition-colors',
        selected
          ? 'bg-brand text-on-brand border-brand'
          : 'bg-surface text-secondary border-default hover:border-brand hover:text-brand',
      )}
    >
      {label}
    </button>
  );
}

function SubjectGroup({
  title, emoji, selected,
  onToggle,
}: {
  title: string; emoji: string; selected: string[];
  onToggle: (s: string) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-small font-extrabold text-primary">
        <span role="img" className="mr-1.5">{emoji}</span>{title}
      </p>
      <div className="flex flex-wrap gap-2">
        {SUBJECTS.map(s => (
          <Chip key={s} label={s} selected={selected.includes(s)} onClick={() => onToggle(s)} />
        ))}
      </div>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function ProfileSetupPage() {
  const {
    step, totalSteps, progress,
    name, setName,
    age, setAge,
    grade, setGrade,
    city, setCity,
    country, setCountry,
    language, setLanguage,
    subjectsLike, setSubjectsLike,
    subjectsDislike, setSubjectsDislike,
    subjectsEasy, setSubjectsEasy,
    subjectsHard, setSubjectsHard,
    errors, clearError,
    isLoading, submitError,
    handleNext, handleBack, handleSubmit, toggle,
  } = useProfileSetup();

  return (
    <div className="min-h-screen bg-page flex flex-col">

      {/* ── Progress header ───────────────────────────────────────────────── */}
      <div className="sticky top-0 z-10 bg-page px-5 pt-5 pb-4 flex flex-col gap-2">
        <ProgressBar value={progress} label={`Шаг ${step} из ${totalSteps}`} />
        <p className="text-xs font-bold text-muted">Шаг {step} из {totalSteps}</p>
      </div>

      {/* ── Scrollable content ────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-5 pt-6 pb-40 lg:pb-8">

        {step === 1 && (
          <div className="flex flex-col gap-6 max-w-sm lg:max-w-xl mx-auto">
            <div>
              <h1 className="text-h1 font-black text-primary tracking-tight mb-1">Расскажи о себе</h1>
              <p className="text-body text-secondary">Нам нужно немного узнать тебя</p>
            </div>

            <Input
              label="Имя"
              value={name}
              onChange={e => { setName(e.target.value); clearError('name'); }}
              placeholder="Например, Арман"
              error={errors.name}
              autoFocus
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Input
              label="Возраст"
              type="number"
              inputMode="numeric"
              value={age}
              onChange={e => { setAge(e.target.value); clearError('age'); }}
              placeholder="от 6 до 18"
              error={errors.age}
              min={6}
              max={18}
            />

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
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col gap-6 max-w-sm lg:max-w-xl mx-auto">
            <div>
              <h1 className="text-h1 font-black text-primary tracking-tight mb-1">Где ты живёшь?</h1>
              <p className="text-body text-secondary">Поможет подобрать университеты и олимпиады</p>
            </div>

            <Input
              label="Город"
              value={city}
              onChange={e => setCity(e.target.value)}
              placeholder="Например, Алматы"
              autoFocus
            />

            <Input
              label="Страна"
              value={country}
              onChange={e => setCountry(e.target.value)}
              placeholder="Например, Казахстан"
            />

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-primary">Язык обучения</label>
              <div className="flex flex-wrap gap-2">
                {LANGUAGES.map(lang => (
                  <Chip
                    key={lang}
                    label={lang}
                    selected={language === lang}
                    onClick={() => setLanguage(prev => (prev === lang ? '' : lang))}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="flex flex-col gap-8 max-w-lg lg:max-w-4xl mx-auto">
            <div>
              <h1 className="text-h1 font-black text-primary tracking-tight mb-1">Школьные предметы</h1>
              <p className="text-body text-secondary">Можно выбрать несколько в каждой группе</p>
            </div>

            <SubjectGroup title="Нравятся" emoji="❤️" selected={subjectsLike}
              onToggle={s => setSubjectsLike(prev => toggle(prev, s))} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <SubjectGroup title="Не нравятся" emoji="😕" selected={subjectsDislike}
              onToggle={s => setSubjectsDislike(prev => toggle(prev, s))} />
            <SubjectGroup title="Даются легко" emoji="✅" selected={subjectsEasy}
              onToggle={s => setSubjectsEasy(prev => toggle(prev, s))} />
            </div>
            <SubjectGroup title="Даются сложно" emoji="🤯" selected={subjectsHard}
              onToggle={s => setSubjectsHard(prev => toggle(prev, s))} />

            {submitError && (
              <p className="text-xs text-danger text-center">{submitError}</p>
            )}
          </div>
        )}
      </div>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <div className={cn(
        'bg-surface border-t border-default px-5 py-4 flex gap-3',
        'fixed bottom-0 inset-x-0 lg:static lg:max-w-xl lg:mx-auto lg:w-full lg:mb-6 lg:rounded-[var(--radius)] lg:border lg:shadow-card',
      )}>
        {step > 1 && (
          <Button
            variant="ghost"
            size="lg"
            className="flex-1 h-14 rounded-pill"
            onClick={handleBack}
          >
            Назад
          </Button>
        )}

        {step < totalSteps ? (
          <Button
            size="lg"
            className="flex-[2] h-14 rounded-pill font-extrabold shadow-button"
            onClick={handleNext}
          >
            Далее
          </Button>
        ) : (
          <Button
            size="lg"
            isLoading={isLoading}
            className="flex-[2] h-14 rounded-pill font-extrabold shadow-button"
            onClick={handleSubmit}
          >
            Готово ✓
          </Button>
        )}
      </div>

    </div>
  );
}
