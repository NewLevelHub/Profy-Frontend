import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/shared/lib/cn';
import { Button, Mascot } from '@/shared/ui';
import { Heading } from '@/shared/ui/typography/Heading';
import { Text } from '@/shared/ui/typography/Text';
import { useArtifactsSetup, ARTIFACT_SECTIONS, type ArtifactSection } from './hooks/useArtifactsSetup';
import { OnboardingProgress } from './components/OnboardingProgress';
import { SelectableChip } from './components/SelectableChip';
import { PROFILE_STEP_COUNT, TOTAL_ONBOARDING_STEPS } from './onboardingSteps';

// ── Artifacts — onboarding steps 5-9 ────────────────────────────────────────
// During onboarding this renders as five linear steps in the exact page
// shell ProfileSetupPage uses (sticky progress bar, plain full-width
// content, fixed Назад/Далее footer) — not a boxed "card" sitting apart
// from the rest of onboarding. Reopened later from Profile settings to
// add/change artifacts (edit mode), it switches to a tabbed single-screen
// editor instead: free jump-to-any-group beats a forced sequence once
// onboarding itself is behind you.

// Preset chip options. Each entry is the canonical (ru) string stored on the
// profile / sent to the API — locale-independent. Display labels are resolved
// with t(`onboarding:preset.<type>.<value>`, { defaultValue: value }); a custom
// value the student types falls through to itself. Backend `code` catalog is
// deferred to KZ-503.
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
// Под лунку .journey-mascot-well (112px), а не под угол экрана.
const MASCOT_TRANSITION_SIZE = 88;
const MASCOT_PAUSE_SIZE = 198;
// Edit mode (opened from Profile settings) isn't one of the 4 onboarding
// steps — kept at its own pre-existing fixed size, unaffected by the above.
const MASCOT_EDIT_SIZE = 64;

// ── Sub-components ────────────────────────────────────────────────────────────

function SectionTabs({ active, onChange }: { active: ArtifactSection; onChange: (s: ArtifactSection) => void }) {
  const { t } = useTranslation('onboarding');
  return (
    <div className="flex flex-wrap gap-2" role="tablist" aria-label={t('artifacts.tablistAria')}>
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
            {t(`artifacts.tab.${section}`)}
          </button>
        );
      })}
    </div>
  );
}

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
        placeholder={t('artifacts.customPlaceholder')}
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
      {t('artifacts.addCustom')}
    </button>
  );
}

function ChipGrid({
  options, selected, onToggle, onAddCustom, subtitle, labelFor,
}: {
  options: string[]; selected: string[];
  onToggle: (s: string) => void;
  onAddCustom: (s: string) => void;
  subtitle?: string;
  /** value -> display label. Defaults to identity (custom entries). */
  labelFor?: (value: string) => string;
}) {
  const label = labelFor ?? ((v: string) => v);
  const custom = selected.filter(s => !options.includes(s));
  return (
    <div className="panel-glass flex flex-col gap-3 !p-4 sm:!p-5">
      {subtitle && (
        <p className="text-body-sm font-semibold text-[color:var(--text-heading)] m-0">{subtitle}</p>
      )}
      <div className="flex flex-wrap gap-2">
        {options.map(o => (
          <SelectableChip key={o} label={label(o)} selected={selected.includes(o)} onClick={() => onToggle(o)} />
        ))}
        {custom.map(o => (
          <SelectableChip key={o} label={label(o)} selected onClick={() => onToggle(o)} />
        ))}
        <AddCustomChip onAdd={onAddCustom} />
      </div>
    </div>
  );
}

const SECTION_KEY: Record<ArtifactSection, { headline: string; note: string }> = {
  activities: { headline: 'artifacts.section.activitiesHeadline', note: 'artifacts.section.activitiesNote' },
  achievements: { headline: 'artifacts.section.achievementsHeadline', note: 'artifacts.section.achievementsNote' },
  professions: { headline: 'artifacts.section.professionsHeadline', note: 'artifacts.section.professionsNote' },
  targets: { headline: 'artifacts.section.targetsHeadline', note: 'artifacts.section.targetsNote' },
  dreams: { headline: 'artifacts.section.dreamsHeadline', note: 'artifacts.section.dreamsNote' },
};

// ── Page ─────────────────────────────────────────────────────────────────────

export default function ArtifactsSetupPage() {
  const { t } = useTranslation('onboarding');
  const { t: tc } = useTranslation('common');
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

  const copy = {
    headline: t(SECTION_KEY[activeSection].headline),
    note: t(SECTION_KEY[activeSection].note),
  };
  const presetLabel = (type: string) => (v: string) =>
    t(`preset.${type}.${v}`, { defaultValue: v });

  // Extracted per-section so onboarding can render four of these stacked on
  // one merged screen (see below) while edit mode still shows exactly one
  // at a time via sectionContent, unchanged.
  const activitiesBody = (
    <div className="flex flex-col gap-5">
      <ChipGrid
        subtitle={t('artifacts.subtitleHobbies')}
        options={HOBBIES}
        labelFor={presetLabel('hobby')}
        selected={hobbies}
        onToggle={h => setHobbies(prev => toggle(prev, h))}
        onAddCustom={h => setHobbies(prev => (prev.includes(h) ? prev : [...prev, h]))}
      />
      <ChipGrid
        subtitle={t('artifacts.subtitleClubs')}
        options={CLUBS}
        labelFor={presetLabel('club')}
        selected={clubs}
        onToggle={c => setClubs(prev => toggle(prev, c))}
        onAddCustom={c => setClubs(prev => (prev.includes(c) ? prev : [...prev, c]))}
      />
    </div>
  );

  const achievementsBody = (
    <ChipGrid
      options={ACHIEVEMENTS}
      labelFor={presetLabel('achievement')}
      selected={achievements}
      onToggle={a => setAchievements(prev => toggle(prev, a))}
      onAddCustom={a => setAchievements(prev => (prev.includes(a) ? prev : [...prev, a]))}
    />
  );

  const professionsBody = (
    <ChipGrid
      options={PROFESSIONS}
      labelFor={presetLabel('profession')}
      selected={professions}
      onToggle={p => setProfessions(prev => toggle(prev, p))}
      onAddCustom={p => setProfessions(prev => (prev.includes(p) ? prev : [...prev, p]))}
    />
  );

  const targetsBody = (
    <ChipGrid
      options={TARGETS}
      labelFor={presetLabel('target')}
      selected={targets}
      onToggle={tg => setTargets(prev => toggle(prev, tg))}
      onAddCustom={tg => setTargets(prev => (prev.includes(tg) ? prev : [...prev, tg]))}
    />
  );

  const dreamsBody = (
    <textarea
      value={dreams}
      onChange={e => setDreams(e.target.value)}
      placeholder={t('artifacts.dreamsPlaceholder')}
      className={cn(
        // Высота под пару строк, а не aspect-[2/1]: пропорция растила поле вместе
        // с карточкой и на широком экране разворачивала «одну строку, без правил»
        // в пустой прямоугольник в треть экрана.
        'w-full min-h-[8.5rem] mx-auto field-tile !rounded-[16px] px-4 py-3.5 text-body-md resize-none',
        'placeholder:text-placeholder focus:outline-none transition-colors',
        'focus:border-[color:var(--pine)]',
      )}
      style={{ color: 'var(--ink)' }}
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
      <div className="journey-page journey-page--lit min-h-screen flex flex-col">
        <div className="relative z-[1] flex-1 overflow-y-auto px-3 py-8 sm:px-4 lg:px-6 lg:py-12">
          <div className="max-w-6xl mx-auto flex flex-col gap-6">

            <div>
              <span className="journey-kicker">{t('artifacts.kickerInterests')}</span>
              <Heading level="display-md" className="text-[color:var(--text-heading)] mt-3">
                {t('artifacts.editTitle')}
              </Heading>
              <Text variant="body-md" className="text-secondary mt-1.5">
                {t('artifacts.editSubtitle')}
              </Text>
            </div>

            <SectionTabs active={activeSection} onChange={setActiveSection} />

            <div className="journey-shell flex flex-col gap-6 px-5 py-6 sm:px-8 sm:py-8">
              <div className="flex items-start justify-between gap-4">
                <div className="flex flex-col gap-1.5 min-w-0">
                  <Heading level="display-md" as="h2" className="text-[color:var(--text-heading)]">
                    {copy.headline}
                  </Heading>
                  <Text variant="body-md" className="text-secondary">{copy.note}</Text>
                </div>
                <Mascot state="welcome" size={MASCOT_EDIT_SIZE} className="shrink-0" />
              </div>

              {sectionContent}

              {saveError && (
                <p className="text-xs text-danger text-center m-0">{t('artifacts.saveFailed')}</p>
              )}

              <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-default">
                <Button
                  size="lg"
                  isLoading={isLoading}
                  className="h-12 rounded-pill font-extrabold shadow-button press-scale"
                  onClick={handleNext}
                >
                  {isLastSection ? t('artifacts.done') : t('artifacts.nextGroup')}
                </Button>
                <Button
                  variant="ghost"
                  size="lg"
                  className="h-12 rounded-pill press-scale"
                  onClick={handleSkip}
                >
                  {t('artifacts.skipGroup')}
                </Button>
                <span className="ml-auto font-mono text-mono-xs uppercase tracking-label text-muted">
                  {t('artifacts.groupCounter', { current: sectionIndex + 1, total: ARTIFACT_SECTIONS.length })}
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
    <div className="journey-page journey-page--lit min-h-screen flex flex-col">
      {/* Ни заливки, ни блюра: полоса шагов — flex-сосед НАД областью прокрутки,
          а не слой поверх неё, и прятать ей нечего. Тонировка --bg-page на 72%
          ничего не скрывала, зато клала плоский фог поверх градиента холста и
          давала видимый горизонтальный шов. */}
      <div className="relative z-10 px-4 pt-4 pb-3 sm:px-5 sm:pt-5 sm:pb-4">
        <div className="max-w-6xl mx-auto">
          <OnboardingProgress
            current={PROFILE_STEP_COUNT + (isDreamsStep ? 2 : 1)}
            total={TOTAL_ONBOARDING_STEPS}
          />
        </div>
      </div>

      <div className="relative z-[1] flex-1 overflow-y-auto px-3 pt-4 pb-40 sm:px-4 lg:px-6 lg:pb-10">
        <div className="w-full max-w-6xl mx-auto">
          <div className="journey-shell flex flex-col gap-7 px-5 py-7 sm:px-8 sm:py-9">
            {/* Угол карточки, а не угол экрана: при ширине 1152 боковое поле
                меньше спрайта, и приколотый маскот ложился на «Далее».
                На шаге «мечт» его нет — там своя композиция с маскотом по
                центру. !absolute перебивает `.journey-shell > *`, которое
                принудительно ставит детям position: relative. */}
            {!isDreamsStep && (
              <div className="pointer-events-none !absolute right-6 top-6 hidden lg:block">
                <div className="journey-mascot-well">
                  <Mascot state="transition" size={MASCOT_TRANSITION_SIZE} />
                </div>
              </div>
            )}

            {isDreamsStep ? (
              /* Шаг «мечт» держит свою, узкую колонку и не наследует ширину
                 карточки: это одна центрированная реплика с полем на пару
                 строк, а не сетка чипов. На всю ширину поле «одна строка, без
                 правил» разворачивалось в пустой прямоугольник 1050×525. */
              <div className="flex flex-col items-center gap-6 w-full max-w-2xl mx-auto">
                <div className="flex flex-col items-center gap-4 text-center">
                  <Mascot state="pause" size={MASCOT_PAUSE_SIZE} className="shrink-0" />
                  <div>
                    <div className="flex justify-center mb-3">
                      <span className="journey-kicker">{t('artifacts.kickerDreams')}</span>
                    </div>
                    <Heading level="display-md" className="text-[color:var(--text-heading)] text-balance">
                      {copy.headline}
                    </Heading>
                    <Text variant="body-md" className="text-secondary mt-1.5">
                      {copy.note}
                    </Text>
                  </div>
                </div>

                {dreamsBody}
              </div>
            ) : (
              <div className="flex flex-col gap-7">
                <div>
                  <span className="journey-kicker">{t('artifacts.kickerInterests')}</span>
                  <Heading level="display-md" className="text-[color:var(--text-heading)] text-balance mt-3">
                    {t(SECTION_KEY.activities.headline)}
                  </Heading>
                  <Text variant="body-md" className="text-secondary mt-1.5">
                    {t(SECTION_KEY.activities.note)}
                  </Text>
                </div>
                {activitiesBody}

                <div className="flex flex-col gap-4 pt-1 border-t border-default">
                  <div className="pt-5">
                    <Heading level="display-md" as="h2" className="text-[color:var(--text-heading)]">
                      {t(SECTION_KEY.achievements.headline)}
                    </Heading>
                    <Text variant="body-md" className="text-secondary mt-1.5">
                      {t(SECTION_KEY.achievements.note)}
                    </Text>
                  </div>
                  {achievementsBody}
                </div>

                <div className="flex flex-col gap-4 pt-1 border-t border-default">
                  <div className="pt-5">
                    <Heading level="display-md" as="h2" className="text-[color:var(--text-heading)]">
                      {t(SECTION_KEY.professions.headline)}
                    </Heading>
                    <Text variant="body-md" className="text-secondary mt-1.5">
                      {t(SECTION_KEY.professions.note)}
                    </Text>
                  </div>
                  {professionsBody}
                </div>

                <div className="flex flex-col gap-4 pt-1 border-t border-default">
                  <div className="pt-5">
                    <Heading level="display-md" as="h2" className="text-[color:var(--text-heading)]">
                      {t(SECTION_KEY.targets.headline)}
                    </Heading>
                    <Text variant="body-md" className="text-secondary mt-1.5">
                      {t(SECTION_KEY.targets.note)}
                    </Text>
                  </div>
                  {targetsBody}
                </div>
              </div>
            )}

            {saveError && (
              <p className="text-xs text-danger text-center m-0">{t('artifacts.saveFailed')}</p>
            )}
          </div>
        </div>
      </div>

      <div className={cn(
        'px-3 py-4 z-20 sm:px-4',
        'fixed bottom-0 inset-x-0 lg:static',
        'action-bar-scrim',
      )}>
        <div className="max-w-6xl mx-auto w-full flex items-center gap-3 panel-glass !rounded-[18px] !p-3 lg:mb-6">
          <Button
            variant="ghost"
            size="lg"
            className="h-12 sm:h-14 px-5 sm:px-6 rounded-pill press-scale"
            onClick={handleBack}
          >
            {tc('back')}
          </Button>

          <Button
            size="lg"
            isLoading={isLoading}
            className="ml-auto h-12 sm:h-14 px-8 sm:px-10 rounded-pill font-extrabold shadow-button press-scale"
            onClick={handleNext}
          >
            {isLastSection ? t('artifacts.done') : tc('next')}
          </Button>
        </div>
      </div>
    </div>
  );
}
