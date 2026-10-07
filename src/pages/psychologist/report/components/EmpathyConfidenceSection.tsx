import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ShieldAlert } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { AdminCard } from '@/shared/ui/admin/AdminSectionHeading';
import { AdminBadge, type AdminBadgeTone } from '@/shared/ui/admin/AdminBadge';
import { ADMIN_META, ADMIN_NUM, ADMIN_TEXT } from '@/shared/ui/admin/density';
import type { EmpathyConfidenceSection as EmpathyConfidenceSectionData } from '@/shared/types';
import { PolarAreaChart, type PolarAreaSector } from './PolarAreaChart';
import { StenProgressBar } from './StenProgressBar';
import { PsychTestHeaderInfo } from './PsychTestHeaderInfo';
import { PsychDetailCard } from './PsychDetailCard';
import { BinaryEvidenceView, RatedEvidenceView } from './AnswerEvidence';
import { ScoreRow } from './ScoreRow';
import {
  getBoykoKondashMethodology,
  getBoykoChannels,
  getBoykoTotalLevels,
  getKondashLevels,
} from '../model/psychTestExplanations';

const CHANNEL_ORDER = ['rational', 'emotional', 'intuitive', 'attitudes', 'penetration', 'identification'];

const EMPATHY_LEVEL_TONES: Record<string, AdminBadgeTone> = {
  very_low: 'danger',
  underestimated: 'quiet',
  average: 'quiet',
  very_high: 'brand',
};

const CONFIDENCE_LEVEL_TONES: Record<string, AdminBadgeTone> = {
  high: 'brand',
  normative: 'quiet',
  low: 'danger',
};

const CHANNEL_MAX = 6;

/**
 * Boyko "Empathy" + Kondash "Social confidence" with detailed channels
 * and cross-interpretation for the psychologist.
 */
export function EmpathyConfidenceSection({ section }: { section: EmpathyConfidenceSectionData | null }) {
  const { t } = useTranslation('psychReport');
  if (!section) return null;

  const methodology = getBoykoKondashMethodology(t);
  const boykoChannels = getBoykoChannels(t);
  const boykoTotalLevels = getBoykoTotalLevels(t);
  const kondashLevels = getKondashLevels(t);

  const channelLabels = (t('psychReport:boykoKondash.channelLabels', {
    returnObjects: true,
  }) || {}) as Record<string, string>;

  const channelShortLabels = (t('psychReport:boykoKondash.channelShortLabels', {
    returnObjects: true,
  }) || {}) as Record<string, string>;

  const empathyLevelLabels = (t('psychReport:boykoKondash.empathyLevelLabels', {
    returnObjects: true,
  }) || {}) as Record<string, string>;

  const confidenceLevelLabels = (t('psychReport:boykoKondash.confidenceLevelLabels', {
    returnObjects: true,
  }) || {}) as Record<string, string>;

  const {
    empathy_channels,
    empathy_total,
    empathy_level,
    confidence_stens,
    confidence_level,
    empathy_evidence,
    confidence_evidence,
  } = section;

  // Selected item to inspect: can be a channel key, 'total_empathy', or 'confidence'
  const [selectedKey, setSelectedKey] = useState<string | null>(empathy_level ? 'total_empathy' : null);

  const sectors: PolarAreaSector[] | null = empathy_channels
    ? CHANNEL_ORDER.filter((key) => key in empathy_channels).map((key) => ({
        key,
        label: channelShortLabels[key] ?? key,
        value: empathy_channels[key],
      }))
    : null;

  const isHighEmpathy = empathy_level === 'average' || empathy_level === 'very_high';
  const isLowConfidence = confidence_level === 'low';
  const showVulnerabilityWarning = isHighEmpathy && isLowConfidence;

  const isTotalEmpathy = selectedKey === 'total_empathy';
  const isConfidence = selectedKey === 'confidence';

  return (
    <AdminCard
      title={t('psychReport:boykoKondash.cardTitle')}
      description={t('psychReport:boykoKondash.cardDescription')}
    >
      <PsychTestHeaderInfo methodology={methodology} />

      {showVulnerabilityWarning && (
        <div className="p-3 mb-3 rounded-[12px] bg-danger-subtle border border-danger/30 flex items-start gap-2.5">
          <ShieldAlert size={16} className="text-danger flex-shrink-0 mt-0.5" />
          <div className={ADMIN_TEXT}>
            <p className="font-semibold text-danger m-0">
              {t('psychReport:boykoKondash.vulnerabilityWarningTitle')}
            </p>
            <p className="text-danger m-0 mt-0.5 leading-snug">
              {t('psychReport:boykoKondash.vulnerabilityWarningBody')}
            </p>
          </div>
        </div>
      )}

      {sectors && sectors.length > 0 && (
        <div className="flex flex-col items-center gap-3 mb-4">
          <PolarAreaChart sectors={sectors} max={CHANNEL_MAX} />

          {empathy_level && (
            <div className="w-full">
              <ScoreRow
                label={<span className={ADMIN_TEXT}>{t('psychReport:boykoKondash.totalChannelsLabel')}</span>}
                value={empathy_total !== null && <span className={cn(ADMIN_NUM, 'text-primary')}>{empathy_total}/36</span>}
                badge={<AdminBadge tone={EMPATHY_LEVEL_TONES[empathy_level] ?? 'neutral'}>{empathyLevelLabels[empathy_level] ?? empathy_level}</AdminBadge>}
                isOpen={isTotalEmpathy}
                onToggle={() => setSelectedKey(isTotalEmpathy ? null : 'total_empathy')}
              >
                <PsychDetailCard
                  bare
                  title={t('psychReport:boykoKondash.totalEmpathyTitle', {
                    level: empathyLevelLabels[empathy_level] ?? empathy_level,
                  })}
                  badge={<AdminBadge tone={EMPATHY_LEVEL_TONES[empathy_level]}>{empathyLevelLabels[empathy_level] ?? empathy_level}</AdminBadge>}
                  meaning={boykoTotalLevels[empathy_level]?.meaning ?? ''}
                  means={boykoTotalLevels[empathy_level]?.meaning ?? ''}
                  follows={boykoTotalLevels[empathy_level]?.advice ?? ''}
                  why={t('psychReport:boykoKondash.whyTotalEmpathy', {
                    breakdown: sectors.map((s) => `${channelLabels[s.key] ?? s.key} — ${s.value}/${CHANNEL_MAX}`).join(', '),
                    total: empathy_total,
                    level: empathyLevelLabels[empathy_level] ?? empathy_level,
                  })}
                />
              </ScoreRow>
            </div>
          )}

          <div className="flex flex-col gap-1 w-full">
            {sectors.map((sector) => {
              const isSelected = selectedKey === sector.key;
              const info = sector.key in boykoChannels ? boykoChannels[sector.key] : null;
              return (
                <ScoreRow
                  key={sector.key}
                  label={<span className={cn(ADMIN_META, isSelected && 'text-primary font-medium')}>{channelLabels[sector.key] ?? sector.key}</span>}
                  value={<span className={cn(ADMIN_NUM, isSelected && 'font-bold text-brand')}>{sector.value}/{CHANNEL_MAX}</span>}
                  isOpen={isSelected}
                  onToggle={() => setSelectedKey(isSelected ? null : sector.key)}
                >
                  {info && (
                    <PsychDetailCard
                      bare
                      title={info.name}
                      badge={<AdminBadge tone="brand">{t('psychReport:boykoKondash.channelBadge')}</AdminBadge>}
                      meaning={info.meaning}
                      means={info.behavioralManifestation}
                      follows={info.psychologistFocus}
                      why={t('psychReport:boykoKondash.whySector', {
                        value: sector.value,
                        max: CHANNEL_MAX,
                        norms: info.normsExplanation ?? '',
                      })}
                      riskWarning={info.riskWarning}
                    >
                      {empathy_evidence?.[sector.key] && (
                        <BinaryEvidenceView evidence={empathy_evidence[sector.key]} />
                      )}
                    </PsychDetailCard>
                  )}
                </ScoreRow>
              );
            })}
          </div>
        </div>
      )}

      {confidence_stens !== null && (
        <div className="pt-3 border-t border-default">
          <p className={cn(ADMIN_TEXT, 'font-medium text-primary mb-2')}>{t('psychReport:boykoKondash.confidenceHeading')}</p>
          <StenProgressBar value={confidence_stens} min={1} max={10} normativeFrom={4} normativeTo={6} />
          <div className="mt-2.5">
            <ScoreRow
              label={<span className={ADMIN_TEXT}>{t('psychReport:scoreRow.resultAnalysis')}</span>}
              value={<span className={ADMIN_NUM}>{t('psychReport:boykoKondash.stenUnit', { count: confidence_stens })}</span>}
              badge={
                confidence_level && (
                  <AdminBadge tone={CONFIDENCE_LEVEL_TONES[confidence_level] ?? 'neutral'}>
                    {confidenceLevelLabels[confidence_level] ?? confidence_level}
                  </AdminBadge>
                )
              }
              isOpen={isConfidence}
              onToggle={() => setSelectedKey(isConfidence ? null : 'confidence')}
            >
              {confidence_level && (
                <PsychDetailCard
                  bare
                  title={t('psychReport:boykoKondash.confidenceDetailTitle', {
                    level: confidenceLevelLabels[confidence_level] ?? confidence_level,
                  })}
                  badge={<AdminBadge tone={CONFIDENCE_LEVEL_TONES[confidence_level]}>{t('psychReport:boykoKondash.stenUnit', { count: confidence_stens })}</AdminBadge>}
                  meaning={kondashLevels[confidence_level]?.meaning ?? ''}
                  means={kondashLevels[confidence_level]?.meaning ?? ''}
                  follows={kondashLevels[confidence_level]?.advice ?? ''}
                  why={t('psychReport:boykoKondash.whyConfidence', { score: confidence_stens })}
                  riskWarning={
                    confidence_level === 'low'
                      ? t('psychReport:boykoKondash.confidenceLowRisk')
                      : undefined
                  }
                >
                  {confidence_evidence && (
                    <RatedEvidenceView
                      evidence={confidence_evidence}
                      valueLabels={[
                        t('psychReport:evidence.kondashBucket0'),
                        '1',
                        '2',
                        '3',
                        t('psychReport:evidence.kondashBucket4'),
                      ]}
                    />
                  )}
                </PsychDetailCard>
              )}
            </ScoreRow>
          </div>
        </div>
      )}
    </AdminCard>
  );
}
