import { useTranslation } from 'react-i18next';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Button, Input } from '@/shared/ui';
import { useProfileSetup, PROFILE_STEPS, NAME_MAX_LENGTH, sanitizeName } from './hooks/useProfileSetup';
import { gradesForAge } from '@/shared/lib/ageGrade';
import { OnboardingShell } from './components/OnboardingShell';
import { SelectableChip } from './components/SelectableChip';
import { AddCustomChip } from './components/AddCustomChip';
import { ExamScoresBlock } from './components/ExamScoresBlock';

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
    <div className="rd-choice-group">
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
        {onAddCustom && (
          <AddCustomChip
            label={t('profile.addCustom')}
            placeholder={t('profile.customSubjectPlaceholder')}
            onAdd={onAddCustom}
          />
        )}
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

  const ageNum = Number(age);
  const allowedGrades = !age || Number.isNaN(ageNum) ? [] : gradesForAge(ageNum);
  const gradeMin = allowedGrades[0];
  const gradeMax = allowedGrades[allowedGrades.length - 1];
  const gradeHint =
    !errors.grade && allowedGrades.length > 0
      ? t('validation.gradeForAge', { age: ageNum, min: gradeMin, max: gradeMax })
      : undefined;

  return (
    <OnboardingShell current={step} actions={<>
      {step > 1 && <Button variant="ghost" className="rd-button rd-button-outline" onClick={handleBack}><ArrowLeft size={17} aria-hidden="true" />{tc('back')}</Button>}
      <Button className="rd-button rd-setup-next" onClick={step < totalSteps ? handleNext : handleSubmit}>{tc('next')}<ArrowRight size={17} aria-hidden="true" /></Button>
    </>}>
      {step === PROFILE_STEPS.NAME_SCHOOL && <>
        <div className="rd-setup-heading">
          <h1>{t('profile.nameQuestion')}</h1>
          <p>{t('redesign.aboutNote')}</p>
        </div>
        <Input
          label={t('profile.nameLabel')}
          value={name}
          onChange={e => { setName(sanitizeName(e.target.value)); clearError('name'); }}
          placeholder={t('profile.namePlaceholder')}
          error={errors.name}
          hint={!errors.name ? t('profile.nameHint') : undefined}
          autoComplete="given-name"
          maxLength={NAME_MAX_LENGTH}
        />
        <section className="rd-form-section">
          <h2>{t('profile.ageQuestion')}</h2>
          <div className="rd-age-options" role="group" aria-label={t('profile.agePickerAria')} aria-describedby={errors.age ? 'age-error' : undefined}>
            {AGES.map(a => <button key={a} type="button" aria-pressed={age === String(a)} onClick={() => setAge(String(a))}>{a}</button>)}
          </div>
          {errors.age && <p id="age-error" className="text-danger" role="alert">{errors.age}</p>}
        </section>
        <section className="rd-form-section">
          <div className="rd-setup-section-heading"><h2>{t('profile.schoolQuestion')}</h2><p>{t('profile.schoolNote')}</p></div>
          <div className="rd-school-fields">
            <Input
              label={t('profile.gradeLabel')}
              type="number"
              inputMode="numeric"
              value={grade}
              onChange={e => { setGrade(e.target.value); clearError('grade'); }}
              placeholder={allowedGrades.length ? t('profile.gradePlaceholderRange', { min: gradeMin, max: gradeMax }) : t('profile.gradePlaceholder')}
              error={errors.grade}
              hint={gradeHint}
              min={gradeMin ?? 1}
              max={gradeMax ?? 12}
            />
            <Input label={t('profile.cityLabel')} value={city} onChange={e => setCity(e.target.value)} placeholder={t('profile.cityPlaceholder')} autoComplete="address-level2" />
            <Input label={t('profile.countryLabel')} value={country} onChange={e => setCountry(e.target.value)} placeholder={t('profile.countryPlaceholder')} autoComplete="country-name" />
          </div>
        </section>
      </>}
      {step === PROFILE_STEPS.SUBJECTS && <>
        <div className="rd-setup-heading"><h1>{t('profile.subjectsLikedQuestion')}</h1><p>{t('profile.subjectsLikedNote')}</p></div>
        <div className="rd-subject-grid">
          <SubjectGroup title={t('profile.groupLiked')} selected={subjectsLike} onToggle={s => setSubjectsLike(prev => toggle(prev, s))} onAddCustom={s => setSubjectsLike(prev => (prev.includes(s) ? prev : [...prev, s]))} otherSelected={subjectsDislike} />
          <SubjectGroup title={t('profile.groupDisliked')} selected={subjectsDislike} onToggle={s => setSubjectsDislike(prev => toggle(prev, s))} onAddCustom={s => setSubjectsDislike(prev => (prev.includes(s) ? prev : [...prev, s]))} otherSelected={subjectsLike} />
        </div>
        <section className="rd-form-section">
          <div className="rd-setup-section-heading"><h2>{t('profile.subjectsRestQuestion')}</h2><p>{t('profile.subjectsRestNote')}</p></div>
          <div className="rd-subject-grid">
            <SubjectGroup title={t('profile.groupEasy')} selected={subjectsEasy} onToggle={s => setSubjectsEasy(prev => toggle(prev, s))} otherSelected={subjectsHard} />
            <SubjectGroup title={t('profile.groupHard')} selected={subjectsHard} onToggle={s => setSubjectsHard(prev => toggle(prev, s))} otherSelected={subjectsEasy} />
          </div>
        </section>
        <ExamScoresBlock examsTaken={examsTaken} onToggleExam={toggleExam} examScores={examScores} onScoreChange={setExamScore} errors={errors} />
      </>}
    </OnboardingShell>
  );
}
