import { apiClient } from '@/shared/api/client';
import { API } from '@/shared/api/endpoints';
import type {
  AssignExtendedBlockPayload,
  ExtendedBlockAssignment,
  PsychAiAnalysis,
  PsychologistNote,
  PsychologistNoteWrite,
  PsychologistReportResponse,
  PsychologistStudentDetail,
  PsychologistStudentListItem,
} from '@/shared/types';

export const psychologistApi = {
  listStudents: () =>
    apiClient
      .get<PsychologistStudentListItem[]>(API.psychologist.students)
      .then((r) => r.data),

  getStudent: (studentId: string) =>
    apiClient
      .get<PsychologistStudentDetail>(API.psychologist.studentDetail(studentId))
      .then((r) => r.data),

  listNotes: (studentId: string) =>
    apiClient
      .get<PsychologistNote[]>(API.psychologist.studentNotes(studentId))
      .then((r) => r.data),

  createNote: (studentId: string, body: PsychologistNoteWrite) =>
    apiClient
      .post<PsychologistNote>(API.psychologist.studentNotes(studentId), body)
      .then((r) => r.data),

  updateNote: (noteId: string, body: PsychologistNoteWrite) =>
    apiClient
      .patch<PsychologistNote>(API.psychologist.noteDetail(noteId), body)
      .then((r) => r.data),

  deleteNote: (noteId: string) =>
    apiClient.delete(API.psychologist.noteDetail(noteId)).then((r) => r.data),

  getReport: (studentId: string, assessmentId: string) =>
    apiClient
      .get<PsychologistReportResponse>(API.psychologist.studentAssessmentReport(studentId, assessmentId))
      .then((r) => r.data),

  regenerateReportAiAnalysis: (studentId: string, assessmentId: string) =>
    apiClient
      .post<PsychAiAnalysis | null>(API.psychologist.regenerateReportAiAnalysis(studentId, assessmentId))
      .then((r) => r.data),

  assignExtendedBlock: (studentId: string, assessmentId: string, body: AssignExtendedBlockPayload) =>
    apiClient
      .post<ExtendedBlockAssignment>(API.psychologist.assignExtendedBlock(studentId, assessmentId), body)
      .then((r) => r.data),
};
