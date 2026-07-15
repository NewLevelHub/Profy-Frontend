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
    akinatorStart: (assessmentId: string) => `/assessment/${assessmentId}/akinator/start`,
    akinatorAnswer: (assessmentId: string) => `/assessment/${assessmentId}/akinator/answer`,
    akinatorFeedback: (assessmentId: string) => `/assessment/${assessmentId}/akinator/feedback`,
    akinatorReject: (assessmentId: string, slug: string) => `/assessment/${assessmentId}/akinator/reject/${slug}`,
    akinatorResolve: (assessmentId: string) => `/assessment/${assessmentId}/akinator/resolve`,
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
