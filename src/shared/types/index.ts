import type { Locale } from '@/shared/store/locale';

// ─── Auth ──────────────────────────────────────────────────────────────────────

/** Source of truth for permissions (`pro-281`) — `is_admin` is derived from
 *  this (`is_admin === (role === 'admin')`) and kept only for back-compat. */
export type UserRole = 'student' | 'admin' | 'psychologist';

export interface User {
  id: string;
  email: string;
  name?: string;
  is_active?: boolean;
  is_verified?: boolean;
  /** Prefer this over `is_admin` when branching by staff vs student. */
  role?: UserRole;
  is_admin?: boolean;
  /** UI locale from the backend (`users.locale`). "kk" is stored but not
   *  runtime-honored until KZ-603. */
  locale?: 'ru' | 'kk';
}

export interface TokenResponse {
  access_token: string;
  user: User;
}

// ─── Profile ───────────────────────────────────────────────────────────────────

export type AgeGroup = 'junior' | 'middle' | 'senior';

export interface ProfilePayload {
  name: string;
  age: number;
  grade: number;
  city: string;
  country: string;
  language: string;
  subjects_liked: string[];
  subjects_disliked: string[];
  subjects_easy: string[];
  subjects_hard: string[];
  /** Optional — POST /profile now accepts artifacts inline, saving profile
   *  and artifacts together in one transaction. Omit to keep using the old
   *  two-call flow (POST /profile, then POST /profile/artifacts). */
  artifacts?: ArtifactItem[];
  /** Exam scores (IELTS/ЕНТ/SAT/TOEFL). Same optional/atomic-write contract
   *  as `artifacts` — any list sent replaces the profile's scores wholesale;
   *  omitting the field leaves them untouched. Collected on onboarding step 2
   *  and editable from Profile's "04 Баллы" section.
   *
   *  The backend also has `gpa_value`/`gpa_scale` columns (present on `dev`),
   *  but nothing on the frontend reads or writes them — GPA was dropped from
   *  the product surface. */
  certificates?: CertificateItem[];
}

export interface ProfileResponse extends ProfilePayload {
  id: string;
  user_id: string;
  age_group: AgeGroup;
  /** Always present on the response now, even if `artifacts` wasn't sent
   *  in the request (empty array in that case). */
  artifacts: ArtifactItem[];
  /** Same semantics as `artifacts`, backed by certificate_service instead. */
  certificates: CertificateItem[];
}

// ─── Artifacts ─────────────────────────────────────────────────────────────────

export type ArtifactType =
  | 'hobby'
  | 'club'
  | 'sport'
  | 'achievement'
  | 'goal'
  | 'book'
  | 'game'
  | 'topic'
  | 'profession'
  | 'university'
  | 'dream';

export interface ArtifactItem {
  type: ArtifactType;
  value: string;
}

// ─── Certificates (exam scores) ──────────────────────────────────────────────────

export type CertificateType = 'ielts' | 'unt' | 'sat' | 'toefl';

export interface CertificateItem {
  type: CertificateType;
  score: number;
}

// ─── Assessment ────────────────────────────────────────────────────────────────

// 'unsure' is legacy-only, like 'profession' (see shared/lib/assessmentGoal.ts)
// — GoalSelectionPage no longer lets a student pick it, but old assessments
// and the admin goal filter (docs/frontend-admin-users-api-contract.md §2)
// can still carry/query for it.
export type AssessmentGoal = 'explore' | 'profession' | 'university' | 'unsure';
export type AssessmentStatus = 'in_progress' | 'completed';

export type HollandType = 'R' | 'I' | 'A' | 'S' | 'E' | 'C';
// PRO-338 Ф0.2: professional_types (ДДО pairs, QuestionPair-based) /
// professional_types_abilities (ДДО abilities, Likert-based) / eysenck /
// elers (both Likert-based, binary Да/Нет scale — Ф0.5) mirror
// app/models/question.py::QuestionInstrument 1:1. `validity` is
// deliberately NOT here — PRO-282's protocol-validity items are masked as
// `riasec` on the wire (PRO-298) and never reach the frontend as their own
// instrument value.
export type Instrument =
  | 'riasec'
  | 'big_five'
  | 'mi'
  | 'professional_types'
  | 'professional_types_abilities'
  | 'eysenck'
  | 'elers'
  | 'boyko_empathy'
  | 'kondash_anxiety';
export type BigFiveDomain = 'N' | 'E' | 'O' | 'A' | 'C';
// Junior's (6-9) interest instrument, replacing RIASEC — TZ_Profi.md §4.1
// excludes career orientation for that age group. See MI_LABELS/MI_ICONS.
export type MIType =
  | 'verbal' | 'logical' | 'musical' | 'visual' | 'bodily'
  | 'interpersonal' | 'intrapersonal' | 'naturalistic';

export interface AssessmentResponse {
  id: string;
  goal: AssessmentGoal;
  status: AssessmentStatus;
  answered_count: number;
  total_questions: number;
  motivation_answered_count: number;
  motivation_total: number;
  belbin_completed?: boolean;
  astur_completed?: boolean;
  created_at: string;
}

export interface Question {
  id: string;
  instrument: Instrument;
  riasec_type: HollandType | null;
  bigfive_domain: BigFiveDomain | null;
  text: string;
  order: number;
}

export interface AnswerPayload {
  question_id: string;
  value: number;
}

export interface SaveAnswersPayload {
  answers: AnswerPayload[];
}

export interface SaveAnswersResponse {
  answered_count: number;
  total: number;
  completed: boolean;
}

// ─── Motivation (forced-choice triplets) ────────────────────────────────────────

export type MotivationCategory =
  | 'interest' | 'challenge' | 'helping' | 'freedom' | 'money'
  | 'recognition' | 'stability' | 'creation' | 'teamwork';

export interface MotivationStatement {
  id: string;
  triplet_index: number;
  order: number;
  text: string;
}

export interface MotivationTriplet {
  triplet_index: number;
  statements: MotivationStatement[];
}

export interface MotivationAnswerPayload {
  triplet_index: number;
  most_statement_id: string;
  least_statement_id: string;
}

export interface SubmitMotivationPayload {
  answers: MotivationAnswerPayload[];
}

export interface SubmitMotivationResponse {
  answered_count: number;
  total: number;
  completed: boolean;
}

// ─── Motivation pairs (Harter format, junior + middle) ──────────────────────────

export interface MotivationPairItem {
  pair_index: number;
  text_a: string;
  text_b: string;
}

export type MotivationPairSide = 'a' | 'b';
export type MotivationIntensity = 'high' | 'medium';

export interface MotivationPairAnswerPayload {
  pair_index: number;
  chosen_side: MotivationPairSide;
  intensity: MotivationIntensity;
}

export interface SubmitMotivationPairPayload {
  answers: MotivationPairAnswerPayload[];
}

export interface SubmitMotivationPairResponse {
  answered_count: number;
  total: number;
  completed: boolean;
}

// ─── Question pairs (junior forced-choice format) ───────────────────────────────

export interface QuestionPairOption {
  id: string;
  text: string;
  icon: string | null;
  riasec_type: HollandType | null;
  bigfive_domain: BigFiveDomain | null;
  mi_category: MIType | null;
}

export interface QuestionPair {
  pair_index: number;
  instrument: Instrument;
  frame: string | null;
  // min(option_a's, option_b's) underlying Question.order — used to
  // interleave a pair into its position in the plain-Likert sequence
  // (middle only; junior's dedicated screen just uses pair_index order).
  display_order: number;
  option_a: QuestionPairOption;
  option_b: QuestionPairOption;
}

export interface PairAnswerPayload {
  pair_index: number;
  picked_question_id: string;
}

export interface SubmitPairAnswersPayload {
  answers: PairAnswerPayload[];
}

export interface SubmitPairAnswersResponse {
  answered_count: number;
  total: number;
  completed: boolean;
}

// ─── Belbin BTRSPI (ипсативный блок, вне обычного /assessment потока) ───────────

export interface BelbinContentItem {
  id: string;
  text: string;
}

export interface BelbinContentSection {
  section: string;
  title: string;
  items: BelbinContentItem[];
}

export interface BelbinContent {
  instruction: string;
  block_total: number;
  sections: BelbinContentSection[];
}

export interface SubmitBelbinPayload {
  /** Ровно 7 блоков, в порядке разделов I..VII — каждый `{item_id: баллы}`. */
  allocations: Record<string, number>[];
}

export interface SubmitBelbinResponse {
  run_id: string;
  role_totals: Record<string, number>;
}

// ─── АСТУР (ипсативный/таймированный блок, вне обычного /assessment потока) ─────

export type AsturSubtestKey =
  | 'awareness'
  | 'analogies'
  | 'lability'
  | 'classification'
  | 'generalization'
  | 'logical_schemas'
  | 'numeric_series'
  | 'geometric_figures';

export interface AsturAwarenessItem {
  text: string;
  options: string[];
}

export interface AsturAnalogyItem {
  pair: [string, string];
  third: string;
  options: string[];
}

export type AsturLabilityAnswerFormat = 'digit' | 'shape' | 'symbol' | 'word';

export interface AsturLabilityItem {
  instruction: string;
  answer_format: AsturLabilityAnswerFormat;
  // Always exactly 2 values — every lability command is a 2-way choice,
  // rendered as buttons (2026-09-18: was free-text input for every format
  // except 'shape', which live in-office testing found too hard to use
  // under the per-item timer — reading, deciding, AND typing correctly).
  options: [string, string];
}

export interface AsturClassificationItem {
  words: string[];
}

export interface AsturGeneralizationItem {
  pair: [string, string];
}

export interface AsturLogicalSchemaItem {
  /** Уже перемешано бэкендом — не порядок ответа. */
  concepts: string[];
}

export interface AsturNumericSeriesItem {
  sequence: number[];
}

/** No content fields — the stimulus is a static image asset
 *  (`/astur-figures/{itemNumber}-{target|a|b|v|g}.png`), addressed by the
 *  item's 1-based position within the subtest, not by any server-sent
 *  field. The server only ever holds this item's `answer` letter. */
export type AsturFigureAssemblyItem = Record<string, never>;

export type AsturContentItem =
  | AsturAwarenessItem
  | AsturAnalogyItem
  | AsturLabilityItem
  | AsturClassificationItem
  | AsturGeneralizationItem
  | AsturLogicalSchemaItem
  | AsturNumericSeriesItem
  | AsturFigureAssemblyItem;

export interface AsturContentSubtest {
  number: number;
  key: AsturSubtestKey;
  name: string;
  instruction: string;
  item_count: number;
  scored: boolean;
  /** `null` только у `lability` — у неё свой лимит на команду, не на весь субтест. */
  time_limit_sec: number | null;
  items: AsturContentItem[];
}

export interface AsturContent {
  subtests: AsturContentSubtest[];
  lability_item_limit_ms: number;
}

export interface StartAsturSubtestResponse {
  run_id: string;
  subtest: string;
  started_at: string;
}

export interface SubmitAsturSubtestPayload {
  /** Форма значения зависит от субтеста: строка (MC/обобщение), 2 строки
   *  (классификации), список понятий (логические схемы), 2 числа (ряды),
   *  строка per-формату лабильности. */
  answers: Record<string, unknown>;
  /** Только для лабильности — время на каждую команду. */
  elapsed_ms?: Record<string, number>;
}

export interface SubmitAsturSubtestResponse {
  run_id: string;
  subtest: string;
  actual_ms: number | null;
  over_limit_items: string[];
}

// ─── Results ───────────────────────────────────────────────────────────────────

export interface CareerMatch {
  slug: string;
  name: string;
  holland_code: string;
  match_score: number;
  description: string;
  professions: string[];
  skills_needed: string[];
  subjects_to_develop: string[];
  first_steps: string[];
}

export interface RiasecMeta {
  differentiation: number;
  consistency: 'high' | 'medium' | 'low';
  // HollandType keys for middle/senior, MIType keys for junior — see
  // AnalysisResultResponse.profile/code below.
  aversion: Record<string, number>;
}

export interface DevelopmentPlan {
  reinforce: string[];
  compensate: string[];
}

export interface ThinkingStyle {
  creative_think: number;
  systematic: number;
  strategic: number;
  practical: number;
}

export type PersonalityTrait =
  | 'openness' | 'conscientiousness' | 'extraversion' | 'agreeableness' | 'emotional_stability';

// Raw/admin-only shape — mirrors the backend's AdminAnalysisResultResponse
// (schemas/admin_result.py). Student-facing `/result` no longer returns this
// at all (see ResultResponse below) — this type is only used by the admin
// panel (AdminAssessmentDetail.analysis_result), which talks to a separate,
// unaffected admin endpoint.
export interface AnalysisResultResponse {
  id: string;
  assessment_id: string;
  // RIASEC letters (HollandType) for middle/senior; MI categories (MIType)
  // for junior — see MI_LABELS/MI_ICONS in shared/config/constants.ts and
  // useResults.ts's ageGroup branching. `careers` is always [] for junior.
  profile: Record<string, number>;
  code: string[];
  meta: RiasecMeta;
  careers: CareerMatch[];
  strengths: string[];
  weaknesses: string[];
  development_plan: DevelopmentPlan;
  big_five: Record<BigFiveDomain, number>;
  thinking_style: ThinkingStyle;
  personality_highlights: string[];
  personality_profile: Record<PersonalityTrait, number>;
  personality_notes: Record<PersonalityTrait, string>;
  motivation: Record<MotivationCategory, number>;
  motivation_top: MotivationCategory[];
  motivation_highlights: string[];
  /** v2 report fields — empty ([]) / 1 until the v2 report is (re)generated
   *  for this assessment, not an error state (see
   *  docs/frontend-admin-users-api-contract.md §5). `StrengthCard`/
   *  `ThinkingStyleNote` are the same shapes student-facing `ResultResponse`
   *  uses (see the "Result v2" section below) — this is the raw admin mirror. */
  strength_cards: StrengthCard[];
  thinking_style_notes: ThinkingStyleNote[];
  report_version: number;
  summary: string;
  created_at: string;
}

// ─── Result v2 (student-facing /result — see frontend-result-api-contract.md) ──
//
// No raw scores/percentages/codes anywhere in this shape — that's a content
// guarantee from the backend (extra="forbid" on every model there), not just
// a convention here. `interest_instrument` is the ONLY field allowed to
// decide which branch of the union applies — never infer it from age group,
// array lengths, or any other field (contract §3).

export interface StrengthCard {
  title: string;
  description: string;
}

export interface ThinkingStyleNote {
  title: string;
  description: string;
}

export type InterestLevel = 'low' | 'medium' | 'high';

// One card per Big Five domain, always exactly 5, same order, for every
// age group/instrument (Big Five is answered identically by all three —
// only the wording differs: junior gets simplified phrasing). Deterministic
// server text, not LLM-generated — see frontend-result-api-contract.md §4.3a.
// `level` was added alongside interest_map's field of the same name — how
// pronounced this trait is, same opaque low/medium/high enum, no raw score.
export interface StudentPersonalityNote {
  trait: PersonalityTrait;
  label: string;
  description: string;
  level: InterestLevel;
}

export interface InterestQuote {
  text: string;
  answer: 'like' | 'dislike';
}

// "Why this level" breakdown for one RIASEC type (PRO-336). `distribution`
// is answer counts strongest-liking first: [очень нравится, нравится,
// не уверен, не нравится, совсем не нравится]. `score` (0-100) only
// positions the level meter — never print it as a percentage.
export interface InterestMapItemDetails {
  answered: number;
  distribution: number[];
  likes: number;
  dislikes: number;
  score: number;
  means: string;
  follows: string;
  quotes: InterestQuote[];
}

export interface InterestMapItem {
  code: string;
  sphere: string;
  level: InterestLevel;
  // RIASEC only; null for MI and for reports cached before PRO-336.
  details?: InterestMapItemDetails | null;
}

/** How the two most pronounced RIASEC types sit on Holland's hexagon. */
export interface InterestCombination {
  codes: string[];
  relation: 'adjacent' | 'alternate' | 'opposite';
  text: string;
}

export type CareerTier = 'strong' | 'good' | 'worth_trying';

export interface StudentCareer {
  slug: string;
  name: string;
  rank: number;
  tier: CareerTier;
  why: string;
  matched_strengths: string[];
  try_now: string;
  description: string | null;
  skills_needed: string[];
  subjects_to_develop: string[];
}

// ─── PRO-282 psych-block sections — «Достоверность протокола» + «Психоэмоц.
// тест» (МЦВ Собчик). `null` on a student's own /result (never shown to
// them); attached only for a psychologist/admin viewer
// (report_service.psych_sections_for — the ONLY place that decides
// visibility, never re-implemented here). МАК is out of scope (PRO-282 §4)
// — mirrors app/schemas/result_v2.py field-for-field. Wired into
// ReportSectionsBlock at Ф4.1 (PRO-338) — this type existed on the backend
// since PRO-282/PRO-300 but had no frontend counterpart in this branch
// until now (PRO-282's own frontend was never merged here).

export type ValidityTrafficLight = 'green' | 'yellow' | 'red';
export type SdLevel = 'ok' | 'social_desirability' | 'high';

export interface ValiditySection {
  consent_ok: boolean;
  traffic_light: ValidityTrafficLight;
  sd_raw: number;
  sd_level: SdLevel;
  sd_bounds: [number, number];
  longstring_max: number;
  irv: number;
  infrequency_failed: number;
  careless_flag: boolean;
  thresholds_version: number;
}

export type PsychoEmotionalValidityFlag = 'ok' | 'caution' | 'low';
export type PsychoAnxietyLevel = 'low' | 'moderate' | 'high' | 'very_high';
export type PsychoCompensationLevel = 'low' | 'moderate' | 'high';
export type PsychoSoLevel = 'norm' | 'elevated' | 'high';
export type PsychoVkLevel = 'low_tone' | 'reduced' | 'balance' | 'overexcited';
export type PsychoFunctionalSign = 'plus' | 'cross' | 'equal' | 'minus';

export interface PsychoEmotionalPositionalPair {
  sign: PsychoFunctionalSign;
  colors: [number, number];
}

export interface PsychoEmotionalSplitPair {
  colors: [number, number];
  stable: boolean;
}

export interface PsychoEmotionalAnxiety {
  score: number;
  level: PsychoAnxietyLevel;
  breakdown: Record<string, number>;
}

export interface PsychoEmotionalCompensation {
  score: number;
  level: PsychoCompensationLevel;
  breakdown: Record<string, number>;
  purple_forward: boolean;
  purple_position: number;
}

export interface PsychoEmotionalHistoryItem {
  run_number: number;
  completed_at: string;
  so: number | null;
  anxiety_score: number | null;
  validity_flag: PsychoEmotionalValidityFlag | null;
}

export interface PsychoEmotionalSection {
  consent_ok: boolean;
  thresholds_version: number | null;
  run_number: number;
  completed_at: string;
  history: PsychoEmotionalHistoryItem[];
  checkin: Record<string, unknown>;
  validity_flag: PsychoEmotionalValidityFlag | null;
  validity_reasons: string[];
  choice_1: number[];
  choice_2: number[];
  d_value: number;
  d_memory: boolean;
  d_situationally_unstable: boolean;
  positional_pairs: PsychoEmotionalPositionalPair[];
  root_conflict: [number, number];
  split_pairs: PsychoEmotionalSplitPair[];
  split_count: number;
  instability: boolean;
  anxiety: PsychoEmotionalAnxiety;
  compensation: PsychoEmotionalCompensation;
  so_value: number;
  so_level: PsychoSoLevel;
  vk_value: number;
  vk_level: PsychoVkLevel;
  black_first: boolean;
}

interface ResultResponseBase {
  report_version: 2;
  assessment_id: string;
  summary: string;
  disclaimer: string;
  strength_cards: StrengthCard[];
  interest_map: InterestMapItem[];
  interest_map_note: string;
  thinking_style_notes: ThinkingStyleNote[];
  personality_notes: StudentPersonalityNote[];
  personality_note: string;
  motivation_highlights: string[];
  is_flat_profile: boolean;
  exploration_note: string;
  final_analysis: string;
  created_at: string;
  /** `null` unless the viewer is a psychologist/admin AND the calc has run. */
  validity: ValiditySection | null;
  /** `null` unless the viewer is a psychologist/admin AND a run exists. */
  psychoemotional: PsychoEmotionalSection | null;
}

export interface MiResultResponse extends ResultResponseBase {
  interest_instrument: 'mi';
  careers: [];
  exploration_activities: string[];
}

export interface RiasecResultResponse extends ResultResponseBase {
  interest_instrument: 'riasec';
  interest_combination?: InterestCombination | null;
  careers: StudentCareer[];
  exploration_activities: [];
}

export type ResultResponse = MiResultResponse | RiasecResultResponse;

// ─── Direction-fit inquiry ──────────────────────────────────────────────────────

export interface DirectionQuestion {
  text: string;
  kind: 'interest' | 'readiness';
}

export interface DirectionQuestionsResponse {
  direction_slug: string;
  direction_name: string;
  scale: string[];
  questions: DirectionQuestion[];
}

export interface DirectionVerdict {
  direction_slug: string;
  readiness: string;
  fit_summary: string;
  note: string;
}

// ─── Roadmap ───────────────────────────────────────────────────────────────────

export type RoadmapHorizonKey =
  | 'month_1'
  | 'months_3'
  | 'months_6'
  | 'year_1'
  | 'until_goal';

export type RoadmapTaskCategory =
  | 'study'
  | 'language'
  | 'project'
  | 'exam'
  | 'explore'
  | 'achievement'
  | 'knowledge'
  | 'skill'
  | 'practice'
  | 'portfolio'
  | 'career'
  | 'education'
  | 'planning'
  | 'documents'
  | 'requirement'
  | 'finance'
  | 'admission'
  | 'application';

export interface RoadmapTask {
  text: string;
  description: string | null;
  category: RoadmapTaskCategory;
  priority: number;
}

export interface RoadmapMilestone {
  horizon: RoadmapHorizonKey;
  title: string;
  tasks: RoadmapTask[];
}

export interface RoadmapResponse {
  id: string;
  assessment_id: string;
  goal: string;
  milestones: RoadmapMilestone[];
}

// ─── Direction roadmap ─────────────────────────────────────────────────────────

export type DirectionHorizonKey = 'months_3' | 'months_6' | 'months_9' | 'months_12';

export type DirectionTaskCategory =
  | 'knowledge'
  | 'skill'
  | 'practice'
  | 'project'
  | 'portfolio'
  | 'soft_skill'
  | 'subject'
  | 'community'
  | 'exam'
  | 'university';

/** Item from the content catalogue. Always empty until the catalogue ships. */
export interface RoadmapResource {
  title: string;
  kind: string;
  url: string | null;
}

/** What a step works on. Steps are tagged, not grouped into fixed columns. */
export type StepTrack = 'profile' | 'growth' | 'integration';

export interface RoadmapStep {
  text: string;
  /** What to do, where to start, and how to know it's done — no googling required. */
  description: string;
  track: StepTrack;
  category: DirectionTaskCategory;
  priority: number;
  resources: RoadmapResource[];
}

export interface DirectionStage {
  horizon: DirectionHorizonKey;
  title: string;
  /** What the student will have by the end of the stage, and why it matters. */
  outcome: string;
  steps: RoadmapStep[];
  /** Set from months_9 on, where profile and growth work converge. */
  integration_project: string | null;
}

export interface RoadmapTarget {
  role: string;
  why: string;
  horizon_years: number;
}

export interface GrowthFocus {
  weakness: string;
  why_it_matters: string;
  /** The signal in the student's own answers this was derived from. */
  evidence: string;
}

export interface UniversityTrack {
  specialties: string[];
  prepare: string[];
}

export interface DirectionRoadmapResponse {
  id: string;
  assessment_id: string;
  direction_slug: string;
  direction_name: string;
  target: RoadmapTarget;
  growth_focus: GrowthFocus;
  stages: DirectionStage[];
  skills_to_build: string[];
  subjects_to_focus: string[];
  university_track: UniversityTrack;
}

// ─── University / Gap-analysis ─────────────────────────────────────────────────

export interface AdmissionScoreItem {
  ovpo: string;
  specialty_code: string;
  specialty_name: string;
  quota: string;
  min_score: number;
  max_score: number;
  year: string;
}

export interface UniversityBrief {
  id: string;
  name: string;
  // "kk" when a Kazakh official name is served (Kazakhstan universities,
  // KZ-206 follow-up), "ru" otherwise. Currently only KZ universities have it.
  name_locale: string;
  country: string;
  city: string;
  website: string | null;
  ranking: number | null;
  short_name: string | null;
  location: string | null;
  ranking_label: string | null;
  uniranks_kz_rank: number | null;
  uniranks_world_rank: number | null;
  description: string | null;
  // KZ-501: which language `description` is actually served in ("kk" when the
  // override exists, "ru" otherwise). Kept for completeness; not rendered.
  description_locale: string;
  image_url: string | null;
  /** Whether the signed-in user starred this university (PRO-265). Always
   *  false for an anonymous request — the backend fills it per-caller. */
  is_favorite: boolean;
}

export interface UniversityListItem extends UniversityBrief {
  programs_count: number;
}

export interface UniversityListResponse {
  items: UniversityListItem[];
  total: number;
  page: number;
  limit: number;
}

export interface UniversityCountry {
  country: string;
  count: number;
}

export interface UniversityDetail extends UniversityBrief {
  contacts: Record<string, string>;
  facilities: Record<string, unknown>;
  source_url: string | null;
  programs: ProgramBrief[];
}

export interface UniversityListParams {
  page?: number;
  limit?: number;
  search?: string;
  country?: string;
  city?: string;
  only_favorites?: boolean;
  sort?: 'ranking' | 'name' | 'kz_rank';
  order?: 'asc' | 'desc';
}

export interface ProgramGrant {
  name: string;
  amount: string | null;
  conditions: string | null;
}

export interface UniversityRequirement {
  program_name: string;
  university_name: string;
  city: string;
  country: string;
  website: string | null;
  program_language: string;
  exams: string[];
  exam_hint_from_notes: string | null;
  application_deadline: string | null;
  grants: ProgramGrant[];
  language_level: string | null;
  portfolio_needed: boolean | null;
  required_documents: string[] | null;
  min_ent_threshold: number | null;
  min_ent_paid: number | null;
  min_gpa: number | null;
  min_sat: number | null;
  extracurriculars: string[];
  admission_scores_2026: string[];
  grant_scores: Record<string, string>;
  grants_allocated_count: number | null;
  duration_years: number | null;
  has_dual_degree: boolean | null;
  has_dormitory: boolean | null;
  dormitory_cost_label: string | null;
  has_military_department: boolean | null;
  admissions_contacts: Record<string, string>;
  notes: string[];
  // null = not specifically researched; false = confirmed this university
  // doesn't require ENT at all (show "не требуется", not "не установлен");
  // true = confirmed it does (plus its own additional test, see notes).
  requires_ent: boolean | null;
}

export interface ProgramBrief {
  id: string;
  name: string;
  profession_slugs: string[];
  // "kk" when a Kazakh program-name (направление) override is served
  // (Kazakhstan universities), "ru" otherwise.
  name_locale: string;
  direction_slug: string;
  language: string;
  cost_per_year: number | null;
  cost_label: string | null;
  description: string | null;
  description_locale: string;
  university: UniversityBrief;
  cost_currency: string | null;
  cost_per_year_min: number | null;
  cost_per_year_max: number | null;
}

export interface ProgramDetail extends ProgramBrief {
  who_its_for: string | null;
  who_its_for_locale: string;
  career_options: unknown[];
  requirements: Record<string, unknown>;
  deadlines: Record<string, unknown>;
  grants: unknown[];
  requirements_summary: UniversityRequirement;
  created_at: string;
}

// ─── Admin ─────────────────────────────────────────────────────────────────────

export interface AdminUserListItem {
  id: string;
  email: string;
  is_verified: boolean;
  is_active: boolean;
  role: UserRole;
  is_admin: boolean;
  created_at: string;
  /** Last time the user was actually seen — refreshed by any authenticated
   *  request, at most once every 5 minutes. This is what the "Активность"
   *  column means; `created_at` is registration and nothing else. null = not
   *  seen since this started being recorded (and, for older accounts, no
   *  assessment either — the backfill used their newest assessment). */
  last_active_at: string | null;
  has_profile: boolean;
  profile_name: string | null;
  /** From the profile — a regional cut is an obvious question of any export
   *  for a Kazakhstan product. */
  city: string | null;
  grade: number | null;
  assessments_count: number;
  /** null if the profile isn't filled in yet. */
  age_group: AgeGroup | null;
  latest_assessment_status: AssessmentStatus | null;
  /** Always the user's actual latest assessment — independent of which assessment
   *  (if any) actually matched the `status`/`goal` list filters (see
   *  docs/frontend-admin-users-api-contract.md §2's "found by filter" vs.
   *  "actual latest" warning). null if the user has no assessments at all. */
  latest_assessment_goal: AssessmentGoal | null;
  /** Admin-only raw percentages from the latest COMPLETED assessment
   *  (TZ_Profi.md §18.3). `riasec` is null for junior (MI instrument, not
   *  RIASEC) and for users with no completed assessment yet. */
  riasec: Record<string, number> | null;
  /** Junior's interest instrument is MI, not RIASEC, so exactly one of
   *  `riasec`/`mi` is ever populated — an empty `riasec` on a junior means
   *  "different instrument", not "no data". */
  mi: Record<string, number> | null;
  big_five: Record<string, number> | null;
}

/** Whole-table counts, none of which can be derived from one page of the
 *  users list. `completed_diagnostics`/`abandoned_diagnostics` count
 *  ASSESSMENTS (one user can start several); `total`/`signups_last_7d` count
 *  users. */
export interface AdminUserStats {
  total: number;
  signups_last_7d: number;
  completed_diagnostics: number;
  abandoned_diagnostics: number;
  /** Echoed back from the request: "abandoned" is a judgement about a
   *  threshold, so the number on screen has to say which one produced it. */
  inactive_days_threshold: number;
}

export interface AdminUserListResponse {
  items: AdminUserListItem[];
  total: number;
  page: number;
  limit: number;
}

export interface AdminAssessmentSummary {
  id: string;
  goal: AssessmentGoal;
  status: AssessmentStatus;
  answered_count: number;
  total_questions: number;
  created_at: string;
  completed_at: string | null;
  has_result: boolean;
  has_roadmap: boolean;
}

export interface AdminUserDetail {
  id: string;
  email: string;
  is_verified: boolean;
  is_active: boolean;
  role: UserRole;
  is_admin: boolean;
  created_at: string;
  profile: ProfileResponse | null;
  artifacts: ArtifactItem[];
  assessments: AdminAssessmentSummary[];
}

/** `role: 'student'` is rejected by the endpoint (422) — self-registration
 *  creates students, this only creates staff accounts. */
export type AdminStaffRole = Exclude<UserRole, 'student'>;

export interface AdminUserCreateRequest {
  email: string;
  password: string;
  role: AdminStaffRole;
  /** Defaults to `true` server-side — no verification email is sent, unlike
   *  self-registration. */
  is_verified?: boolean;
}

export interface AdminResponseItem {
  question_id: string;
  instrument: string;
  category: string;
  question_text: string;
  question_order: number;
  answer_value: number;
  selected_answer_text: string;
  created_at: string;
}

/** Один отвеченный триплет блока мотивации.
 *
 *  Ученику показывают три утверждения, он отмечает одно как САМОЕ важное и
 *  одно как НАИМЕНЕЕ важное. Третье он не трогает — оно выводится как
 *  оставшееся и никогда не хранится как отдельный выбор, поэтому у него нет
 *  своего «picked».
 *
 *  Имена полей повторяют ответ API дословно. Раньше тут стояли выдуманные
 *  `most_text` / `least_text` / `neutral_text`, которых сервер не присылает:
 *  тип описывал API неверно, TypeScript поэтому ничего не заметил, а на
 *  экране рендерились подписи без единого утверждения рядом. */
export interface AdminMotivationResponseItem {
  triplet_index: number;
  picked_most_text: string;
  picked_most_category: string;
  picked_least_text: string;
  picked_least_category: string;
  /** Третье утверждение триплета — то, которое ученик НЕ выбрал ни одним из
   *  двух способов. Это вывод, а не его действие. */
  not_picked_text: string;
  not_picked_category: string;
  created_at: string;
}

export interface AdminAssessmentDetail {
  id: string;
  user_id: string;
  user_email: string;
  profile_name: string | null;
  goal: AssessmentGoal;
  status: AssessmentStatus;
  answered_count: number;
  total_questions: number;
  created_at: string;
  completed_at: string | null;
  responses: AdminResponseItem[];
  motivation_responses: AdminMotivationResponseItem[];
  analysis_result: AnalysisResultResponse | null;
  roadmap: RoadmapResponse | null;
}

// ─── Admin feedback (TZ_Profi.md §28.4) ──────────────────────────────────────────

export interface AdminFeedbackListItem {
  id: string;
  user_id: string;
  user_email: string;
  profile_name: string | null;
  assessment_id: string | null;
  age_group: string | null;
  /** Effective scenario A/B/C, see goal_overlay_service — null if the
   *  assessment or its profile no longer exists. */
  scenario: string | null;
  top_direction_name: string | null;
  relevance_score: number;
  helpful_sections: string[];
  comment: string | null;
  created_at: string;
}

export interface AdminFeedbackListResponse {
  items: AdminFeedbackListItem[];
  total: number;
  page: number;
  limit: number;
}

export interface FeedbackBreakdownItem {
  key: string;
  count: number;
  avg_relevance_score: number;
}

/** Aggregates over whatever the same filters as `listFeedback` left — so the
 *  summary above the table describes the rows in it, not the all-time totals. */
export interface AdminFeedbackStatsResponse {
  total: number;
  avg_relevance_score: number | null;
  /** Count per 1–5 score, keyed by the score as a string. An average alone
   *  cannot reconstruct this: 4.0 looks the same whether everyone said 4 or
   *  the room split between 5s and 3s. */
  score_counts: Record<string, number>;
  by_age_group: FeedbackBreakdownItem[];
  by_scenario: FeedbackBreakdownItem[];
  by_top_direction: FeedbackBreakdownItem[];
  helpful_section_counts: Record<string, number>;
  /** Reviews that named no useful section. Not derivable from the counts
   *  above — a review can name several, so they do not sum to a review
   *  count. */
  no_sections_count: number;
}

// ─── Admin: university/program editing (docs/admin-university-editing-api.md) ────

export interface AdminUniversityListItem {
  id: string;
  name: string;
  city: string | null;
  country: string | null;
  ranking: number | null;
  /** The scale the number came from ("#28 (QS World)", "Top-20 (Нац.
   *  рейтинг)"). `ranking` alone mixes a QS world position, a national tier
   *  and a field rank in one column, so the bare number is not comparable
   *  between rows. */
  ranking_label: string | null;
  uniranks_kz_rank: number | null;
  /** "Н/Р" if checked and not found in the ranking; null = not checked yet. */
  uniranks_note: string | null;
  updated_at: string | null;
  programs_count: number;
}

/** One entry of `AdminProgramDetail.grants`.
 *
 *  `name` is the only field every live row has; the other two are optional and
 *  the index signature keeps any key an importer added that this type has not
 *  learned about yet — a read-edit-write pass through the admin must not
 *  silently drop one. */
export interface AdminProgramGrant {
  name: string;
  amount?: string | null;
  conditions?: string | null;
  [key: string]: unknown;
}

/** One option of the country filter, with how many universities it covers.
 *  A page of 20 rows cannot supply the full set of values, so the server
 *  computes it — the screen used to download the whole catalog to count. */
export interface AdminUniversityCountry {
  country: string;
  universities_count: number;
}

export interface AdminUniversityListResponse {
  items: AdminUniversityListItem[];
  total: number;
  page: number;
  limit: number;
}

export interface AdminProgramBrief {
  id: string;
  name: string;
  language: string | null;
  cost_per_year: number | null;
  cost_label: string | null;
}

/** Fields the admin PATCH endpoints accept — see §5/§6 of the API contract. */
export type AdminUniversityUpdateRequest = Partial<{
  name: string;
  short_name: string;
  aliases: string[];
  location: string;
  website: string;
  ranking: number | null;
  ranking_label: string | null;
  uniranks_kz_rank: number | null;
  uniranks_world_rank: number | null;
  uniranks_note: string | null;
  description: string;
  city: string;
  country: string;
  source_url: string;
}>;

export interface AdminUniversityDetail {
  id: string;
  name: string;
  /** Read-only — not part of `AdminUniversityUpdateRequest`. */
  slug: string | null;
  short_name: string | null;
  aliases: string[];
  location: string | null;
  country: string | null;
  city: string | null;
  website: string | null;
  ranking: number | null;
  ranking_label: string | null;
  uniranks_kz_rank: number | null;
  uniranks_world_rank: number | null;
  uniranks_note: string | null;
  description: string | null;
  created_at: string;
  updated_at: string | null;
  source_url: string | null;
  programs: AdminProgramBrief[];
  /** Field names locked against the next automated seed/backfill re-sync. */
  admin_locked_fields: string[];
}

export type AdminProgramUpdateRequest = Partial<{
  name: string;
  language: string;
  cost_per_year: number | null;
  cost_label: string | null;
  description: string | null;
  who_its_for: string | null;
  /** Whole-object replace, not a merge — see §6 of the API contract. */
  requirements: Record<string, unknown>;
  /** Whole-object replace, not a merge — see §6 of the API contract. */
  deadlines: Record<string, unknown>;
  grants: AdminProgramGrant[];
  source_url: string | null;
}>;

export interface AdminProgramDetail {
  id: string;
  university_id: string;
  name: string;
  language: string | null;
  cost_per_year: number | null;
  cost_label: string | null;
  description: string | null;
  who_its_for: string | null;
  requirements: Record<string, unknown>;
  deadlines: Record<string, unknown>;
  grants: AdminProgramGrant[];
  created_at: string;
  updated_at: string | null;
  source_url: string | null;
  university: { id: string; name: string };
  admin_locked_fields: string[];
}

// ─── Admin roles ────────────────────────────────────────────────────────────────
//
// `UserRole` (auth section, `pro-281`) is the source of truth. `/admin/*` still
// gates on `is_admin`; `/psychologist/*` gates on `role === 'psychologist'`.

// ─── Psychologist cabinet ───────────────────────────────────────────────────────

export interface PsychologistStudentListItem {
  id: string;
  email: string;
  profile_name: string | null;
  age_group: AgeGroup | null;
  assigned_at: string;
}

/** Students the psychologist can claim (PRO-337 — no admin in this flow). */
export interface PsychologistAvailableStudentItem {
  id: string;
  email: string;
  profile_name: string | null;
  age_group: AgeGroup | null;
  has_pending_review: boolean;
}

export interface PsychologistAssessmentSummary {
  id: string;
  goal: AssessmentGoal;
  status: AssessmentStatus;
  answered_count: number;
  total_questions: number;
  created_at: string;
  completed_at: string | null;
  has_result: boolean;
  /** `null` while there is no result yet. */
  review_status?: ReviewStatus | null;
  has_roadmap: boolean;
}

/** Separate from `AdminUserDetail` — no `role` / `is_admin` in the payload. */
export interface PsychologistStudentDetail {
  id: string;
  email: string;
  is_verified: boolean;
  is_active: boolean;
  created_at: string;
  profile: ProfileResponse | null;
  artifacts: ArtifactItem[];
  assessments: PsychologistAssessmentSummary[];
}

export interface PsychologistNote {
  id: string;
  psychologist_id: string;
  student_id: string;
  content: string;
  created_at: string;
}

export interface PsychologistNoteWrite {
  content: string;
}

// ─── PRO-338 — specialist report: 6 new tests, never shown on student /result ────
// Mirrors app/schemas/new_tests.py exactly (field-for-field) — every field is
// optional because Ф0.2/Ф0.3 only laid the container/endpoint groundwork; the
// scoring services that populate these land per-test in Фазы 1-3.

// "Почему такой результат" evidence — mirrors app/schemas/new_tests.py's own
// evidence classes, added so the psychologist card can show the student's
// real answers (same idea as InterestMapItemDetails on /result) instead of
// just restating the raw score in a sentence. One shape per answer format.

export interface BinaryAnswerItem {
  text: string;
  answer: 'yes' | 'no';
}

export interface BinaryScaleEvidence {
  answered: number;
  yes: number;
  no: number;
  items: BinaryAnswerItem[];
}

export interface RatedAnswerItem {
  text: string;
  value: number;
}

export interface RatedScaleEvidence {
  answered: number;
  distribution: number[];
  items: RatedAnswerItem[];
}

export interface PairAnswerItem {
  text: string;
  picked: boolean;
}

export interface PairScaleEvidence {
  picked: number;
  total: number;
  items: PairAnswerItem[];
}

export interface SingleItemEvidence {
  text: string;
  value: number;
}

export interface RoleEvidenceItem {
  block: string;
  text: string;
  points: number;
}

export interface RoleEvidence {
  points_by_block: number[];
  items: RoleEvidenceItem[];
}

export interface ProfessionalTypesSection {
  interest_scores: Record<string, number> | null;
  hybrid_profile: string[] | null;
  abilities_scores: Record<string, number> | null;
  interest_evidence: Record<string, PairScaleEvidence> | null;
  abilities_evidence: Record<string, SingleItemEvidence> | null;
}

export interface TeamRoleSection {
  scores: Record<string, number> | null;
  // All 8 role codes sorted by score descending (ties broken server-side by
  // a fixed canonical order) — the Bar Chart (Ф2.7) renders bars in exactly
  // this order, not `scores`' own (unordered) key order.
  ranked_roles: string[] | null;
  dominant_role: string | null;
  supporting_roles: string[] | null;
  avoidance_roles: string[] | null;
  methodological_note: string | null;
  role_evidence: Record<string, RoleEvidence> | null;
}

export interface TemperamentSection {
  extraversion_raw: number | null;
  neuroticism_raw: number | null;
  lie_scale_raw: number | null;
  extraversion_level: string | null;
  neuroticism_level: string | null;
  protocol_flagged: boolean | null;
  // One of choleric/sanguine/phlegmatic/melancholic (Ф1.6) — rendered as
  // the Scatter Plot's 4 quadrants.
  quadrant: string | null;
  extraversion_evidence: BinaryScaleEvidence | null;
  neuroticism_evidence: BinaryScaleEvidence | null;
  lie_scale_evidence: BinaryScaleEvidence | null;
}

export interface IntelligenceSection {
  raw_score: number | null;
  subtest_scores: Record<string, number> | null;
  spn_group: number | null;
  learning_profile: string | null;
  learning_profile_shares: Record<string, number> | null;
  lability_first_half_accuracy: number | null;
  lability_second_half_accuracy: number | null;
  lability_fatigue_signal: boolean | null;
}

export interface AspirationLevelSection {
  score: number | null;
  level: string | null;
  evidence: BinaryScaleEvidence | null;
}

export interface EmpathyConfidenceSection {
  empathy_channels: Record<string, number> | null;
  empathy_total: number | null;
  empathy_level: string | null;
  confidence_stens: number | null;
  confidence_level: string | null;
  empathy_evidence: Record<string, BinaryScaleEvidence> | null;
  confidence_evidence: RatedScaleEvidence | null;
}

export interface NewTestsSections {
  professional_types: ProfessionalTypesSection | null;
  team_role: TeamRoleSection | null;
  temperament: TemperamentSection | null;
  intelligence: IntelligenceSection | null;
  aspiration_level: AspirationLevelSection | null;
  empathy_confidence: EmpathyConfidenceSection | null;
}

// ─── Psychologist-view AI analysis ──────────────────────────────────────────

export interface PsychBlockAnalysisItem {
  block: string;
  text: string;
}

export interface PsychProfessionRecommendation {
  slug: string;
  name: string;
  reasoning: string;
}

/** Per-block AI commentary + a final synthesis + one profession picked from
 * `report.careers` (never invented — enforced server-side, see
 * app/services/psych_ai_analysis_validator.py). Lazily generated on first
 * report view and cached; `null` when the LLM is disabled, generation
 * failed, or there's no data yet to analyze. */
export interface PsychAiAnalysis {
  block_analyses: PsychBlockAnalysisItem[];
  final_summary: string;
  recommended_profession: PsychProfessionRecommendation | null;
}

/** GET /psychologist/students/{studentId}/assessments/{assessmentId}/report —
 * `report` is the exact same shape the student's own /result returns
 * (reused, not duplicated), `new_tests` is specialist-only. */
export interface PsychologistReportResponse {
  report: ResultResponse;
  new_tests: NewTestsSections;
  ai_analysis: PsychAiAnalysis | null;
}

// ─── Extended block assignments (Belbin/АСТУР — post-Ф4.1 follow-up) ────────────
// A psychologist's decision to make Belbin/АСТУР available to a student for
// one assessment; the student's own UI (not the psychologist's) uses this to
// discover and launch the block, instead of a hand-delivered link.

export type ExtendedBlock = 'belbin' | 'astur';

export interface ExtendedBlockAssignment {
  block: ExtendedBlock;
  assigned_at: string;
  /** Derived from whether a belbin_runs/astur_runs row exists (and, for
   *  АСТУР, is fully answered) — never a separate stored flag. */
  completed: boolean;
}

export interface ExtendedBlocksResponse {
  assignments: ExtendedBlockAssignment[];
}

export interface AssignExtendedBlockPayload {
  block: ExtendedBlock;
}

// ─── Psychologist report review (PRO-337) ───────────────────────────────────────
//
// docs/psychologist-review-frontend-plan.md. A fresh report is hidden from the
// student until the assigned psychologist publishes it. `ResultPendingReview`
// must match the backend's `ResultPendingReviewResponse` field for field.

export type ReviewStatus = 'pending_review' | 'published';

/** What `GET`/`POST /result` return while the report still waits for review. */
export interface ResultPendingReview {
  status: 'pending_review';
  assessment_id: string;
}

export interface PsychologistReviewQueueItem {
  assessment_id: string;
  student_id: string;
  student_name: string | null;
  student_email: string;
  age_group: AgeGroup | null;
  goal: AssessmentGoal;
  generated_at: string;
  reviewed_at: string | null;
}

export interface PsychologistReviewCard {
  title: string;
  description: string;
}

/** Stored career match — the backend validates this exact shape on PATCH. */
export interface PsychologistReviewCareer {
  slug: string;
  name: string;
  holland_code: string;
  match_score: number;
  description: string;
  professions: string[];
  skills_needed: string[];
  subjects_to_develop: string[];
  first_steps: string[];
}

export interface PsychologistResultDetail {
  assessment_id: string;
  review_status: ReviewStatus;
  reviewed_by: string | null;
  reviewed_at: string | null;
  published_by: string | null;
  published_at: string | null;
  summary: string;
  careers: PsychologistReviewCareer[];
  strengths: string[];
  weaknesses: string[];
  development_plan: { reinforce: string[]; compensate: string[] };
  big_five: Record<string, number>;
  thinking_style: Record<string, number>;
  strength_cards: PsychologistReviewCard[];
  thinking_style_notes: PsychologistReviewCard[];
  final_analysis: string;
  personality_notes: Record<string, string>;
  motivation_highlights: string[];
  created_at: string;
}

export type PsychologistResultPatch = Partial<
  Pick<
    PsychologistResultDetail,
    | 'summary'
    | 'careers'
    | 'strengths'
    | 'weaknesses'
    | 'strength_cards'
    | 'thinking_style_notes'
    | 'final_analysis'
    | 'personality_notes'
    | 'motivation_highlights'
  >
>;

// ─── Profile — parent access & attempt history ──────────────────────────────────
//
// NOTE (backend gap, found 2026-08-15 auditing `/profile`): there is no `/parent`
// route anywhere in `src/app/router.tsx`, no parent-access-request endpoint in
// `src/shared/api/`, and no "СВЯЗЬ РОДИТЕЛЬ — РЕБЁНОК" block in
// `AdminUserDetailPage.tsx`. The types below give `/profile`'s senior-variant
// "ДОСТУП РОДИТЕЛЯ" section a real contract to render a genuine pending request
// against; callers must never construct a fake `ParentAccessRequest` — render
// nothing (or a static, non-per-request explainer) until a backend endpoint
// exists to source one from.

export type ParentAccessRequestStatus = 'pending' | 'approved' | 'declined';

export interface ParentAccessRequest {
  id: string;
  parent_name: string;
  requested_at: string;
  status: ParentAccessRequestStatus;
  /** Whether real approve/decline endpoints exist yet (currently always false). */
  can_respond: boolean;
}

/**
 * One past assessment attempt, for the "ИСТОРИЯ ПРОХОЖДЕНИЙ" timeline.
 *
 * NOTE (backend gap): there is no assessment-history-list endpoint anywhere in
 * `src/shared/api/` — `useAssessmentStore` only ever tracks the single
 * current/most-recent run (restarting overwrites it), so a plural "history" of
 * past attempts cannot be honestly derived from any state this app has today.
 * This shape exists so the attempt-history UI has a real contract; render a
 * genuine empty state until a backend list endpoint exists — never fabricate rows.
 */
export interface AttemptHistoryEntry {
  id: string;
  completed_at: string;
  instrument: Instrument;
  goal: AssessmentGoal;
  /** e.g. "Полная диагностика · 60 вопросов" — pre-formatted by the backend. */
  description: string;
}

// ─── Admin: question-bank content editing (docs/admin-questions-content-overrides-plan.md) ─

/** One admin edit to a bank-seeded field, alongside what it replaced.
 *
 *  `bank_value` is what the content bank held when the field was first
 *  edited, so the UI can show "было / стало" and offer a revert. Read
 *  `bank_value_known` before showing it: JSON cannot distinguish an absent
 *  key from a null one, and several overridable columns (`icon`,
 *  `short_text`, `frame`) are themselves nullable — so a `null` bank_value
 *  with the flag set means "the bank really had nothing here", while the
 *  flag being false means the original was never recorded (every override
 *  written before PRO-262). */
export interface AdminFieldOverride {
  value: unknown;
  bank_value: unknown;
  bank_value_known: boolean;
}

export type AdminOverrides = Record<string, AdminFieldOverride>;

/** `?sort=&order=` accepted by every admin list. The set of valid `sort`
 *  values is per endpoint — an unknown one is a 422 naming the allowed set,
 *  never a silently ignored request. */
export interface AdminSortParams {
  sort?: string;
  order?: 'asc' | 'desc';
}

export type QuestionKeyed = 'plus' | 'minus';

export interface AdminQuestionListItem {
  id: string;
  instrument: Instrument;
  /** Resolved to `ru` by the backend — the admin panel itself stays ru-only
   *  (i18n-contract §2); edit both languages from the detail screen. */
  text: string;
  order: number;
  age_tier: AgeGroup;
  riasec_type: HollandType | null;
  bigfive_domain: BigFiveDomain | null;
  mi_category: MIType | null;
  has_overrides: boolean;
}

export interface AdminQuestionListResponse {
  items: AdminQuestionListItem[];
  total: number;
  page: number;
  limit: number;
}

export interface AdminQuestionDetail {
  id: string;
  instrument: Instrument;
  riasec_type: HollandType | null;
  bigfive_domain: BigFiveDomain | null;
  mi_category: MIType | null;
  facet: string | null;
  keyed: QuestionKeyed | null;
  /** One row per question now — both languages live on this one row as a
   *  `{"ru": ..., "kk": ...}` map. A missing key means untranslated, not "". */
  text: Partial<Record<Locale, string>>;
  short_text: Partial<Record<Locale, string>> | null;
  icon: string | null;
  /** Read-only — structural, not part of `AdminQuestionUpdateRequest`. */
  order: number;
  age_tier: AgeGroup;
  /** Field name → overridden value; for a localized field (`text`/
   *  `short_text`) the value is itself a `{locale: value}` map — only the
   *  edited locale's key is present, so overriding kk never locks ru.
   *  Presence of a key both locks the field and protects the whole row from
   *  bank-reorg deletion (see the content contract's §3 — unlike university's
   *  `admin_locked_fields: string[]`, this dict is self-contained and IS the
   *  edited value). */
  overrides: AdminOverrides;
}

export type AdminQuestionUpdateRequest = Partial<{
  /** Required whenever `text`/`short_text` is present — which language is
   *  being edited. Ignored for a patch that only touches structural fields. */
  locale: Locale;
  riasec_type: HollandType | null;
  bigfive_domain: BigFiveDomain | null;
  mi_category: MIType | null;
  facet: string | null;
  keyed: QuestionKeyed | null;
  /** The value for `locale` only — the other language's text is untouched. */
  text: string;
  age_tier: AgeGroup;
  short_text: string | null;
  icon: string | null;
}>;

export interface AdminQuestionPairListItem {
  id: string;
  instrument: Instrument;
  age_tier: AgeGroup;
  pair_index: number;
  /** Short scenario intro shown above the pair; null for junior. */
  frame: string | null;
  /** The **effective** option texts — what the student actually sees, with
   *  the pair's override resolved against the linked question's
   *  short_text/text. Never null, unlike the raw override columns of the same
   *  name on `AdminQuestionPairDetail`. Never prefill an editing form from
   *  these: saving a displayed fallback would turn it into a real override. */
  option_a_text: string;
  option_b_text: string;
  has_overrides: boolean;
}

export interface AdminQuestionPairListResponse {
  items: AdminQuestionPairListItem[];
  total: number;
  page: number;
  limit: number;
}

export interface AdminQuestionPairDetail {
  id: string;
  instrument: Instrument;
  age_tier: AgeGroup;
  pair_index: number;
  /** Read-only — which two Question rows form the pair is a structural edit,
   *  out of scope for this API. */
  question_a_id: string;
  question_b_id: string;
  /** One row per pair now — see `AdminQuestionDetail.text`. A missing key
   *  (or a `null` map) means "no override for this language" — falls back to
   *  the linked Question's short_text/text on read. The fallback is also
   *  inlined below as `question_a`/`question_b`, so the form can show it
   *  without a second request per option. */
  frame: Partial<Record<Locale, string>> | null;
  option_a_text: Partial<Record<Locale, string>> | null;
  option_b_text: Partial<Record<Locale, string>> | null;
  option_a_icon: string | null;
  option_b_icon: string | null;
  question_a: AdminLinkedQuestion | null;
  question_b: AdminLinkedQuestion | null;
  overrides: AdminOverrides;
}

/** The Question one side of a pair points at — the fallback an empty
 *  override resolves to. */
export interface AdminLinkedQuestion {
  id: string;
  text: string;
  short_text: string | null;
  icon: string | null;
}

export type AdminQuestionPairUpdateRequest = Partial<{
  /** Required whenever `frame`/`option_a_text`/`option_b_text` is present. */
  locale: Locale;
  frame: string | null;
  option_a_text: string | null;
  option_b_text: string | null;
  option_a_icon: string | null;
  option_b_icon: string | null;
}>;

export interface AdminMotivationStatementListItem {
  id: string;
  triplet_index: number;
  order: number;
  category: MotivationCategory;
  /** Resolved to `ru` by the backend — see `AdminQuestionListItem.text`. */
  text: string;
  has_overrides: boolean;
}

export interface AdminMotivationStatementListResponse {
  items: AdminMotivationStatementListItem[];
  total: number;
  page: number;
  limit: number;
}

export interface AdminMotivationStatementDetail {
  id: string;
  triplet_index: number;
  order: number;
  category: MotivationCategory;
  text: Partial<Record<Locale, string>>;
  /** null = the senior `text` is reused for junior too, in every language. */
  text_junior: Partial<Record<Locale, string>> | null;
  overrides: AdminOverrides;
}

export type AdminMotivationStatementUpdateRequest = Partial<{
  /** Required whenever `text`/`text_junior` is present. */
  locale: Locale;
  category: MotivationCategory;
  text: string;
  text_junior: string | null;
}>;

export interface AdminMotivationPairListItem {
  id: string;
  pair_index: number;
  /** Both sides are poles of the SAME category, so these two are always
   *  equal and identify nothing — `text_a`/`text_b` are what tells two rows
   *  apart. */
  category_a: MotivationCategory;
  category_b: MotivationCategory;
  text_a: string;
  text_b: string;
  has_overrides: boolean;
}

export interface AdminMotivationPairListResponse {
  items: AdminMotivationPairListItem[];
  total: number;
  page: number;
  limit: number;
}

export interface AdminMotivationPairDetail {
  id: string;
  pair_index: number;
  /** Always equal — both sides are the SAME category, `text_a` its positive
   *  pole and `text_b` its negative pole (not two different categories). */
  category_a: MotivationCategory;
  category_b: MotivationCategory;
  text_a: Partial<Record<Locale, string>>;
  text_b: Partial<Record<Locale, string>>;
  overrides: AdminOverrides;
}

export type AdminMotivationPairUpdateRequest = Partial<{
  /** Required whenever `text_a`/`text_b` is present. */
  locale: Locale;
  category_a: MotivationCategory;
  category_b: MotivationCategory;
  text_a: string;
  text_b: string;
}>;

export interface AdminDirectionListItem {
  id: string;
  /** Resolved to `ru` by the backend — see `AdminQuestionListItem.text`. */
  name: string;
  slug: string;
  holland_code: string;
  programs_count: number;
  /** True only when every descriptive field is filled. */
  catalog_filled: boolean;
  /** Which of description/professions/skills_needed/subjects_to_develop/
   *  first_steps are still empty on this row — a list rather than a flag
   *  because `professions` is empty on every direction, so a bare
   *  `catalog_filled` would read false everywhere and say nothing. */
  empty_catalog_fields: string[];
  has_overrides: boolean;
}

export interface AdminDirectionListResponse {
  items: AdminDirectionListItem[];
  total: number;
  page: number;
  limit: number;
}

/** A program mapped to a direction through `program_directions` — the
 *  mapping that drives career matching, invisible from the admin until now. */
export interface AdminDirectionProgram {
  id: string;
  name: string;
  university_id: string;
  university_name: string;
}

export interface AdminDirectionDetail {
  id: string;
  name: Partial<Record<Locale, string>>;
  /** Read-only — generated once from `name.ru` by the seed script, does not
   *  re-derive if `name` is edited afterward (expected drift, not a bug). */
  slug: string;
  holland_code: string;
  description: Partial<Record<Locale, string>>;
  /** Empty on **all 92** directions as of 2026-09 — measured, not estimated.
   *  Every other catalog field (description, skills, subjects, first steps) is
   *  filled everywhere. `Direction.professions` feeds the student's report and
   *  the LLM context for the direction inquiry and roadmap, so all three get an
   *  empty list today — see docs/admin-backend-requests-pro-242.md §13. */
  professions: Partial<Record<Locale, string[]>>;
  skills_needed: Partial<Record<Locale, string[]>>;
  subjects_to_develop: Partial<Record<Locale, string[]>>;
  first_steps: Partial<Record<Locale, string[]>>;
  /** Программы вузов, привязанные к направлению через program_directions.
   *  Именно эта связь решает, попадёт ли направление в подбор ученику, а из
   *  админки её раньше не было видно вообще. */
  programs: AdminDirectionProgram[];
  overrides: AdminOverrides;
}

export type AdminDirectionUpdateRequest = Partial<{
  /** Required whenever `name`/`description`/`professions`/`skills_needed`/
   *  `subjects_to_develop`/`first_steps` is present. `holland_code` is the
   *  only structural (non-localized) field here — needs no `locale`. */
  locale: Locale;
  name: string;
  holland_code: string;
  description: string;
  professions: string[];
  skills_needed: string[];
  subjects_to_develop: string[];
  first_steps: string[];
}>;
