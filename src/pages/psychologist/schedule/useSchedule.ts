import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { schedulingApi, schedulingKeys } from '@/shared/api/scheduling';
import type {
  ScheduleAvailabilityChange,
  ScheduleSkippedDay,
  ScheduleTemplate,
  ScheduleWeek,
} from '@/shared/types';
import { addDays } from './scheduleDates';

export function useScheduleConfig() {
  return useQuery({ queryKey: schedulingKeys.config(), queryFn: schedulingApi.config, staleTime: 60_000 });
}

export function useScheduleSpecialists(weekStart: string | undefined, enabled: boolean) {
  return useQuery({
    queryKey: schedulingKeys.specialists(weekStart ?? ''),
    queryFn: () => schedulingApi.specialists(weekStart),
    enabled: enabled && Boolean(weekStart),
  });
}

export function useScheduleWeek(specialist: string | undefined, weekStart: string | undefined) {
  return useQuery({
    queryKey: schedulingKeys.week(specialist ?? '', weekStart ?? ''),
    queryFn: () => schedulingApi.week(specialist!, weekStart!),
    enabled: Boolean(specialist && weekStart),
  });
}

/** Calls booked into the week from the CRM — the grid draws them, the list
 *  below shows their handoff cards; one query serves both. */
export function useWeekMeetings(specialist: string | undefined, weekStart: string | undefined) {
  return useQuery({
    queryKey: schedulingKeys.meetings(specialist ?? '', weekStart ?? ''),
    queryFn: () => schedulingApi.meetings(specialist!, weekStart!, addDays(weekStart!, 6)),
    enabled: Boolean(specialist && weekStart),
  });
}

/** Every write answers with the weeks it touched: those replace the cache,
 *  so the grid shows the server's word without a refetch. */
export function useScheduleMutations(specialist: string, weekStart: string, reason?: string) {
  const queryClient = useQueryClient();

  function store(weeks: ScheduleWeek[]) {
    for (const week of weeks) {
      queryClient.setQueryData(schedulingKeys.week(specialist, week.week_start), week);
    }
    // Free-slot counts and "week published" marks in the owner's list.
    void queryClient.invalidateQueries({ queryKey: [...schedulingKeys.all, 'specialists'] });
  }

  const patch = useMutation({
    mutationFn: (changes: ScheduleAvailabilityChange[]) =>
      schedulingApi.patchAvailability(specialist, changes, reason),
    onSuccess: (data) => store(data.weeks),
  });

  const copyPrevious = useMutation({
    mutationFn: () => schedulingApi.copyPrevious(specialist, weekStart, reason),
    onSuccess: (data) => store([data.week]),
  });

  const applyTemplate = useMutation({
    mutationFn: () => schedulingApi.applyTemplate(specialist, weekStart, reason),
    onSuccess: (data) => store([data.week]),
  });

  const saveTemplate = useMutation({
    mutationFn: (template: ScheduleTemplate) => schedulingApi.saveTemplate(specialist, template),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: schedulingKeys.template(specialist) }),
  });

  const publish = useMutation({
    mutationFn: () => schedulingApi.publish(specialist, weekStart),
    onSuccess: (week) => store([week]),
  });

  return { patch, copyPrevious, applyTemplate, saveTemplate, publish };
}

export function skippedSlots(skipped: ScheduleSkippedDay[]): number {
  return skipped.reduce((sum, day) => sum + day.count, 0);
}
