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
  subjects_like: string[];
  subjects_dislike: string[];
  subjects_easy: string[];
  subjects_hard: string[];
}

export interface ProfileResponse extends ProfilePayload {
  id: string;
  user_id: string;
  age_group: AgeGroup;
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

// ─── Direction taxonomy (spheres + leaf professions) ───────────────────────────

export interface DirectionBrief {
  id: string;
  name: string;
  slug: string;
  description: string;
  is_leaf: boolean;
  parent_id: string | null;
  label_junior: string | null;
  // Concrete job titles this specialty leads to, e.g. software-engineer ->
  // ["Backend-разработчик", ...]. Empty for section nodes.
  professions: string[];
}

export interface DirectionTreeNode {
  id: string;
  name: string;
  slug: string;
  description: string;
  professions: DirectionBrief[];
}

export type AssessmentBlock =
  | 'interests'
  | 'thinking'
  | 'personality'
  | 'motivation'
  | 'academic'
  | 'directions'
  | 'goal_clarification'
  | 'university'
  | 'wellbeing';

export interface AssessmentResponse {
  id: string;
  goal: AssessmentGoal;
  status: AssessmentStatus;
  current_block: number;
  created_at: string;
  is_akinator: boolean;
}

// ── Akinator ───────────────────────────────────────────────────────────────

export interface AkinatorOption {
  index: number;
  text: string;
}

export interface NextQuestionResponse {
  type: 'next_question';
  question_id: string;
  text: string;
  options: AkinatorOption[];
}

export interface RevealLeaf {
  slug: string;
  name: string;
  // Parent section name (e.g. "Медицина и здоровье") — a broader anchor
  // alongside the specific specialty name.
  direction: string;
  description: string;
  // Concrete job titles this specialty leads to, e.g. "Архитектор".
  professions: string[];
}

export interface RevealResponse {
  type: 'reveal';
  status: 'single' | 'cluster' | 'inconclusive';
  leaves: RevealLeaf[];
  backups: RevealLeaf[];
  message: string;
  /** Populated for both cluster reveals (status='cluster' or 'inconclusive')
   * — friendly axis-strength labels explaining what belief still describes.
   * Empty for status='single' (one clear pick, nothing to summarize). */
  strengths: string[];
}

export type AkinatorTurnResponse = NextQuestionResponse | RevealResponse;

export interface AkinatorAnswerRequest {
  question_id: string;
  selected_option_index: number | null;
}

export interface AkinatorFeedbackRequest {
  liked: boolean;
  note?: string | null;
  /** Which leaf was actually accepted (e.g. after a per-leaf simulation) — a
   * backup or non-top cluster peer, not necessarily the engine's favorite. */
  direction_slug?: string | null;
}

export interface AkinatorFeedbackResponse {
  status: 'recorded';
}

export interface AkinatorRejectAllRequest {
  leaf_slugs: string[];
}

// ── Profession simulation (RJP) ───────────────────────────────────────────

export interface SimulationStepOption {
  text: string;
  consequence: string;
}

export interface SimulationStep {
  text: string;
  options: SimulationStepOption[];
}

export interface SimulationDetailResponse {
  leaf_slug: string;
  steps: SimulationStep[];
}

export interface SimulationSubmitRequest {
  accepted: boolean;
  answers: number[];
}

export interface SimulationSubmitResponse {
  status: 'recorded';
  akinator_turn: AkinatorTurnResponse | null;
}

export interface QuestionOption {
  text: string;
  index: number;
}

export interface Question {
  id: string;
  block: AssessmentBlock;
  text: string;
  options: QuestionOption[];
}

export interface AnswerPayload {
  question_id: string;
  selected_option_index: number;
}

export interface SaveAnswersPayload {
  block: AssessmentBlock;
  answers: AnswerPayload[];
}

export interface SaveAnswersResponse {
  block: AssessmentBlock;
  scores: Record<string, number>;
}

// ─── Results ───────────────────────────────────────────────────────────────────

/** Static, non-personalized copy for a growth-area axis — same text
 * regardless of which direction or student it's attached to. */
export interface AxisGrowthExplanation {
  meaning: string;
  suggestion: string;
}

/** One axis compared between the child's own normalized signal and the
 * target direction's needs. `profile_value` is only set when the axis is
 * actually one the direction needs — null when the item came from the
 * whole-session fallback (see AkinatorResultResponse.is_direction_specific).
 * Exactly one of `strength_phrase` (match) / `explanation` (growth) is set. */
export interface AxisComparisonItem {
  code: string;
  label_ru: string;
  profile_value: number | null;
  child_score: number;
  strength_phrase: string | null;
  explanation: AxisGrowthExplanation | null;
}

export interface AkinatorResultResponse {
  assessment_id: string;
  direction_slug: string;
  direction_name: string;
  direction_description: string;
  message: string;
  // Concrete job titles this specialty leads to, e.g. "Архитектор". Empty
  // is possible (not every seeded specialty has one), UI must handle that.
  professions: string[];
  matches: AxisComparisonItem[];
  growth_areas: AxisComparisonItem[];
  /** False when matches/growth_areas fell back to the child's whole-session
   * signal because no axis this direction needs had any real answer signal
   * — the UI must say these aren't direction-specific. */
  is_direction_specific: boolean;
  backups: RevealLeaf[];
  recommended_programs: ProgramBrief[];
  created_at: string;
}

// ─── Direction roadmap ─────────────────────────────────────────────────────────

/**
 * Direction roadmap: two layers. Real, curated/DB-backed facts (profession
 * title list, subject weight, university admission data) plus a thin LLM
 * personalization layer (why/note text, growth_focus, starter_actions
 * fallback). See backend app/services/roadmap_builder.py.
 */
export interface ProfessionOption {
  title: string;
  /** Set only when a real signal singles this one out; null when just listed as an open option. */
  why: string | null;
}

export interface SubjectPriority {
  subject: string;
  /** From Direction.subjects_required — backend-attached, not the model's call. */
  weight: number;
  note: string;
}

export interface GrowthFocus {
  weakness: string;
  why_it_matters: string;
  /** The signal in the student's own answers this was derived from. */
  evidence: string;
}

export interface UniversityRequirement {
  program_name: string;
  university_name: string;
  city: string;
  exams: string[];
  admission_requirements: string[];
  admission_summary: string;
}

export interface DirectionRoadmapResponse {
  id: string;
  assessment_id: string;
  direction_slug: string;
  direction_name: string;
  profession_options: ProfessionOption[];
  subjects_now: SubjectPriority[];
  starter_actions: string[];
  growth_focus: GrowthFocus;
  skills_to_build: string[];
  university_requirements: UniversityRequirement[];
}

// ─── Subject readiness ──────────────────────────────────────────────────────────

export interface SubjectQuestionOption {
  text: string;
  index: number;
}

export interface SubjectQuestion {
  id: string;
  subject: string;
  kind: 'level' | 'interest';
  text: string;
  options: SubjectQuestionOption[];
}

export interface SubjectAnswerPayload {
  question_id: string;
  selected_option_index: number;
}

export interface SubjectScoreItem {
  subject: string;
  level: number;
  interest: number;
  is_strength: boolean;
}

export interface SubjectReadinessResult {
  id: string;
  assessment_id: string;
  direction_slug: string;
  subject_scores: SubjectScoreItem[];
  completed_at: string;
}

// ─── University / Gap-analysis ─────────────────────────────────────────────────

export interface UniversityBrief {
  id: string;
  name: string;
  country: string;
  city: string;
  website: string | null;
  ranking: number | null;
  description?: string | null;
}

export interface ProgramBrief {
  id: string;
  name: string;
  direction_slugs: string[];
  language: string;
  cost_per_year: number | null;
  description: string | null;
  university: UniversityBrief;
}

export interface ProgramDetail extends ProgramBrief {
  who_its_for: string | null;
  career_options: unknown[];
  requirements: Record<string, unknown>;
  deadlines: Record<string, unknown>;
  grants: unknown[];
  created_at: string;
}

export type GapStatus = 'met' | 'not_met' | 'in_progress' | 'unknown';

export interface GapItem {
  requirement: string;
  status: GapStatus;
  comment: string;
}

export interface GapAnalysisResponse {
  program_id: string;
  met: GapItem[];
  not_met: GapItem[];
  in_progress: GapItem[];
  unknown: GapItem[];
  readiness_score: number;
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
  current_block: number;
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
  block: string;
  question_text: string;
  question_order: number;
  selected_option_index: number;
  selected_answer_text: string;
  scores: Record<string, number | string>;
  created_at: string;
}

export interface AdminAssessmentDetail {
  id: string;
  user_id: string;
  user_email: string;
  profile_name: string | null;
  goal: AssessmentGoal;
  status: AssessmentStatus;
  current_block: number;
  created_at: string;
  completed_at: string | null;
  responses: AdminResponseItem[];
}
