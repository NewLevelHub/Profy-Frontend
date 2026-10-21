import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { CalendarCheck, ChevronLeft, ChevronRight, Copy, LayoutTemplate, Save } from 'lucide-react';
import { apiErrorCode } from '@/shared/api/client';
import { confirm } from '@/shared/lib/confirm';
import { useAuthStore } from '@/shared/store/auth';
import { Button } from '@/shared/ui/Button';
import { PageContainer } from '@/shared/ui/PageContainer';
import { PageHeader } from '@/shared/ui/PageHeader';
import { Spinner } from '@/shared/ui/Spinner';
import { AdminError } from '@/shared/ui/admin/AdminStates';
import { AdminSelect } from '@/shared/ui/admin/AdminSelect';
import { ADMIN_INPUT } from '@/shared/ui/admin/density';
import type { ScheduleEditableState, ScheduleSlot } from '@/shared/types';
import { SegmentedTabs } from '../components/SegmentedTabs';
import { addDays, defaultWeek, formatWeekRange, mondayOf, toChanges, weekToTemplate } from './scheduleDates';
import {
  skippedSlots,
  useScheduleConfig,
  useScheduleMutations,
  useScheduleSpecialists,
  useScheduleWeek,
} from './useSchedule';
import { WeekGrid } from './WeekGrid';
import { WeekMeetings } from './WeekMeetings';

/** Codes with their own message; anything else reads as a generic failure. */
const KNOWN_ERRORS = [
  'slot_frozen',
  'slot_in_past',
  'slot_booked',
  'reason_required',
  'template_empty',
  'slot_misaligned',
  'slot_out_of_grid',
  'changes_overlap',
  'specialist_not_found',
];

function errorMessage(error: unknown, t: TFunction<'psychologist'>): string {
  const code = apiErrorCode(error);
  return t(code && KNOWN_ERRORS.includes(code) ? `schedule.errors.${code}` : 'schedule.errors.generic');
}

const REASON_MIN = 3;

/**
 * «Расписание» (PRO-551, PRO-559; ТЗ §4.6). The specialist sets their own
 * free time; the owner picks any specialist and edits with a reason, frozen
 * days included. Free slots show up in the CRM at once — publishing only
 * says "this week is done" (Friday reminder, owner's mark).
 */
export default function PsychologistSchedulePage() {
  const { t } = useTranslation('psychologist');
  const isOwner = useAuthStore((s) => s.user?.role === 'owner');
  const [params, setParams] = useSearchParams();
  const [tool, setTool] = useState<ScheduleEditableState>('free');
  const [reason, setReason] = useState('');
  const [notice, setNotice] = useState('');

  const config = useScheduleConfig();
  const today = config.data?.today;
  const weekParam = params.get('week');
  const weekStart = weekParam ? mondayOf(weekParam) : today ? defaultWeek(today) : undefined;

  const specialists = useScheduleSpecialists(weekStart, isOwner);
  const specialistParam = params.get('specialist');
  const specialist = isOwner ? specialistParam ?? specialists.data?.items[0]?.id : 'me';

  const week = useScheduleWeek(specialist, weekStart);
  const ownerReason = isOwner ? reason.trim() : undefined;
  const mutations = useScheduleMutations(specialist ?? 'me', weekStart ?? '', ownerReason || undefined);
  const busy = Object.values(mutations).some((m) => m.isPending);
  const canWrite = !isOwner || (ownerReason?.length ?? 0) >= REASON_MIN;

  useEffect(() => setNotice(''), [weekStart, specialist]);

  function update(next: Record<string, string>) {
    const merged = new URLSearchParams(params);
    for (const [key, value] of Object.entries(next)) merged.set(key, value);
    setParams(merged, { replace: true });
  }

  const isEditable = useCallback(
    (slot: ScheduleSlot) =>
      canWrite && !slot.past && slot.state !== 'booked' && (isOwner || !slot.frozen),
    [canWrite, isOwner],
  );

  const onPaint = useCallback(
    (starts: Set<string>) => {
      if (!week.data) return;
      const changes = toChanges(week.data, starts, tool);
      if (!changes.length) return;
      setNotice('');
      mutations.patch.mutate(changes, { onError: (error) => setNotice(errorMessage(error, t)) });
    },
    [week.data, tool, mutations.patch, t],
  );

  async function runBulk(kind: 'copy' | 'template') {
    const ok = await confirm({
      title: t(kind === 'copy' ? 'schedule.confirmCopy.title' : 'schedule.confirmTemplate.title'),
      body: t('schedule.confirmOverwrite'),
      confirmLabel: t(kind === 'copy' ? 'schedule.actions.copyPrevious' : 'schedule.actions.applyTemplate'),
      cancelLabel: t('schedule.cancel'),
    });
    if (!ok) return;
    const mutation = kind === 'copy' ? mutations.copyPrevious : mutations.applyTemplate;
    mutation.mutate(undefined, {
      onSuccess: (data) => {
        const skipped = skippedSlots(data.skipped);
        setNotice(skipped ? t('schedule.notice.skipped', { count: skipped }) : t('schedule.notice.applied'));
      },
      onError: (error) => setNotice(errorMessage(error, t)),
    });
  }

  async function saveTemplate() {
    if (!week.data || !config.data) return;
    const ok = await confirm({
      title: t('schedule.confirmSaveTemplate.title'),
      body: t('schedule.confirmSaveTemplate.body'),
      confirmLabel: t('schedule.actions.saveTemplate'),
      cancelLabel: t('schedule.cancel'),
    });
    if (!ok) return;
    mutations.saveTemplate.mutate(weekToTemplate(week.data, config.data.day_start, config.data.slot_minutes), {
      onSuccess: () => setNotice(t('schedule.notice.templateSaved')),
      onError: (error) => setNotice(errorMessage(error, t)),
    });
  }

  function publish() {
    mutations.publish.mutate(undefined, {
      onSuccess: () => setNotice(t('schedule.notice.published')),
      onError: (error) => setNotice(errorMessage(error, t)),
    });
  }

  const error = config.error ?? specialists.error ?? week.error;
  const selected = specialists.data?.items.find((item) => item.id === specialist);

  return (
    <PageContainer className="rd-psych-page flex flex-col pb-12">
      <PageHeader
        level="display-md"
        kicker={t('schedule.kicker')}
        title={t('schedule.title')}
        subtitle={t(isOwner ? 'schedule.leadOwner' : 'schedule.lead')}
        className="rd-psych-heading"
      />

      {error ? (
        <AdminError message={errorMessage(error, t)} onRetry={() => void week.refetch()} />
      ) : (
        <section className="rd-schedule" aria-label={t('schedule.title')}>
          {isOwner && (
            <div className="rd-schedule-owner">
              <label className="rd-schedule-field">
                <span>{t('schedule.owner.specialist')}</span>
                <AdminSelect
                  value={specialist ?? ''}
                  onChange={(event) => update({ specialist: event.target.value })}
                  disabled={!specialists.data?.items.length}
                >
                  {specialists.data?.items.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.week_published
                        ? item.full_name
                        : t('schedule.owner.notPublishedOption', { name: item.full_name })}
                    </option>
                  ))}
                </AdminSelect>
              </label>
              <label className="rd-schedule-field rd-schedule-reason">
                <span>{t('schedule.owner.reason')}</span>
                <input
                  className={ADMIN_INPUT}
                  value={reason}
                  maxLength={500}
                  placeholder={t('schedule.owner.reasonPlaceholder')}
                  onChange={(event) => setReason(event.target.value)}
                />
              </label>
              {specialists.data && !specialists.data.items.length && (
                <p className="rd-schedule-hint">{t('schedule.owner.noSpecialists')}</p>
              )}
              {!canWrite && specialists.data?.items.length ? (
                <p className="rd-schedule-hint">{t('schedule.owner.reasonHint')}</p>
              ) : null}
            </div>
          )}

          <div className="rd-schedule-toolbar">
            <div className="rd-schedule-weeknav">
              <button
                type="button"
                className="rd-icon-button"
                aria-label={t('schedule.prevWeek')}
                disabled={!weekStart}
                onClick={() => weekStart && update({ week: addDays(weekStart, -7) })}
              >
                <ChevronLeft size={18} />
              </button>
              <strong aria-live="polite">{weekStart ? formatWeekRange(weekStart) : ''}</strong>
              <button
                type="button"
                className="rd-icon-button"
                aria-label={t('schedule.nextWeek')}
                disabled={!weekStart}
                onClick={() => weekStart && update({ week: addDays(weekStart, 7) })}
              >
                <ChevronRight size={18} />
              </button>
              {today && (
                <Button variant="text" size="sm" muteSound onClick={() => update({ week: mondayOf(today) })}>
                  {t('schedule.thisWeek')}
                </Button>
              )}
            </div>
            {week.data && (
              <span className={week.data.published ? 'rd-schedule-status is-published' : 'rd-schedule-status'}>
                {week.data.published ? t('schedule.published') : t('schedule.notPublished')}
              </span>
            )}
          </div>

          <div className="rd-schedule-toolbar">
            <SegmentedTabs<ScheduleEditableState>
              label={t('schedule.toolLabel')}
              active={tool}
              onChange={setTool}
              tabs={(['free', 'personal', 'closed'] as const).map((key) => ({
                key,
                label: (
                  <span className="inline-flex items-center gap-2">
                    <span className={`rd-schedule-swatch is-${key}`} aria-hidden="true" />
                    {t(`schedule.tool.${key}`)}
                  </span>
                ),
              }))}
            />
            <div className="rd-schedule-actions">
              <Button variant="ghost" size="sm" muteSound disabled={!canWrite || busy || !week.data} onClick={() => void runBulk('copy')}>
                <Copy size={15} aria-hidden="true" />
                {t('schedule.actions.copyPrevious')}
              </Button>
              <Button variant="ghost" size="sm" muteSound disabled={!canWrite || busy || !week.data} onClick={() => void runBulk('template')}>
                <LayoutTemplate size={15} aria-hidden="true" />
                {t('schedule.actions.applyTemplate')}
              </Button>
              <Button variant="ghost" size="sm" muteSound disabled={busy || !week.data} onClick={() => void saveTemplate()}>
                <Save size={15} aria-hidden="true" />
                {t('schedule.actions.saveTemplate')}
              </Button>
              <Button size="sm" muteSound disabled={busy || !week.data || week.data.published} onClick={publish}>
                <CalendarCheck size={15} aria-hidden="true" />
                {t('schedule.actions.publish')}
              </Button>
            </div>
          </div>

          {week.data && (
            <p className={week.data.published ? 'rd-schedule-publish-hint is-published' : 'rd-schedule-publish-hint'}>
              {t(week.data.published ? 'schedule.publishedHint' : 'schedule.publishHint')}
            </p>
          )}

          <p className="rd-schedule-notice" role="status" aria-live="polite">
            {notice || (isOwner && selected ? '' : t('schedule.paintHint'))}
          </p>

          {week.data && config.data ? (
            <WeekGrid
              week={week.data}
              dayStart={config.data.day_start}
              slotMinutes={config.data.slot_minutes}
              tool={tool}
              isEditable={isEditable}
              onPaint={onPaint}
              busy={busy}
            />
          ) : (
            <div className="rd-schedule-loading">
              {week.isLoading || config.isLoading || specialists.isLoading ? <Spinner /> : null}
            </div>
          )}
        </section>
      )}

      {specialist && weekStart && !error && <WeekMeetings specialist={specialist} weekStart={weekStart} />}
    </PageContainer>
  );
}
