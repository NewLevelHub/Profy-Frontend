import { type Dispatch, type SetStateAction } from 'react';
import { cn } from '@/shared/lib/cn';
import { Button } from '@/shared/ui';
import { useArtifactsSetup } from './hooks/useArtifactsSetup';

const HOBBIES = [
  'Рисование', 'Музыка', 'Спорт', 'Программирование', 'Чтение',
  'Готовка', 'Фото/видео', 'Танцы', 'Робототехника', 'Дебаты',
  'Волонтёрство', 'Игры', 'Другое',
];

const CLUBS = [
  'Математический', 'Языковой', 'IT/программирование', 'Художественный',
  'Музыкальный', 'Театральный', 'Спортивная секция', 'Научный',
  'Дебатный клуб', 'Другое',
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

function Section({
  title, emoji, hint, children,
}: {
  title: string; emoji: string; hint?: string; children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div>
        <p className="text-label font-extrabold text-primary">
          <span role="img" className="mr-1.5">{emoji}</span>{title}
        </p>
        {hint && <p className="text-xs text-muted mt-0.5">{hint}</p>}
      </div>
      {children}
    </div>
  );
}

function TagInput({
  placeholder, tags, inputValue,
  onChangeText, onAdd, onRemove,
}: {
  placeholder: string;
  tags: string[];
  inputValue: string;
  onChangeText: (v: string) => void;
  onAdd: () => void;
  onRemove: (tag: string) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={e => onChangeText(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); onAdd(); } }}
          placeholder={placeholder}
          className={cn(
            'flex-1 rounded-[var(--radius-sm)] border border-default bg-surface px-4 py-2.5',
            'text-sm text-primary placeholder:text-placeholder',
            'focus:outline-none focus:border-brand transition-colors',
          )}
        />
        <button
          type="button"
          onClick={onAdd}
          className="w-12 rounded-[var(--radius-sm)] bg-brand text-on-brand text-xl font-black shadow-button hover:bg-brand-hover transition-colors"
          aria-label="Добавить"
        >
          +
        </button>
      </div>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map(tag => (
            <span
              key={tag}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-pill bg-brand-subtle text-small font-bold text-brand"
            >
              {tag}
              <button
                type="button"
                onClick={() => onRemove(tag)}
                className="text-muted hover:text-primary leading-none"
                aria-label={`Удалить ${tag}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function ArtifactsSetupPage() {
  const {
    hobbies, setHobbies,
    clubs, setClubs,
    achievements, setAchievements,
    dreams, setDreams,
    professions, setProfessions,
    targets, setTargets,
    achievementInput, setAchievementInput,
    dreamInput, setDreamInput,
    professionInput, setProfessionInput,
    targetInput, setTargetInput,
    isLoading, saveError,
    handleNext, handleSkip,
    addTag, toggle,
  } = useArtifactsSetup();

  return (
    <div className="min-h-screen bg-page flex flex-col">

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div className="bg-page border-b border-default px-5 pt-6 pb-5">
        <h1 className="text-h1 font-black text-primary tracking-tight mb-1">
          Твои увлечения и цели
        </h1>
        <p className="text-body text-secondary">
          Расскажи, чем занимаешься и о чём мечтаешь
        </p>
      </div>

      {/* ── Content ──────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-5 py-6 pb-40">
        <div className="max-w-lg mx-auto flex flex-col gap-8">

          <Section title="Хобби и занятия" emoji="🎨">
            <div className="flex flex-wrap gap-2">
              {HOBBIES.map(h => (
                <Chip
                  key={h}
                  label={h}
                  selected={hobbies.includes(h)}
                  onClick={() => setHobbies(prev => toggle(prev, h))}
                />
              ))}
            </div>
          </Section>

          <Section title="Кружки и секции" emoji="🏫">
            <div className="flex flex-wrap gap-2">
              {CLUBS.map(c => (
                <Chip
                  key={c}
                  label={c}
                  selected={clubs.includes(c)}
                  onClick={() => setClubs(prev => toggle(prev, c))}
                />
              ))}
            </div>
          </Section>

          <Section title="Достижения" emoji="🏆" hint="Грамоты, победы, проекты, сертификаты">
            <TagInput
              placeholder="Например, призёр олимпиады по математике"
              tags={achievements}
              inputValue={achievementInput}
              onChangeText={setAchievementInput}
              onAdd={() => addTag(achievementInput, setAchievements as Dispatch<SetStateAction<string[]>>, setAchievementInput)}
              onRemove={tag => setAchievements(prev => prev.filter(t => t !== tag))}
            />
          </Section>

          <Section title="Мечты и цели" emoji="✨" hint="Чего хочешь достичь или попробовать">
            <TagInput
              placeholder="Например, создать своё приложение"
              tags={dreams}
              inputValue={dreamInput}
              onChangeText={setDreamInput}
              onAdd={() => addTag(dreamInput, setDreams as Dispatch<SetStateAction<string[]>>, setDreamInput)}
              onRemove={tag => setDreams(prev => prev.filter(t => t !== tag))}
            />
          </Section>

          <Section title="Интересные профессии" emoji="💼">
            <TagInput
              placeholder="Например, программист, архитектор"
              tags={professions}
              inputValue={professionInput}
              onChangeText={setProfessionInput}
              onAdd={() => addTag(professionInput, setProfessions as Dispatch<SetStateAction<string[]>>, setProfessionInput)}
              onRemove={tag => setProfessions(prev => prev.filter(t => t !== tag))}
            />
          </Section>

          <Section title="Страны и университеты" emoji="🌍">
            <TagInput
              placeholder="Например, MIT, Великобритания"
              tags={targets}
              inputValue={targetInput}
              onChangeText={setTargetInput}
              onAdd={() => addTag(targetInput, setTargets as Dispatch<SetStateAction<string[]>>, setTargetInput)}
              onRemove={tag => setTargets(prev => prev.filter(t => t !== tag))}
            />
          </Section>

          {saveError && (
            <p className="text-xs text-danger text-center">
              Не удалось сохранить. Попробуй ещё раз.
            </p>
          )}
        </div>
      </div>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <div className="fixed bottom-0 inset-x-0 bg-surface border-t border-default px-5 py-4 flex gap-3">
        <Button
          variant="ghost"
          size="lg"
          className="flex-1 h-14 rounded-pill"
          onClick={handleSkip}
        >
          Пропустить
        </Button>
        <Button
          size="lg"
          isLoading={isLoading}
          className="flex-[2] h-14 rounded-pill font-extrabold shadow-button"
          onClick={handleNext}
        >
          Далее
        </Button>
      </div>

    </div>
  );
}
