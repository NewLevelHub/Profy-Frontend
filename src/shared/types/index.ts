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

export type HollandType = 'R' | 'I' | 'A' | 'S' | 'E' | 'C';
export type Instrument = 'riasec' | 'big_five';
export type BigFiveDomain = 'N' | 'E' | 'O' | 'A' | 'C';

export interface AssessmentResponse {
  id: string;
  goal: AssessmentGoal;
  status: AssessmentStatus;
  answered_count: number;
  total_questions: number;
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
  aversion: Record<HollandType, number>;
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

export interface AnalysisResultResponse {
  id: string;
  assessment_id: string;
  profile: Record<HollandType, number>;
  code: HollandType[];
  meta: RiasecMeta;
  careers: CareerMatch[];
  strengths: HollandType[];
  weaknesses: HollandType[];
  development_plan: DevelopmentPlan;
  big_five: Record<BigFiveDomain, number>;
  thinking_style: ThinkingStyle;
  personality_highlights: string[];
  summary: string;
  created_at: string;
}

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
  analysis_result: AnalysisResultResponse | null;
  roadmap: RoadmapResponse | null;
}
