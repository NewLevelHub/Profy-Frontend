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
  image_url: string | null;
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
  language: string;
  cost_per_year: number | null;
  cost_label: string | null;
  description: string | null;
  university: UniversityBrief;
  cost_currency: string | null;
  cost_per_year_min: number | null;
  cost_per_year_max: number | null;
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
// NOTE (backend gap): the API has no admin role concept — `User.is_admin` /
// `AdminUserListItem.is_admin` / `AdminUserDetail.is_admin` are plain booleans,
// with no `role` field anywhere in the response shape.
//
// A frontend-only `AdminRole` used to exist here, deriving "Оператор" from
// `is_admin === false`. It was removed in PRO-242: `RequireAdmin` only lets
// `is_admin` users into `/admin/*`, so the operator state was unreachable and
// the role badge always read "Администратор". Rendering a permission tier the
// server does not enforce is UI theatre — see
// docs/admin-backend-requests-pro-242.md §9 for what a real role would need.

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
  text: string;
  short_text: string | null;
  icon: string | null;
  /** Read-only — structural, not part of `AdminQuestionUpdateRequest`. */
  order: number;
  age_tier: AgeGroup;
  /** Field name → overridden value. Presence of a key both locks the field
   *  and protects the whole row from bank-reorg deletion (see the content
   *  contract's §3 — unlike university's `admin_locked_fields: string[]`,
   *  this dict is self-contained and IS the edited value). */
  overrides: AdminOverrides;
}

export type AdminQuestionUpdateRequest = Partial<{
  riasec_type: HollandType | null;
  bigfive_domain: BigFiveDomain | null;
  mi_category: MIType | null;
  facet: string | null;
  keyed: QuestionKeyed | null;
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
  frame: string | null;
  /** null = fall back to the linked Question's short_text/text on read.
   *  The fallback the null resolves to is inlined below as
   *  `question_a`/`question_b`, so the form can show it without a second
   *  request per option. */
  option_a_text: string | null;
  option_b_text: string | null;
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
  text: string;
  /** null = the senior `text` is reused for junior too. */
  text_junior: string | null;
  overrides: AdminOverrides;
}

export type AdminMotivationStatementUpdateRequest = Partial<{
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
  text_a: string;
  text_b: string;
  overrides: AdminOverrides;
}

export type AdminMotivationPairUpdateRequest = Partial<{
  category_a: MotivationCategory;
  category_b: MotivationCategory;
  text_a: string;
  text_b: string;
}>;

export interface AdminDirectionListItem {
  id: string;
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
  name: string;
  /** Read-only — generated once from `name` by the seed script, does not
   *  re-derive if `name` is edited afterward (expected drift, not a bug). */
  slug: string;
  holland_code: string;
  description: string;
  /** Empty on **all 92** directions as of 2026-09 — measured, not estimated.
   *  Every other catalog field (description, skills, subjects, first steps) is
   *  filled everywhere. `Direction.professions` feeds the student's report and
   *  the LLM context for the direction inquiry and roadmap, so all three get an
   *  empty list today — see docs/admin-backend-requests-pro-242.md §13. */
  professions: string[];
  skills_needed: string[];
  subjects_to_develop: string[];
  first_steps: string[];
  /** Программы вузов, привязанные к направлению через program_directions.
   *  Именно эта связь решает, попадёт ли направление в подбор ученику, а из
   *  админки её раньше не было видно вообще. */
  programs: AdminDirectionProgram[];
  overrides: AdminOverrides;
}

export type AdminDirectionUpdateRequest = Partial<{
  name: string;
  holland_code: string;
  description: string;
  professions: string[];
  skills_needed: string[];
  subjects_to_develop: string[];
  first_steps: string[];
}>;
