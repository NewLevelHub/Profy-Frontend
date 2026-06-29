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
    questions: (assessmentId: string, block: string) =>
      `/assessment/${assessmentId}/questions/${block}`,
    answers: (assessmentId: string) => `/assessment/${assessmentId}/answers`,
  },
  result: {
    generate: '/result/generate',
    get: (assessmentId: string) => `/result/${assessmentId}`,
  },
  roadmap: {
    generate: '/roadmap/generate',
    get: (assessmentId: string) => `/roadmap/${assessmentId}`,
  },
  universities: {
    programs: '/universities/programs',
    programDetail: (id: string) => `/universities/programs/${id}`,
    gapAnalysis: (programId: string) => `/universities/programs/${programId}/gap-analysis`,
  },
} as const;
