import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router';
import { useProfileStore } from '@/shared/store/profile';
import { CERTIFICATE_TYPES, validateCertificateScore } from '@/shared/config/certificates';
import type { CertificateItem, CertificateType } from '@/shared/types';
import { useOnboardingDraftStore } from '../onboardingDraftStore';

// Exam score fields are keyed by exam ('ielts' | 'unt' | ...), so they share
// this error map with the plain profile fields rather than living in a
// second one — step 2 renders both kinds of error the same way.
type FieldErrors = Partial<Record<'name' | 'age' | 'grade' | CertificateType, string>>;

/** Raw, as-typed score per exam — parsed only at submit time, like `age`. */
type ExamScores = Record<CertificateType, string>;

const EMPTY_EXAM_SCORES = Object.fromEntries(
  CERTIFICATE_TYPES.map(type => [type, '']),
) as ExamScores;

// 2 screens ("диалог, не форма"), each merging what used to be two separate
// steps onto one scrollable screen (same pattern NAME_SCHOOL already used
// internally for имя+возраст — just extended to a second merged pair):
//  1. имя + возраст, класс + город (+ страна)
//  2. предметы: нравятся / не нравятся, легко / где приходится стараться
//     больше (neutral framing — see ProfileSetupPage's SUBJECTS copy), plus
//     the optional exam-scores block (IELTS/ЕНТ/SAT/TOEFL) — added as a third
//     block on this screen rather than a 5th step, so the "Шаг X из 4" count
//     students already see stays put.
const TOTAL_STEPS = 2;
const STEP_NAME_SCHOOL = 1;
const STEP_SUBJECTS = 2;

export const PROFILE_STEPS = {
  NAME_SCHOOL: STEP_NAME_SCHOOL,
  SUBJECTS: STEP_SUBJECTS,
} as const;

// Mirror the backend's ProfileCreateRequest/ProfileUpdateRequest `name`
// constraint (app/schemas/profile.py) — max stays well under the DB
// column's String(255) cap so a rejected name never reaches that layer.
export const NAME_MIN_LENGTH = 3;
export const NAME_MAX_LENGTH = 60;

// Letters (any script) plus space/hyphen/apostrophe for names like
// "Анна-Мария" or "O'Brien" — no digits, no other symbols. Mirrors the
// backend's Field(pattern=...) on name.
const NAME_ALLOWED_CHARS = /[^\p{L}\s'-]/gu;
const NAME_PATTERN = /^[\p{L}\s'-]+$/u;

/** Strips disallowed characters as the user types, so digits/symbols never
 *  land in the field to begin with rather than being caught after submit. */
export function sanitizeName(value: string): string {
  return value.replace(NAME_ALLOWED_CHARS, '');
}

function toggle(list: string[], item: string): string[] {
  return list.includes(item) ? list.filter(s => s !== item) : [...list, item];
}

export function useProfileSetup() {
  const { t } = useTranslation('onboarding');
  const navigate = useNavigate();
  const location = useLocation();
  // A real, already-onboarded profile exists server-side — this is a
  // Profile-settings edit, not fresh onboarding. Both cases now flow through
  // the same handoff to ArtifactsSetupPage, which picks PUT vs POST based on
  // this same store (see useArtifactsSetup.ts's hasExistingProfile).
  const existing = useProfileStore(s => s.profile);

  const draft = useOnboardingDraftStore(s => s.profileDraft);
  const setProfileDraft = useOnboardingDraftStore(s => s.setProfileDraft);

  const locationState = location.state as { resumeAtLastStep?: boolean } | null;
  // Arriving back here via "Назад" from artifacts' first group (see
  // useArtifactsSetup.handleBack) resumes at the last step instead of
  // restarting the whole form — from the student's point of view they never
  // left this flow, just stepped back one screen.
  const resumeAtLastStep = Boolean(locationState?.resumeAtLastStep);
  const [step, setStep] = useState(resumeAtLastStep ? TOTAL_STEPS : 1);
  // Field values come from (in priority order): an already-onboarded server
  // profile (settings edit), a draft parked here on a previous pass through
  // this screen during onboarding (resumed via "Назад" from artifacts), or
  // blank for a brand-new pass.
  const [name, setName] = useState(existing?.name ?? draft?.name ?? '');
  const [age, setAge] = useState(existing?.age ? String(existing.age) : draft?.age ?? '');
  const [grade, setGrade] = useState(existing?.grade ? String(existing.grade) : draft?.grade ?? '');
  const [city, setCity] = useState(existing?.city ?? draft?.city ?? '');
  const [country, setCountry] = useState(existing?.country ?? draft?.country ?? '');
  // No onboarding screen collects this right now (removed as not-needed-yet) —
  // kept in state purely so an edit-mode profile that already has a language
  // set doesn't lose it on save, and so the required ProfilePayload field
  // still gets submitted (empty string for new profiles).
  const [language, setLanguage] = useState(existing?.language ?? draft?.language ?? '');
  const [subjectsLike, setSubjectsLike] = useState<string[]>(existing?.subjects_liked ?? draft?.subjectsLike ?? []);
  // "Не нравятся" — a preference axis (paired with subjectsLike), collected
  // on the same SUBJECTS_LIKE screen, distinct from the easy/hard
  // difficulty axis below.
  const [subjectsDislike, setSubjectsDislike] = useState<string[]>(existing?.subjects_disliked ?? draft?.subjectsDislike ?? []);
  const [subjectsEasy, setSubjectsEasy] = useState<string[]>(existing?.subjects_easy ?? draft?.subjectsEasy ?? []);
  const [subjectsHard, setSubjectsHard] = useState<string[]>(existing?.subjects_hard ?? draft?.subjectsHard ?? []);

  // Exams the student says they've actually sat. Kept separate from the
  // scores themselves so "ticked IELTS but hasn't typed the score yet" is a
  // distinct, validatable state — otherwise a blank field would be
  // indistinguishable from "didn't sit it" and would silently vanish on save.
  const savedCertificates = existing?.certificates ?? draft?.certificates;
  const [examsTaken, setExamsTaken] = useState<CertificateType[]>(
    () => savedCertificates?.map(c => c.type) ?? [],
  );
  const [examScores, setExamScores] = useState<ExamScores>(() => ({
    ...EMPTY_EXAM_SCORES,
    ...Object.fromEntries(savedCertificates?.map(c => [c.type, String(c.score)]) ?? []),
  }));

  const [errors, setErrors] = useState<FieldErrors>({});

  function clearError(field: keyof FieldErrors) {
    setErrors(prev => ({ ...prev, [field]: undefined }));
  }

  /** Ticking an exam reveals its score field; unticking clears whatever was
   *  typed, so a stale number can't reappear if it's ticked again later. */
  function toggleExam(type: CertificateType) {
    const wasTaken = examsTaken.includes(type);
    setExamsTaken(prev => (wasTaken ? prev.filter(t => t !== type) : [...prev, type]));
    if (wasTaken) setExamScores(prev => ({ ...prev, [type]: '' }));
    clearError(type);
  }

  function setExamScore(type: CertificateType, value: string) {
    setExamScores(prev => ({ ...prev, [type]: value }));
    clearError(type);
  }

  // Both merge into the shared `errors` object (rather than replacing it
  // outright) since step 1 now shows name/age and grade together — running
  // both validations must surface both sets of errors at once, not have
  // the second call's setErrors wipe out the first's.
  function validateNameAge(): boolean {
    const trimmedName = name.trim();
    const name_ = !trimmedName
      ? t('validation.nameRequired')
      : trimmedName.length < NAME_MIN_LENGTH
        ? t('validation.nameTooShort', { min: NAME_MIN_LENGTH })
        : trimmedName.length > NAME_MAX_LENGTH
          ? t('validation.nameTooLong', { max: NAME_MAX_LENGTH })
          : !NAME_PATTERN.test(trimmedName)
            ? t('validation.nameLettersOnly')
            : undefined;
    const ageNum = Number(age);
    const age_ = (!age || isNaN(ageNum) || ageNum < 14 || ageNum > 18) ? t('validation.ageRange') : undefined;
    setErrors(prev => ({ ...prev, name: name_, age: age_ }));
    return !name_ && !age_;
  }

  function validateSchool(): boolean {
    const gradeNum = Number(grade);
    const grade_ = (!grade || isNaN(gradeNum) || gradeNum < 1 || gradeNum > 12) ? t('validation.gradeRange') : undefined;
    setErrors(prev => ({ ...prev, grade: grade_ }));
    return !grade_;
  }

  // The whole scores block is optional — nothing here blocks a student who
  // sat no exams. It only objects to a half-finished entry: an exam ticked
  // with no (or an out-of-range) score. Errors are written for every exam
  // type, not just the ticked ones, so unticking an exam also clears the
  // error it left behind.
  function validateScores(): boolean {
    const scoreErrors = Object.fromEntries(
      CERTIFICATE_TYPES.map(type => [
        type,
        examsTaken.includes(type)
          ? validateCertificateScore(type, examScores[type], { required: true, t })
          : undefined,
      ]),
    ) as FieldErrors;

    setErrors(prev => ({ ...prev, ...scoreErrors }));
    return CERTIFICATE_TYPES.every(type => !scoreErrors[type]);
  }

  function handleNext() {
    // Both merged sub-screens' fields live on step 1 now — run both
    // validations (not short-circuited) so both sets of errors show up
    // together when both are invalid.
    if (step === STEP_NAME_SCHOOL) {
      const nameAgeOk = validateNameAge();
      const schoolOk = validateSchool();
      if (!nameAgeOk || !schoolOk) return;
    }
    setStep(s => s + 1);
  }

  function handleBack() {
    setStep(s => s - 1);
  }

  function handleSubmit() {
    if (!validateScores()) return;

    // Only ticked exams become certificates, and in catalog order rather
    // than the order they happened to be clicked, so the payload (and the
    // profile's "04 БАЛЛЫ" row built from it) is stable across passes.
    const certificates: CertificateItem[] = CERTIFICATE_TYPES
      .filter(type => examsTaken.includes(type))
      .map(type => ({ type, score: Number(examScores[type]) }));

    // The actual save (POST for a new profile, PUT for an existing one)
    // happens once, at the end of the whole sequence (steps 3-4, in
    // ArtifactsSetupPage), combining this data with whatever artifacts get
    // collected there. Just park the fields and move on; no network call
    // from this screen anymore, for either fresh onboarding or an edit.
    setProfileDraft({
      name: name.trim(),
      age,
      grade,
      city: city.trim(),
      country: country.trim(),
      language,
      subjectsLike,
      subjectsDislike,
      subjectsEasy,
      subjectsHard,
      certificates,
    });
    navigate('/onboarding/artifacts', { replace: true });
  }

  return {
    step,
    totalSteps: TOTAL_STEPS,
    progress: (step / TOTAL_STEPS) * 100,
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
    examsTaken, toggleExam,
    examScores, setExamScore,
    errors,
    clearError,
    handleNext,
    handleBack,
    handleSubmit,
    toggle,
  };
}
