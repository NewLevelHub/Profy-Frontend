export const API = {
  auth: {
    me: '/auth/me',
    register: '/auth/register',
    login: '/auth/login',
    google: '/auth/google',
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
    certificates: '/profile/certificates',
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
    feedback: '/result/feedback',
  },
  roadmap: {
    generate: '/roadmap/generate',
    get: (assessmentId: string) => `/roadmap/${assessmentId}`,
    generateDirection: '/roadmap/direction',
    getDirection: (assessmentId: string, slug: string) =>
      `/roadmap/${assessmentId}/directions/${slug}`,
  },
  developmentPlan: {
    generate: '/development-plan',
    get: (assessmentId: string, programId: string) =>
      `/development-plan/${assessmentId}/${programId}`,
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
  admin: {
    users: '/admin/users',
    userDetail: (id: string) => `/admin/users/${id}`,
    assessmentDetail: (id: string) => `/admin/assessments/${id}`,
    feedback: '/admin/feedback',
    feedbackStats: '/admin/feedback/stats',
  },
} as const;
