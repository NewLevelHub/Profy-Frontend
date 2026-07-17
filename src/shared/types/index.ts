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
  description: string;
}

export interface RevealResponse {
  type: 'reveal';
  status: 'single' | 'cluster' | 'inconclusive';
  leaves: RevealLeaf[];
  backups: RevealLeaf[];
  message: string;
  /** Only populated for status='inconclusive' — friendly axis-strength labels. */
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

export interface ResultAxisHighlight {
  code: string;
  label_ru: string;
  direction_value: number;
}

/** A summed axis score from the child's own answers across the whole
 * session — distinct from ResultAxisHighlight, which describes the
 * profession's own axis profile, not what the child actually answered. */
export interface ChildAxisSignal {
  code: string;
  label_ru: string;
  score: number;
}

export interface AkinatorResultResponse {
  assessment_id: string;
  direction_slug: string;
  direction_name: string;
  direction_description: string;
  message: string;
  matched_axes: ResultAxisHighlight[];
  strengths: ChildAxisSignal[];
  growth_areas: ChildAxisSignal[];
  backups: RevealLeaf[];
  created_at: string;
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

export interface UniversityBrief {
  id: string;
  name: string;
  country: string;
  city: string;
  website: string | null;
  ranking: number | null;
}

export interface ProgramBrief {
  id: string;
  name: string;
  direction_slug: string;
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
