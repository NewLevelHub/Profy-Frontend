/** react-query keys for the psychologist cabinet — one factory, so a mutation
 *  (claim, publish) can invalidate every list that shows the same student. */
export const psychologistKeys = {
  all: ['psychologist'] as const,
  reviews: () => [...psychologistKeys.all, 'reviews'] as const,
  students: () => [...psychologistKeys.all, 'students'] as const,
  mineStudents: () => [...psychologistKeys.students(), 'mine'] as const,
  availableStudents: () => [...psychologistKeys.students(), 'available'] as const,
  student: (studentId: string) => [...psychologistKeys.all, 'student', studentId] as const,
  notes: (studentId: string) => [...psychologistKeys.student(studentId), 'notes'] as const,
  result: (studentId: string, assessmentId: string) =>
    [...psychologistKeys.all, 'result', studentId, assessmentId] as const,
  resultEdits: (studentId: string, assessmentId: string) =>
    [...psychologistKeys.result(studentId, assessmentId), 'edits'] as const,
};
