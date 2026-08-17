export const API = {
  auth: {
    me: '/auth/me',
    register: '/auth/register',
    login: '/auth/login',
    verifyEmail: '/auth/verify-email',
    resendVerification: '/auth/resend-verification',
    forgotPassword: '/auth/forgot-password',
    verifyResetCode: '/auth/verify-reset-code',
    resetPassword: '/auth/reset-password',
  },
  profile: {
    get: '/profile',
    create: '/profile',
    update: '/profile',
    artifacts: '/profile/artifacts',
  },
  assessment: {
    start: '/assessment/start',
    current: '/assessment/current',
    questions: (assessmentId: string) => `/assessment/${assessmentId}/questions`,
    answers: (assessmentId: string) => `/assessment/${assessmentId}/answers`,
    motivationTriplets: (assessmentId: string) => `/assessment/${assessmentId}/motivation-triplets`,
    motivationAnswers: (assessmentId: string) => `/assessment/${assessmentId}/motivation-answers`,
    motivationPairs: (assessmentId: string) => `/assessment/${assessmentId}/motivation-pairs`,
    motivationPairAnswers: (assessmentId: string) => `/assessment/${assessmentId}/motivation-pair-answers`,
    pairs: (assessmentId: string) => `/assessment/${assessmentId}/pairs`,
    pairAnswers: (assessmentId: string) => `/assessment/${assessmentId}/pair-answers`,
  },
  result: {
    generate: '/result/generate',
    get: (assessmentId: string) => `/result/${assessmentId}`,
  },
  roadmap: {
    generate: '/roadmap/generate',
    get: (assessmentId: string) => `/roadmap/${assessmentId}`,
    generateDirection: '/roadmap/direction',
    getDirection: (assessmentId: string, slug: string) =>
      `/roadmap/${assessmentId}/directions/${slug}`,
  },
  universities: {
    programs: '/universities/programs',
    programDetail: (id: string) => `/universities/programs/${id}`,
  },
  inquiry: {
    questions: (assessmentId: string, slug: string) =>
      `/inquiry/${assessmentId}/directions/${slug}/questions`,
    verdict: (assessmentId: string, slug: string) =>
      `/inquiry/${assessmentId}/directions/${slug}/verdict`,
  },
  // No feedback-submission endpoint exists yet anywhere in this API surface
  // (grepped the whole `src/shared/api/` tree — nothing named feedback/
  // survey/nps). This path is proposed, not confirmed against the backend;
  // see FeedbackSection.tsx / feedback.ts for how the UI surfaces a real
  // failure instead of silently succeeding until a backend route exists.
  results: {
    feedback: '/results/feedback',
  },
  admin: {
    users: '/admin/users',
    userDetail: (id: string) => `/admin/users/${id}`,
    assessmentDetail: (id: string) => `/admin/assessments/${id}`,
  },
} as const;
