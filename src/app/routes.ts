// ─── Central route config ───────────────────────────────────────────────────
//
// Single source of truth for the app's client-side paths. Two parallel
// shapes:
//  - ROUTES: string constants (static paths) and builder functions (dynamic
//    paths) that always return a concrete, already-encoded href — this is
//    what every navigate()/<Link>/<NavLink> in the app should go through.
//  - ROUTE_PATTERNS: the same dynamic paths as react-router's ":param"
//    pattern strings — used only by router.tsx to declare route matching.
//    Patterns are a different concern from hrefs (one is a template the
//    router matches against, the other is a value you navigate to), so they
//    stay separate rather than trying to derive one from the other.
//
// Keeping both here means a path never has to be typed out twice in two
// unrelated files and never drifts between the router config and the pages
// that link into it.

export const ROUTES = {
  root: '/',

  // Auth
  login: '/login',
  register: '/register',
  verifyEmail: '/verify-email',
  forgotPassword: '/forgot-password',
  resetPassword: '/reset-password',

  // Onboarding
  welcome: '/welcome',
  onboardingProfile: '/onboarding/profile',
  onboardingArtifacts: '/onboarding/artifacts',

  // Assessment
  assessmentGoal: '/assessment/goal',
  assessment: '/assessment',
  assessmentPraise: '/assessment/praise',
  assessmentLoading: '/assessment/loading',
  knownProfessionSpheres: '/assessment/known-profession',
  knownProfessionList: (sphereSlug: string) =>
    `/assessment/known-profession/${encodeURIComponent(sphereSlug)}`,
  knownProfessionQuiz: (sphereSlug: string, professionSlug: string) =>
    `/assessment/known-profession/${encodeURIComponent(sphereSlug)}/${encodeURIComponent(professionSlug)}`,

  // Main tabs
  home: '/home',
  results: '/results',
  profile: '/profile',

  // Direction detail screens
  subjectReadiness: (slug: string) =>
    `/results/directions/${encodeURIComponent(slug)}/subject-readiness`,
  directionRoadmap: (slug: string) =>
    `/results/directions/${encodeURIComponent(slug)}/roadmap`,
  resultFeedback: (slug: string) =>
    `/results/directions/${encodeURIComponent(slug)}/feedback`,
  universityList: (slug: string) =>
    `/results/directions/${encodeURIComponent(slug)}/universities`,
  programDetail: (slug: string, programId: string) =>
    `/results/directions/${encodeURIComponent(slug)}/universities/${encodeURIComponent(programId)}`,
  gapAnalysis: (slug: string, programId: string) =>
    `/results/directions/${encodeURIComponent(slug)}/universities/${encodeURIComponent(programId)}/gap`,

  // Admin
  admin: '/admin',
  adminUsers: '/admin/users',
  adminUserDetail: (userId: string) => `/admin/users/${encodeURIComponent(userId)}`,
  adminFeedback: '/admin/feedback',
} as const;

/** react-router path patterns — the ":param" DSL, consumed only by router.tsx. */
export const ROUTE_PATTERNS = {
  subjectReadiness: '/results/directions/:slug/subject-readiness',
  knownProfessionList: '/assessment/known-profession/:sphereSlug',
  knownProfessionQuiz: '/assessment/known-profession/:sphereSlug/:professionSlug',
  directionRoadmap: '/results/directions/:slug/roadmap',
  resultFeedback: '/results/directions/:slug/feedback',
  universityList: '/results/directions/:slug/universities',
  programDetail: '/results/directions/:slug/universities/:programId',
  gapAnalysis: '/results/directions/:slug/universities/:programId/gap',
  adminUserDetail: '/admin/users/:userId',
} as const;

// ─── Typed params — mirrors ROUTE_PATTERNS' :placeholders for useParams<T>() ──

// The trailing index signature on each of these isn't part of the actual
// param shape — react-router's useParams<T> requires T to structurally
// satisfy Record<string, string | undefined>, which a plain named interface
// never does (TS only grants object *literals* an implicit index signature,
// not interfaces referenced by name). Without it, every useParams<SlugParams>()
// below fails to typecheck.
export interface SlugParams {
  slug: string;
  [key: string]: string | undefined;
}

export interface SphereSlugParams {
  sphereSlug: string;
  [key: string]: string | undefined;
}

export interface KnownProfessionQuizParams {
  sphereSlug: string;
  professionSlug: string;
  [key: string]: string | undefined;
}

export interface ProgramParams {
  slug: string;
  programId: string;
  [key: string]: string | undefined;
}

export interface AdminUserParams {
  userId: string;
  [key: string]: string | undefined;
}

// ─── Typed location.state — one interface per route that pushes state ────────

export interface LoginState {
  from?: string;
}

export interface GoalSelectionState {
  fromRestart?: boolean;
}

export interface PraiseState {
  title: string;
  subtitle: string;
  nextPath: string;
  completedCount?: number;
  totalBlocks?: number;
  nextBlockName?: string;
  nextBlockEmoji?: string;
}

export interface KnownProfessionQuizState {
  professionName?: string;
  sphereName?: string;
}

export interface DirectionRoadmapState {
  /** Set when arriving straight from the inquiry verdict — start generating at once. */
  generate?: boolean;
}

export interface GapAnalysisState {
  programName?: string;
  universityName?: string;
}
