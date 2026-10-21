import { apiClient } from '@/shared/api/client';
import { API } from '@/shared/api/endpoints';
import type {
  ScheduleAvailabilityChange,
  ScheduleConfig,
  ScheduleSpecialistList,
  ScheduleTemplate,
  ScheduleWeek,
  ScheduleWeekBulkResponse,
} from '@/shared/types';

/** Specialist schedule — docs/frontend-scheduling-api-contract.md (backend repo).
 *  `specialist` is `'me'` for the specialist, an id for the owner, who must
 *  pass a `reason` with every change to someone else's schedule. */
export const schedulingApi = {
  config: () => apiClient.get<ScheduleConfig>(API.scheduling.config).then((r) => r.data),

  specialists: (weekStart?: string) =>
    apiClient
      .get<ScheduleSpecialistList>(API.scheduling.specialists, { params: { week_start: weekStart } })
      .then((r) => r.data),

  week: (specialist: string, weekStart: string) =>
    apiClient.get<ScheduleWeek>(API.scheduling.week(specialist, weekStart)).then((r) => r.data),

  patchAvailability: (specialist: string, changes: ScheduleAvailabilityChange[], reason?: string) =>
    apiClient
      .patch<{ weeks: ScheduleWeek[] }>(API.scheduling.availability(specialist), { changes, reason })
      .then((r) => r.data),

  copyPrevious: (specialist: string, weekStart: string, reason?: string) =>
    apiClient
      .post<ScheduleWeekBulkResponse>(API.scheduling.copyPrevious(specialist, weekStart), { reason })
      .then((r) => r.data),

  template: (specialist: string) =>
    apiClient.get<ScheduleTemplate>(API.scheduling.template(specialist)).then((r) => r.data),

  saveTemplate: (specialist: string, template: ScheduleTemplate) =>
    apiClient
      .put<ScheduleTemplate>(API.scheduling.template(specialist), { days: template.days })
      .then((r) => r.data),

  applyTemplate: (specialist: string, weekStart: string, reason?: string) =>
    apiClient
      .post<ScheduleWeekBulkResponse>(API.scheduling.applyTemplate(specialist, weekStart), { reason })
      .then((r) => r.data),

  publish: (specialist: string, weekStart: string) =>
    apiClient.post<ScheduleWeek>(API.scheduling.publish(specialist, weekStart)).then((r) => r.data),
};

export const schedulingKeys = {
  all: ['scheduling'] as const,
  config: () => [...schedulingKeys.all, 'config'] as const,
  specialists: (weekStart: string) => [...schedulingKeys.all, 'specialists', weekStart] as const,
  week: (specialist: string, weekStart: string) =>
    [...schedulingKeys.all, 'week', specialist, weekStart] as const,
  template: (specialist: string) => [...schedulingKeys.all, 'template', specialist] as const,
};
