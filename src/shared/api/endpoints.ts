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
  directions: {
    list: '/directions',
    tree: '/directions/tree',
    detail: (slug: string) => `/directions/${slug}`,
  },
  assessment: {
    start: '/assessment/start',
    current: '/assessment/current',
    questions: (assessmentId: string, block: string) =>
      `/assessment/${assessmentId}/questions/${block}`,
    answers: (assessmentId: string) => `/assessment/${assessmentId}/answers`,
    akinatorStart: (assessmentId: string) => `/assessment/${assessmentId}/akinator/start`,
    akinatorAnswer: (assessmentId: string) => `/assessment/${assessmentId}/akinator/answer`,
    akinatorBack: (assessmentId: string) => `/assessment/${assessmentId}/akinator/back`,
    akinatorFeedback: (assessmentId: string) => `/assessment/${assessmentId}/akinator/feedback`,
    akinatorRejectAll: (assessmentId: string) => `/assessment/${assessmentId}/akinator/reject-all`,
    simulation: (assessmentId: string, leafSlug: string) =>
      `/assessment/${assessmentId}/simulation/${leafSlug}`,
    simulationSubmit: (assessmentId: string, leafSlug: string) =>
      `/assessment/${assessmentId}/simulation/${leafSlug}/submit`,
  },
  result: {
    get: (assessmentId: string) => `/result/${assessmentId}`,
  },
  roadmap: {
    generateDirection: '/roadmap/direction',
    getDirection: (assessmentId: string, slug: string) =>
      `/roadmap/${assessmentId}/directions/${slug}`,
  },
  subjectReadiness: {
    questions: (assessmentId: string) => `/subject-readiness/${assessmentId}/questions`,
    submit: (assessmentId: string) => `/subject-readiness/${assessmentId}/answers`,
    result: (assessmentId: string) => `/subject-readiness/${assessmentId}/result`,
  },
  universities: {
    programs: '/universities/programs',
    programDetail: (id: string) => `/universities/programs/${id}`,
    gapAnalysis: (programId: string) => `/universities/programs/${programId}/gap-analysis`,
  },
  admin: {
    users: '/admin/users',
    userDetail: (id: string) => `/admin/users/${id}`,
    assessmentDetail: (id: string) => `/admin/assessments/${id}`,
  },
} as const;
