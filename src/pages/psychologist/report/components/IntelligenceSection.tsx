import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertTriangle } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { AdminCard } from '@/shared/ui/admin/AdminSectionHeading';
import { AdminBadge } from '@/shared/ui/admin/AdminBadge';
import { ProgressBar } from '@/shared/ui/ProgressBar';
import { ADMIN_META, ADMIN_NUM, ADMIN_TEXT } from '@/shared/ui/admin/density';
import type { IntelligenceSection as IntelligenceSectionData } from '@/shared/types';
import { LineChart, type LineChartPoint } from './LineChart';
import { PsychTestHeaderInfo } from './PsychTestHeaderInfo';
import { PsychDetailCard } from './PsychDetailCard';
import { ScoreRow } from './ScoreRow';
import {
  getAsturMethodology,
  getAsturSubtests,
  getAsturSpnGroups,
  getAsturLabilityNote,
} from '../model/psychTestExplanations';

const SUBTEST_ORDER = ['awareness', 'analogies', 'classification', 'generalization', 'logical_schemas', 'numeric_series'];

const SUBTEST_MAX: Record<string, number> = {
  awareness: 20,
  analogies: 16,
  classification: 12,
  generalization: 38,
  logical_schemas: 26,
  numeric_series: 15,
};

/**
 * ASTUR "Intelligence characteristics" — line chart over 6 subtests +
 * SPN group + learning profile + detailed evidence breakdown of intelligence structure.
 */
export function IntelligenceSection({ section }: { section: IntelligenceSectionData | null }) {
  const { t } = useTranslation('psychReport');
  if (!section) return null;

  const methodology = getAsturMethodology(t);
  const asturSubtests = getAsturSubtests(t);
  const asturSpnGroups = getAsturSpnGroups(t);
  const asturLabilityNote = getAsturLabilityNote(t);

  const subtestShortLabels = (t('psychReport:astur.subtestShortLabels', {
    returnObjects: true,
  }) || {}) as Record<string, string>;

  const subjectLabels = (t('psychReport:astur.subjects', {
    returnObjects: true,
  }) || {}) as Record<string, string>;

  const {
    raw_score, subtest_scores, spn_group, learning_profile, learning_profile_shares,
    lability_first_half_accuracy, lability_second_half_accuracy, lability_fatigue_signal,
  } = section;

  // Selected item to inspect: subtest key or 'spn' or 'lability'
  const [selectedKey, setSelectedKey] = useState<string | null>(spn_group ? 'spn' : 'generalization');

  const isSpnSelected = selectedKey === 'spn';
  const isLabilitySelected = selectedKey === 'lability';

  function toggle(key: string) {
    setSelectedKey((current) => (current === key ? null : key));
  }

  const points: LineChartPoint[] | null = subtest_scores
    ? SUBTEST_ORDER.filter((key) => key in subtest_scores).map((key) => ({
        key,
        label: subtestShortLabels[key] ?? key,
        value: subtest_scores[key],
        max: SUBTEST_MAX[key],
      }))
    : null;

  return (
    <AdminCard
      title={t('psychReport:astur.cardTitle')}
      description={t('psychReport:astur.cardDescription')}
    >
      <PsychTestHeaderInfo methodology={methodology} />

      {points && points.length > 0 && (
        <div className="flex flex-col items-center gap-3 mb-4">
          <LineChart points={points} />
          {raw_score !== null && (
            <span className={cn(ADMIN_NUM, 'text-primary')}>
              {t('psychReport:astur.totalScore', { score: raw_score })}
            </span>
          )}

          <div className="flex flex-col gap-1.5 w-full">
            {spn_group !== null && (
              <ScoreRow
                label={<span className={cn(ADMIN_TEXT, isSpnSelected && 'text-primary font-medium')}>{t('psychReport:astur.spnGroupLabel')}</span>}
                badge={<AdminBadge tone="brand">{spn_group}/5</AdminBadge>}
                isOpen={isSpnSelected}
                onToggle={() => toggle('spn')}
              >
                <PsychDetailCard
                  bare
                  title={t('psychReport:astur.spnDetailTitle', { group: spn_group })}
                  badge={<AdminBadge tone="brand">{t('psychReport:astur.spnBadge')}</AdminBadge>}
                  meaning={asturSpnGroups[spn_group]?.meaning ?? ''}
                  means={asturSpnGroups[spn_group]?.meaning ?? ''}
                  follows={asturSpnGroups[spn_group]?.advice ?? ''}
                  why={t('psychReport:astur.spnWhy', { score: raw_score })}
                  riskWarning={
                    spn_group >= 4
                      ? t('psychReport:astur.spnRisk')
                      : undefined
                  }
                />
              </ScoreRow>
            )}

            {points.map((p) => {
              const isSelected = selectedKey === p.key;
              const info = asturSubtests[p.key];
              return (
                <ScoreRow
                  key={p.key}
                  label={<span className={cn(ADMIN_TEXT, isSelected && 'text-primary font-medium')}>{info?.name ?? p.key}</span>}
                  value={<span className={ADMIN_NUM}>{p.value}/{p.max}</span>}
                  isOpen={isSelected}
                  onToggle={() => toggle(p.key)}
                >
                  {info && (
                    <PsychDetailCard
                      bare
                      title={info.name}
                      badge={<AdminBadge tone="brand">{t('psychReport:astur.subtestBadge')}</AdminBadge>}
                      meaning={info.meaning}
                      means={info.behavioralManifestation}
                      follows={info.psychologistFocus}
                      why={t('psychReport:astur.subtestWhy', {
                        value: p.value,
                        max: p.max,
                        norms: info.normsExplanation ?? '',
                      })}
                    />
                  )}
                </ScoreRow>
              );
            })}
          </div>
        </div>
      )}

      {learning_profile && (
        <div className="pt-3 border-t border-default mb-4">
          <p className={cn(ADMIN_TEXT, 'text-secondary mb-2')}>
            {t('psychReport:astur.recommendedProfile')}{' '}
            <span className="font-semibold text-primary">{subjectLabels[learning_profile] ?? learning_profile}</span>
          </p>
          {learning_profile_shares && (
            <ul className="m-0 p-0 list-none flex flex-col gap-1.5">
              {Object.entries(learning_profile_shares).map(([subject, share]) => (
                <li key={subject} className="flex items-center gap-2">
                  <span className={cn(ADMIN_META, 'w-40 flex-shrink-0')}>{subjectLabels[subject] ?? subject}</span>
                  <ProgressBar value={share * 100} className="flex-1" />
                  <span className={cn(ADMIN_NUM, 'w-10 text-right')}>{Math.round(share * 100)}%</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {(lability_first_half_accuracy !== null || lability_second_half_accuracy !== null) && (
        <div className="pt-3 border-t border-default">
          {lability_fatigue_signal && (
            <div role="alert" className="flex items-start gap-3 p-3 mb-3 rounded-[14px] border border-danger bg-danger-subtle">
              <AlertTriangle size={15} className="text-danger flex-shrink-0 mt-0.5" />
              <p className={cn(ADMIN_TEXT, 'text-danger font-semibold m-0')}>
                {t('psychReport:astur.fatigueAlert')}
              </p>
            </div>
          )}

          <p className={cn(ADMIN_TEXT, 'font-medium text-primary mb-2')}>{t('psychReport:astur.labilityHeading')}</p>
          <ul className="m-0 p-0 list-none flex flex-col gap-1.5 mb-2.5">
            {lability_first_half_accuracy !== null && (
              <li className="flex items-center gap-2">
                <span className={cn(ADMIN_META, 'w-28 flex-shrink-0')}>{t('psychReport:astur.firstHalf')}</span>
                <ProgressBar value={lability_first_half_accuracy * 100} className="flex-1" />
                <span className={cn(ADMIN_NUM, 'w-10 text-right')}>{Math.round(lability_first_half_accuracy * 100)}%</span>
              </li>
            )}
            {lability_second_half_accuracy !== null && (
              <li className="flex items-center gap-2">
                <span className={cn(ADMIN_META, 'w-28 flex-shrink-0')}>{t('psychReport:astur.secondHalf')}</span>
                <ProgressBar
                  value={lability_second_half_accuracy * 100}
                  variant={lability_fatigue_signal ? 'accent' : 'brand'}
                  className="flex-1"
                />
                <span className={cn(ADMIN_NUM, 'w-10 text-right')}>{Math.round(lability_second_half_accuracy * 100)}%</span>
              </li>
            )}
          </ul>

          <ScoreRow
            label={<span className={ADMIN_TEXT}>{t('psychReport:scoreRow.resultAnalysis')}</span>}
            badge={
              <AdminBadge tone={lability_fatigue_signal ? 'danger' : 'neutral'}>
                {lability_fatigue_signal
                  ? t('psychReport:astur.fatigueSignal')
                  : t('psychReport:astur.fatigueStable')}
              </AdminBadge>
            }
            isOpen={isLabilitySelected}
            onToggle={() => toggle('lability')}
          >
            <PsychDetailCard
              bare
              title={asturLabilityNote.title}
              badge={
                <AdminBadge tone={lability_fatigue_signal ? 'danger' : 'neutral'}>
                  {lability_fatigue_signal
                    ? t('psychReport:astur.fatigueSignal')
                    : t('psychReport:astur.workabilityStable')}
                </AdminBadge>
              }
              meaning={t('psychReport:astur.labilityMeaning')}
              means={lability_fatigue_signal ? asturLabilityNote.fatigueDetected : asturLabilityNote.stable}
              follows={
                lability_fatigue_signal
                  ? t('psychReport:astur.labilityFollowsFatigue')
                  : t('psychReport:astur.labilityFollowsStable')
              }
              why={t('psychReport:astur.labilityWhy', {
                acc1: Math.round((lability_first_half_accuracy ?? 0) * 100),
                acc2: Math.round((lability_second_half_accuracy ?? 0) * 100),
              })}
              riskWarning={
                lability_fatigue_signal
                  ? t('psychReport:astur.labilityRisk')
                  : undefined
              }
            />
          </ScoreRow>
        </div>
      )}
    </AdminCard>
  );
}
