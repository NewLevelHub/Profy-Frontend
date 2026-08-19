// ─── Auth ──────────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  name?: string;
  is_active?: boolean;
  is_verified?: boolean;
  is_admin?: boolean;
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
}

export interface ProfileResponse extends ProfilePayload {
  id: string;
  user_id: string;
  age_group: AgeGroup;
  /** Always present on the response now, even if `artifacts` wasn't sent
   *  in the request (empty array in that case). */
  artifacts: ArtifactItem[];
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

// ─── Assessment ────────────────────────────────────────────────────────────────

export type AssessmentGoal = 'explore' | 'profession' | 'university';
export type AssessmentStatus = 'in_progress' | 'completed';

export type HollandType = 'R' | 'I' | 'A' | 'S' | 'E' | 'C';
export type Instrument = 'riasec' | 'big_five' | 'mi';
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

// One card per Big Five domain, always exactly 5, same order, for every
// age group/instrument (Big Five is answered identically by all three —
// only the wording differs: junior gets simplified phrasing). Deterministic
// server text, not LLM-generated — see frontend-result-api-contract.md §4.3a.
export interface StudentPersonalityNote {
  trait: PersonalityTrait;
  label: string;
  description: string;
}

export type InterestLevel = 'low' | 'medium' | 'high';

export interface InterestMapItem {
  code: string;
  sphere: string;
  level: InterestLevel;
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
}

export interface MiResultResponse extends ResultResponseBase {
  interest_instrument: 'mi';
  careers: [];
  exploration_activities: string[];
}

export interface RiasecResultResponse extends ResultResponseBase {
  interest_instrument: 'riasec';
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
}

export interface ProgramBrief {
  id: string;
  name: string;
  direction_slug: string;
  language: string;
  cost_per_year: number | null;
  cost_label: string | null;
  description: string | null;
  university: UniversityBrief;
}

export interface ProgramDetail extends ProgramBrief {
  who_its_for: string | null;
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
  is_admin: boolean;
  created_at: string;
  has_profile: boolean;
  profile_name: string | null;
  assessments_count: number;
  latest_assessment_status: AssessmentStatus | null;
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
  is_admin: boolean;
  created_at: string;
  profile: ProfileResponse | null;
  artifacts: ArtifactItem[];
  assessments: AdminAssessmentSummary[];
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

export interface AdminMotivationResponseItem {
  triplet_index: number;
  most_text: string;
  most_category: string;
  least_text: string;
  least_category: string;
  neutral_text: string;
  neutral_category: string;
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

// ─── Admin roles & change-log ───────────────────────────────────────────────────
//
// NOTE (frontend-only gap): the backend has no two-tier admin role concept today —
// `User.is_admin` / `AdminUserListItem.is_admin` / `AdminUserDetail.is_admin` are
// still plain booleans, with no `role` field anywhere in the API response shape.
// `AdminRole` below is a frontend-only type used to render the Operator/Administrator
// distinction from the design spec; see `deriveAdminRole` in `@/shared/lib/adminRole`
// for how it is honestly derived from the existing boolean (never fabricated).

/** Frontend-only role distinction. No third tier — binary by design. */
export type AdminRole = 'operator' | 'administrator';

/**
 * One row of field-level edit history for an admin-editable record.
 *
 * NOTE (backend gap): there is no audit-log / change-history endpoint or type
 * anywhere in the API today (`adminApi` only exposes read GETs). This shape is
 * defined so `ChangeLogTable` has a real contract to render against; callers
 * must source real entries once a backend endpoint exists — never fabricate rows.
 */
export interface ChangeLogEntry {
  id: string;
  /** Machine-readable identifier for the changed field, e.g. `alert-3.status`. */
  field_id: string;
  author: string;
  timestamp: string;
  old_value: string | null;
  new_value: string | null;
  /** Whether a real revert endpoint exists for this entry (currently always false). */
  can_revert: boolean;
}

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
