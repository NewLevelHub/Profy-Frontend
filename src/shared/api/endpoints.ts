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
    updateGoal: (assessmentId: string) => `/assessment/${assessmentId}/goal`,
  },
  result: {
    generate: '/result/generate',
    get: (assessmentId: string) => `/result/${assessmentId}`,
    goalContext: (assessmentId: string) => `/result/${assessmentId}/goal-context`,
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
    gapAnalysis: (programId: string) => `/universities/programs/${programId}/gap-analysis`,
  },
  inquiry: {
    questions: (assessmentId: string, slug: string) =>
      `/inquiry/${assessmentId}/directions/${slug}/questions`,
    verdict: (assessmentId: string, slug: string) =>
      `/inquiry/${assessmentId}/directions/${slug}/verdict`,
  },
  admin: {
    users: '/admin/users',
    userDetail: (id: string) => `/admin/users/${id}`,
    assessmentDetail: (id: string) => `/admin/assessments/${id}`,
  },
} as const;
