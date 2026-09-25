/** The five question-bank content types, as they appear in admin URLs. */
export type AdminContentResource =
  | 'questions'
  | 'question-pairs'
  | 'motivation-statements'
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
    pairs: (assessmentId: string) => `/assessment/${assessmentId}/pairs`,
    pairAnswers: (assessmentId: string) => `/assessment/${assessmentId}/pair-answers`,
    psychoemotionalStart: (assessmentId: string) => `/assessment/${assessmentId}/psychoemotional/start`,
    psychoemotionalFinish: (assessmentId: string, runId: string) =>
      `/assessment/${assessmentId}/psychoemotional/${runId}/finish`,
    belbinContent: '/assessment/belbin/content',
    belbin: (assessmentId: string) => `/assessment/${assessmentId}/belbin`,
    asturState: (assessmentId: string) => `/assessment/${assessmentId}/astur/state`,
    asturRuns: (assessmentId: string) => `/assessment/${assessmentId}/astur/runs`,
    asturContent: (assessmentId: string) => `/assessment/${assessmentId}/astur/content`,
    asturStart: (assessmentId: string, n: number) => `/assessment/${assessmentId}/astur/subtest/${n}/start`,
    asturSubtest: (assessmentId: string, n: number) => `/assessment/${assessmentId}/astur/subtest/${n}`,
    extendedBlocks: (assessmentId: string) => `/assessment/${assessmentId}/extended-blocks`,
  },
  result: {
    generate: '/result/generate',
    get: (assessmentId: string) => `/result/${assessmentId}`,
    feedback: '/result/feedback',
  },
  universities: {
    programs: '/universities/programs',
    programDetail: (id: string) => `/universities/programs/${id}`,
    list: '/universities',
    countries: '/universities/countries',
    detail: (id: string) => `/universities/${id}`,
    favorite: (id: string) => `/universities/${id}/favorite`,
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
    universityCountries: '/admin/universities/countries',
    universityDetail: (id: string) => `/admin/universities/${id}`,
    programDetail: (id: string) => `/admin/programs/${id}`,
    questions: '/admin/questions',
    questionDetail: (id: string) => `/admin/questions/${id}`,
    questionPairs: '/admin/question-pairs',
    questionPairDetail: (id: string) => `/admin/question-pairs/${id}`,
    motivationStatements: '/admin/motivation-statements',
    motivationStatementDetail: (id: string) => `/admin/motivation-statements/${id}`,
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
    contentOverride: (instrument: string) => `/admin/content-overrides/${instrument}`,
    belbinSchema: '/admin/belbin-schema',
    asturBankVersions: '/admin/astur/bank-versions',
    asturBankDraft: '/admin/astur/bank-versions/draft',
    asturBankVersion: (id: string) => `/admin/astur/bank-versions/${id}`,
    asturBankPublish: (id: string) => `/admin/astur/bank-versions/${id}/publish`,
    asturBankDiff: (id: string) => `/admin/astur/bank-versions/${id}/diff`,
    asturBankAnalytics: (id: string) => `/admin/astur/bank-versions/${id}/analytics`,
  },
  psychologist: {
    students: '/psychologist/students',
    availableStudents: '/psychologist/students/available',
    claimStudent: (id: string) => `/psychologist/students/${id}/claim`,
    studentDetail: (id: string) => `/psychologist/students/${id}`,
    studentNotes: (studentId: string) => `/psychologist/students/${studentId}/notes`,
    noteDetail: (noteId: string) => `/psychologist/notes/${noteId}`,
    studentAssessmentReport: (studentId: string, assessmentId: string) =>
      `/psychologist/students/${studentId}/assessments/${assessmentId}/report`,
    studentAssessmentTestResults: (studentId: string, assessmentId: string) =>
      `/psychologist/students/${studentId}/assessments/${assessmentId}/test-results`,
    regenerateReportAiAnalysis: (studentId: string, assessmentId: string) =>
      `/psychologist/students/${studentId}/assessments/${assessmentId}/report/ai-analysis/regenerate`,
    assignExtendedBlock: (studentId: string, assessmentId: string) =>
      `/psychologist/students/${studentId}/assessments/${assessmentId}/extended-blocks`,
    reviews: '/psychologist/reviews',
    resultReview: (studentId: string, assessmentId: string) =>
      `/psychologist/students/${studentId}/results/${assessmentId}`,
    publishResult: (studentId: string, assessmentId: string) =>
      `/psychologist/students/${studentId}/results/${assessmentId}/publish`,
  },
} as const;
