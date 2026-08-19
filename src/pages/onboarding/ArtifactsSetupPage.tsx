import { useState } from 'react';
import { cn } from '@/shared/lib/cn';
import { Button, Mascot } from '@/shared/ui';
import { Heading } from '@/shared/ui/typography/Heading';
import { useArtifactsSetup, ARTIFACT_SECTIONS, type ArtifactSection } from './hooks/useArtifactsSetup';
import { OnboardingProgress } from './components/OnboardingProgress';
import { PROFILE_STEP_COUNT, TOTAL_ONBOARDING_STEPS } from './onboardingSteps';

// ── Artifacts — onboarding steps 5-9 ────────────────────────────────────────
// During onboarding this renders as five linear steps in the exact page
// shell ProfileSetupPage uses (sticky progress bar, plain full-width
// content, fixed Назад/Далее footer) — not a boxed "card" sitting apart
// from the rest of onboarding. Reopened later from Profile settings to
// add/change artifacts (edit mode), it switches to a tabbed single-screen
// editor instead: free jump-to-any-group beats a forced sequence once
// onboarding itself is behind you.

const TABS: Record<ArtifactSection, string> = {
  activities: '01 чем занимаешься',
  achievements: '02 может, уже было',
  professions: '03 что нравится',
  targets: '04 о чём думаешь',
  dreams: '05 мечты и цели',
};

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

// Curated starter options, same spirit as HOBBIES/CLUBS/SUBJECTS elsewhere in
// onboarding — a static preset list, not a real external catalog (no
// achievements/professions/university database exists in this codebase).
// "+ своё" always covers anything not listed, so nothing is actually
// constrained to these presets.
const ACHIEVEMENTS = [
  'Победа в олимпиаде', 'Грамота или диплом', 'Спортивный разряд',
  'Свой проект', 'Сертификат курса', 'Участие в конкурсе',
  'Волонтёрский проект', 'Выступление или концерт',
];

const PROFESSIONS = [
  'Программист', 'Врач', 'Инженер', 'Учитель', 'Дизайнер',
  'Предприниматель', 'Юрист', 'Учёный', 'Артист или музыкант',
  'Спортсмен', 'Военный', 'Строитель',
];

const TARGETS = [
  'Казахстан', 'Россия', 'США', 'Великобритания',
  'Германия', 'Турция', 'ОАЭ', 'Южная Корея',
];

// One mascot per step, `position: fixed` to the viewport's bottom-right
// corner (see the single <Mascot> rendered near the top of the JSX below,
// picked by isDreamsStep) — a different pose from the other 3 onboarding
// steps (see ProfileSetupPage's own MASCOT_*_SIZE constants for
// 'welcome'/'waiting') — sizes calibrated per pose to a common ~182px
// rendered character height, same ~2.5x scale-up and rationale as
// ProfileSetupPage.
const MASCOT_TRANSITION_SIZE = 158;
const MASCOT_PAUSE_SIZE = 198;
// Edit mode (opened from Profile settings) isn't one of the 4 onboarding
// steps — kept at its own pre-existing fixed size, unaffected by the above.
const MASCOT_EDIT_SIZE = 64;

// ── Sub-components ────────────────────────────────────────────────────────────

function SectionTabs({ active, onChange }: { active: ArtifactSection; onChange: (s: ArtifactSection) => void }) {
  return (
    <div className="flex flex-wrap gap-2" role="tablist" aria-label="Группы артефактов">
      {ARTIFACT_SECTIONS.map(section => {
        const isActive = section === active;
        return (
          <button
            key={section}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(section)}
            className="px-3 py-2 rounded-pill font-mono text-mono-xs tracking-label uppercase transition-colors"
            style={{
              background: isActive ? 'var(--pine)' : 'transparent',
              color: isActive ? 'var(--text-on-brand)' : 'var(--mute)',
              border: isActive ? '1.5px solid var(--pine)' : '1.5px solid var(--line)',
            }}
          >
            {TABS[section]}
          </button>
        );
      })}
    </div>
  );
}

function Chip({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="px-3 py-1.5 rounded-pill text-small font-medium transition-colors"
      style={{
        background: 'var(--bg-surface)',
        color: selected ? 'var(--midnight)' : 'var(--ink)',
        border: selected ? '1.5px solid var(--dawn)' : '1.5px solid var(--line)',
      }}
    >
      {label}
    </button>
  );
}

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
        placeholder="Своё"
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

function ChipGrid({
  options, selected, onToggle, onAddCustom, subtitle,
}: {
  options: string[]; selected: string[];
  onToggle: (s: string) => void;
  onAddCustom: (s: string) => void;
  subtitle?: string;
}) {
  const custom = selected.filter(s => !options.includes(s));
  return (
    <div className="flex flex-col gap-2">
      {subtitle && <p className="text-small font-semibold text-muted">{subtitle}</p>}
      <div className="flex flex-wrap gap-2">
        {options.map(o => (
          <Chip key={o} label={o} selected={selected.includes(o)} onClick={() => onToggle(o)} />
        ))}
        {custom.map(o => (
          <Chip key={o} label={o} selected onClick={() => onToggle(o)} />
        ))}
        <AddCustomChip onAdd={onAddCustom} />
      </div>
    </div>
  );
}

const SECTION_COPY: Record<ArtifactSection, { headline: string; note: string }> = {
  activities: { headline: 'Чем занимаешься помимо школы?', note: 'Хобби, кружки и секции — выбери всё, что подходит' },
  achievements: { headline: 'Может, уже что-то было?', note: 'Грамоты, победы, проекты, сертификаты — если есть, отметь' },
  professions: { headline: 'Какие профессии тебе интересны?', note: 'Необязательно — просто то, что привлекает' },
  targets: { headline: 'О каких странах или университетах думаешь?', note: 'Если ещё рано об этом думать — можно пропустить' },
  dreams: { headline: 'Есть мечты или цели?', note: 'Одна строка, без правил. Можно и не писать.' },
};

// ── Page ─────────────────────────────────────────────────────────────────────

export default function ArtifactsSetupPage() {
  const {
    activeSection, setActiveSection, sectionIndex, isLastSection,
    isLinearFlow,
    hobbies, setHobbies,
    clubs, setClubs,
    achievements, setAchievements,
    professions, setProfessions,
    targets, setTargets,
    dreams, setDreams,
    isLoading, saveError,
    handleNext, handleSkip, handleBack,
    toggle,
  } = useArtifactsSetup();

  const copy = SECTION_COPY[activeSection];

  // Extracted per-section so onboarding can render four of these stacked on
  // one merged screen (see below) while edit mode still shows exactly one
  // at a time via sectionContent, unchanged.
  const activitiesBody = (
    <div className="flex flex-col gap-5">
      <ChipGrid
        subtitle="Хобби и занятия"
        options={HOBBIES}
        selected={hobbies}
        onToggle={h => setHobbies(prev => toggle(prev, h))}
        onAddCustom={h => setHobbies(prev => (prev.includes(h) ? prev : [...prev, h]))}
      />
      <ChipGrid
        subtitle="Кружки и секции"
        options={CLUBS}
        selected={clubs}
        onToggle={c => setClubs(prev => toggle(prev, c))}
        onAddCustom={c => setClubs(prev => (prev.includes(c) ? prev : [...prev, c]))}
      />
    </div>
  );

  const achievementsBody = (
    <ChipGrid
      options={ACHIEVEMENTS}
      selected={achievements}
      onToggle={a => setAchievements(prev => toggle(prev, a))}
      onAddCustom={a => setAchievements(prev => (prev.includes(a) ? prev : [...prev, a]))}
    />
  );

  const professionsBody = (
    <ChipGrid
      options={PROFESSIONS}
      selected={professions}
      onToggle={p => setProfessions(prev => toggle(prev, p))}
      onAddCustom={p => setProfessions(prev => (prev.includes(p) ? prev : [...prev, p]))}
    />
  );

  const targetsBody = (
    <ChipGrid
      options={TARGETS}
      selected={targets}
      onToggle={t => setTargets(prev => toggle(prev, t))}
      onAddCustom={t => setTargets(prev => (prev.includes(t) ? prev : [...prev, t]))}
    />
  );

  const dreamsBody = (
    <textarea
      value={dreams}
      onChange={e => setDreams(e.target.value)}
      placeholder="Например: хочу однажды поехать на настоящие раскопки"
      className={cn(
        'w-full max-w-2xl aspect-[2/1] mx-auto rounded-[var(--radius-sm)] px-4 py-3 text-body-md resize-none',
        'placeholder:text-placeholder focus:outline-none transition-colors',
      )}
      style={{ background: 'var(--bg-page)', border: '1.5px solid var(--line)', color: 'var(--ink)' }}
      onFocus={e => { e.currentTarget.style.borderColor = 'var(--pine)'; }}
      onBlur={e => { e.currentTarget.style.borderColor = 'var(--line)'; }}
    />
  );

  const sectionContent = (
    <>
      {activeSection === 'activities' && activitiesBody}
      {activeSection === 'achievements' && achievementsBody}
      {activeSection === 'professions' && professionsBody}
      {activeSection === 'targets' && targetsBody}
      {activeSection === 'dreams' && dreamsBody}
    </>
  );

  // ── Artifacts-only shortcut (opened directly from ArtifactsSection) —
  // tabbed single-screen editor, not a "step". Kept close to the original
  // boxed layout since jumping freely between groups is the point here.
  if (!isLinearFlow) {
    return (
      <div className="min-h-screen bg-page flex flex-col">
        <div className="flex-1 overflow-y-auto px-5 py-8 lg:py-12">
          <div className="max-w-2xl lg:max-w-4xl mx-auto flex flex-col gap-6">

            <div>
              <h1 className="text-h1 font-black text-primary tracking-tight mb-1">Твои увлечения и цели</h1>
              <p className="text-body text-secondary">Расскажи, чем занимаешься и о чём мечтаешь</p>
            </div>

            <SectionTabs active={activeSection} onChange={setActiveSection} />

            <div
              className="flex flex-col gap-6 p-6 sm:p-8"
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex flex-col gap-1.5">
                  <Heading level="display-md" as="h2">
                    {copy.headline}
                  </Heading>
                  <p className="text-body-md" style={{ color: 'var(--mute)' }}>{copy.note}</p>
                </div>
                <Mascot state="welcome" size={MASCOT_EDIT_SIZE} className="shrink-0" />
              </div>

              {sectionContent}

              {saveError && (
                <p className="text-xs text-danger text-center">
                  Не удалось сохранить. Попробуй ещё раз.
                </p>
              )}

              <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-default">
                <Button
                  size="lg"
                  isLoading={isLoading}
                  className="h-12 rounded-pill font-extrabold shadow-button"
                  onClick={handleNext}
                >
                  {isLastSection ? 'Готово ✓' : 'Дальше'}
                </Button>
                <Button
                  variant="ghost"
                  size="lg"
                  className="h-12 rounded-pill"
                  onClick={handleSkip}
                >
                  Пропустить эту группу
                </Button>
                <span className="ml-auto font-mono text-mono-xs uppercase tracking-label text-muted">
                  Группа {sectionIndex + 1} из {ARTIFACT_SECTIONS.length}
                </span>
              </div>
            </div>

          </div>
        </div>
      </div>
    );
  }

  // ── Onboarding — steps 3-4, identical shell to ProfileSetupPage's steps
  // 1-2: sticky progress bar, plain full-width content, fixed footer. The
  // first four groups render merged onto one screen (step 3); 'dreams'
  // gets its own screen alone (step 4) — see useArtifactsSetup.advance/
  // handleBack for the matching two-screen navigation.
  const isDreamsStep = activeSection === 'dreams';

  return (
    <div className="min-h-screen bg-page flex flex-col">
      {/* Pinned to the viewport corner, independent of the centered content
          column — hidden below `sm` so it doesn't cover form fields on
          narrow phones. Step 4 (dreams) keeps its own inline mascot above
          the headline instead — see below. */}
      {!isDreamsStep && (
        <Mascot
          state="transition"
          size={MASCOT_TRANSITION_SIZE}
          className="hidden sm:block fixed bottom-24 right-4 sm:right-8 lg:right-10 lg:bottom-10 z-30 pointer-events-none"
        />
      )}

      <div className="sticky top-0 z-10 bg-page px-5 pt-5 pb-4 flex flex-col gap-2">
        <OnboardingProgress
          current={PROFILE_STEP_COUNT + (isDreamsStep ? 2 : 1)}
          total={TOTAL_ONBOARDING_STEPS}
        />
      </div>

      <div className="flex-1 overflow-y-auto px-5 pt-5 pb-40 lg:pb-8">
        <div className="max-w-2xl mx-auto">
        {isDreamsStep ? (
          <div className="flex flex-col items-center gap-5">
            <div className="flex flex-col items-center gap-3 text-center">
              <Mascot state="pause" size={MASCOT_PAUSE_SIZE} className="shrink-0" />
              <div>
                <Heading level="display-md">{copy.headline}</Heading>
                <p className="text-body mt-1" style={{ color: 'var(--ink)' }}>{copy.note}</p>
              </div>
            </div>

            {dreamsBody}
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            <div>
              <Heading level="display-md">{SECTION_COPY.activities.headline}</Heading>
              <p className="text-body mt-1" style={{ color: 'var(--ink)' }}>{SECTION_COPY.activities.note}</p>
            </div>
            {activitiesBody}

            <div className="flex flex-col gap-4 pt-2 border-t border-default">
              <div className="pt-2">
                <Heading level="display-md" as="h2">{SECTION_COPY.achievements.headline}</Heading>
                <p className="text-body mt-1" style={{ color: 'var(--ink)' }}>{SECTION_COPY.achievements.note}</p>
              </div>
              {achievementsBody}
            </div>

            <div className="flex flex-col gap-4 pt-2 border-t border-default">
              <div className="pt-2">
                <Heading level="display-md" as="h2">{SECTION_COPY.professions.headline}</Heading>
                <p className="text-body mt-1" style={{ color: 'var(--ink)' }}>{SECTION_COPY.professions.note}</p>
              </div>
              {professionsBody}
            </div>

            <div className="flex flex-col gap-4 pt-2 border-t border-default">
              <div className="pt-2">
                <Heading level="display-md" as="h2">{SECTION_COPY.targets.headline}</Heading>
                <p className="text-body mt-1" style={{ color: 'var(--ink)' }}>{SECTION_COPY.targets.note}</p>
              </div>
              {targetsBody}
            </div>
          </div>
        )}

        {saveError && (
          <p className="text-xs text-danger text-center mt-6">Не удалось сохранить. Попробуй ещё раз.</p>
        )}
        </div>
      </div>

      {/* Surface/shadow/rounding live on the inner, centered bar (not this
          outer full-width one) so the visible "card" wraps tightly around
          the buttons instead of spanning edge-to-edge into the corner where
          the fixed mascot sits — it was painting over the mascot before. */}
      <div className={cn(
        'bg-page sm:bg-transparent px-5 py-4 z-20',
        'fixed bottom-0 inset-x-0 lg:static',
      )}>
        <div className="max-w-2xl mx-auto w-full flex items-center gap-3 lg:mb-6 lg:p-3 lg:rounded-[var(--radius)] lg:bg-surface lg:shadow-card">
        {/* Always shown here — on the first group this steps back across the
            page boundary into profile setup's last step (see
            useArtifactsSetup.handleBack), not just between artifact groups. */}
        <Button
          variant="ghost"
          size="lg"
          className="h-14 px-6 rounded-pill"
          onClick={handleBack}
        >
          Назад
        </Button>

        <Button
          size="lg"
          isLoading={isLoading}
          className="ml-auto h-14 px-10 rounded-pill font-extrabold shadow-button"
          onClick={handleNext}
        >
          {isLastSection ? 'Готово ✓' : 'Далее'}
        </Button>
        </div>
      </div>

    </div>
  );
}
