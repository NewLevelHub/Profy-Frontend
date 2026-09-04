/** The five question-bank content types, as they appear in admin URLs. */
export type AdminContentResource =
  | 'questions'
  | 'question-pairs'
  | 'motivation-statements'
  | 'motivation-pairs'
  | 'directions';

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
    userStats: '/admin/users/stats',
    usersExport: '/admin/users/export',
    userDetail: (id: string) => `/admin/users/${id}`,
    assessmentDetail: (id: string) => `/admin/assessments/${id}`,
    assessmentExport: (id: string) => `/admin/assessments/${id}/export`,
    feedback: '/admin/feedback',
    feedbackStats: '/admin/feedback/stats',
    universities: '/admin/universities',
    universityDetail: (id: string) => `/admin/universities/${id}`,
    programDetail: (id: string) => `/admin/programs/${id}`,
    questions: '/admin/questions',
    questionDetail: (id: string) => `/admin/questions/${id}`,
    questionPairs: '/admin/question-pairs',
    questionPairDetail: (id: string) => `/admin/question-pairs/${id}`,
    motivationStatements: '/admin/motivation-statements',
    motivationStatementDetail: (id: string) => `/admin/motivation-statements/${id}`,
    motivationPairs: '/admin/motivation-pairs',
    motivationPairDetail: (id: string) => `/admin/motivation-pairs/${id}`,
    directions: '/admin/directions',
    directionDetail: (id: string) => `/admin/directions/${id}`,

    // Undoing an admin edit. Clearing an override restores the bank value
    // recorded when the field was first edited; a university/program lock
    // stores only the field name, so unlocking returns the field to the next
    // seed run's control rather than restoring anything.
    contentOverrides: (resource: AdminContentResource, id: string) =>
      `/admin/${resource}/${id}/overrides`,
    contentOverrideField: (resource: AdminContentResource, id: string, field: string) =>
      `/admin/${resource}/${id}/overrides/${encodeURIComponent(field)}`,
    universityLocks: (id: string) => `/admin/universities/${id}/locks`,
    universityLockField: (id: string, field: string) =>
      `/admin/universities/${id}/locks/${encodeURIComponent(field)}`,
    programLocks: (id: string) => `/admin/programs/${id}/locks`,
    programLockField: (id: string, field: string) =>
      `/admin/programs/${id}/locks/${encodeURIComponent(field)}`,
  },
} as const;
