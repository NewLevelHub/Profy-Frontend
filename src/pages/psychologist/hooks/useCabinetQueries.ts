import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { psychologistApi } from '@/shared/api/psychologist';
import { psychologistKeys } from '@/shared/api/psychologistKeys';

export function useMyStudents() {
  return useQuery({
    queryKey: psychologistKeys.mineStudents(),
    queryFn: psychologistApi.listStudents,
  });
}

export function useAvailableStudents() {
  return useQuery({
    queryKey: psychologistKeys.availableStudents(),
    queryFn: psychologistApi.listAvailableStudents,
  });
}

/** Claiming moves a student from the shared pool into "мои" — and, when the
 *  student has a report waiting, into the review queue too. */
export function useClaimStudent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (studentId: string) => psychologistApi.claimStudent(studentId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: psychologistKeys.students() });
      void queryClient.invalidateQueries({ queryKey: psychologistKeys.reviews() });
    },
  });
}

export function useStudentDetail(studentId: string) {
  return useQuery({
    queryKey: psychologistKeys.student(studentId),
    queryFn: () => psychologistApi.getStudent(studentId),
    enabled: !!studentId,
    retry: false,
  });
}
