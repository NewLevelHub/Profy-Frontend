import { useQuery } from '@tanstack/react-query';
import { psychologistApi } from '@/shared/api/psychologist';
import { psychologistKeys } from '@/shared/api/psychologistKeys';

export function useMyStudents() {
  return useQuery({
    queryKey: psychologistKeys.mineStudents(),
    queryFn: psychologistApi.listStudents,
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
