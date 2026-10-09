import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { Button } from '@/shared/ui';
import { useArtifactsSetup, ARTIFACT_SECTIONS, DREAMS_MAX_LENGTH, type ArtifactSection } from './hooks/useArtifactsSetup';
import { OnboardingShell } from './components/OnboardingShell';
import { SelectableChip } from './components/SelectableChip';
import { AddCustomChip } from './components/AddCustomChip';
import { PROFILE_STEP_COUNT } from './onboardingSteps';

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
  const { t } = useTranslation('onboarding');
  const label = labelFor ?? ((v: string) => v);
  const custom = selected.filter(s => !options.includes(s));
  return (
    <div className="rd-choice-group">
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
        <AddCustomChip
          label={t('artifacts.addCustom')}
          placeholder={t('artifacts.customPlaceholder')}
          onAdd={onAddCustom}
        />
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

  const isDreamsOverLimit = dreams.length > DREAMS_MAX_LENGTH;
  const dreamsBody = (
    <div className="rd-dreams-field">
      <textarea
        value={dreams}
        maxLength={DREAMS_MAX_LENGTH}
        onChange={e => setDreams(e.target.value)}
        placeholder={t('artifacts.dreamsPlaceholder')}
        aria-label={t('artifacts.section.dreamsHeadline')}
        aria-describedby="dreams-counter"
        aria-invalid={isDreamsOverLimit}
        rows={6}
      />
      <p id="dreams-counter" className={isDreamsOverLimit ? 'text-danger' : undefined} aria-live="polite">
        {t('artifacts.dreamsCounter', { current: dreams.length, max: DREAMS_MAX_LENGTH })}
      </p>
    </div>
  );
  const bodies: Record<ArtifactSection, ReactNode> = {
    activities: activitiesBody, achievements: achievementsBody,
    professions: professionsBody, targets: targetsBody, dreams: dreamsBody,
  };
  const isDreamsStep = activeSection === 'dreams';
  const current = isLinearFlow ? PROFILE_STEP_COUNT + (isDreamsStep ? 2 : 1) : sectionIndex + 1;

  return (
    <OnboardingShell
      current={current}
      showCompanion={!isDreamsStep}
      sections={isLinearFlow ? undefined : ARTIFACT_SECTIONS.map(section => t(`redesign.editSections.${section}`))}
      onSectionSelect={isLinearFlow ? undefined : index => { if (!isLoading) setActiveSection(ARTIFACT_SECTIONS[index]); }}
      actions={<>
        {isLinearFlow ? (
          <Button variant="ghost" className="rd-button rd-button-outline" disabled={isLoading} onClick={handleBack}><ArrowLeft size={17} aria-hidden="true" />{tc('back')}</Button>
        ) : (
          <Button variant="text" disabled={isLoading} onClick={handleSkip}>{t('artifacts.skipGroup')}</Button>
        )}
        <Button className="rd-button rd-setup-next" isLoading={isLoading} onClick={handleNext}>
          {isLastSection ? t('artifacts.done') : tc('next')}
          {isLastSection ? <Check size={17} aria-hidden="true" /> : <ArrowRight size={17} aria-hidden="true" />}
        </Button>
      </>}
    >
      <div className="rd-setup-heading"><h1>{copy.headline}</h1><p>{copy.note}</p></div>
      {isDreamsStep && <img className="rd-dreams-mascot" src="/mascot/redesign/celebrate.png" width="1254" height="1254" alt="" />}
      {bodies[activeSection]}
      {isLinearFlow && !isDreamsStep && (['achievements', 'professions', 'targets'] as const).map(section => (
        <section className="rd-form-section" key={section}>
          <div className="rd-setup-section-heading"><h2>{t(SECTION_KEY[section].headline)}</h2><p>{t(SECTION_KEY[section].note)}</p></div>
          {bodies[section]}
        </section>
      ))}
      {saveError && <p className="rd-journey-error" role="alert">{t('artifacts.saveFailed')}</p>}
    </OnboardingShell>
  );
}
