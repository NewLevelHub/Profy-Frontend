import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertTriangle } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { AdminCard } from '@/shared/ui/admin/AdminSectionHeading';
import { AdminBadge } from '@/shared/ui/admin/AdminBadge';
import { ADMIN_META, ADMIN_NUM, ADMIN_TEXT } from '@/shared/ui/admin/density';
import type { TemperamentSection as TemperamentSectionData } from '@/shared/types';
import { ScatterPlot, type ScatterPlotQuadrant } from './ScatterPlot';
import { PsychTestHeaderInfo } from './PsychTestHeaderInfo';
import { PsychDetailCard } from './PsychDetailCard';
import { PsychBandMeter, type BandMark } from './PsychBandMeter';
import { BinaryEvidenceView } from './AnswerEvidence';
import { ScoreRow } from './ScoreRow';
import {
  getEysenckMethodology,
  getTemperamentQuadrants,
  getEysenckScales,
} from '../model/psychTestExplanations';

const SCALE_MAX = 24;

export function TemperamentSection({ section }: { section: TemperamentSectionData | null }) {
  const { t } = useTranslation('psychReport');
  if (!section) return null;

  const methodology = getEysenckMethodology(t);
  const quadrants = getTemperamentQuadrants(t);
  const scales = getEysenckScales(t);

  const extraversionLabels = (t('psychReport:eysenck.extraversionLevelLabels', {
    returnObjects: true,
  }) || {}) as Record<string, string>;
  const neuroticismLabels = (t('psychReport:eysenck.neuroticismLevelLabels', {
    returnObjects: true,
  }) || {}) as Record<string, string>;
  const quadrantLabels = (t('psychReport:eysenck.quadrantLabels', {
    returnObjects: true,
  }) || {}) as Record<string, string>;

  const hasChart = section.extraversion_raw !== null && section.neuroticism_raw !== null;

  // Initial active view: the student's quadrant, or extraversion if none
  const [selectedKey, setSelectedKey] = useState<string | null>(section.quadrant ?? 'extraversion');

  const activeQuadrant = selectedKey && selectedKey in quadrants ? quadrants[selectedKey] : null;
  const isExtraversion = selectedKey === 'extraversion';
  const isNeuroticism = selectedKey === 'neuroticism';
  const isLieScale = selectedKey === 'lie_scale';

  const topLeft: ScatterPlotQuadrant = {
    key: 'melancholic',
    label: quadrantLabels.melancholic ?? 'Melancholic',
    color: 'var(--danger-bg)',
  };
  const topRight: ScatterPlotQuadrant = {
    key: 'choleric',
    label: quadrantLabels.choleric ?? 'Choleric',
    color: 'var(--accent-soft)',
  };
  const bottomLeft: ScatterPlotQuadrant = {
    key: 'phlegmatic',
    label: quadrantLabels.phlegmatic ?? 'Phlegmatic',
    color: 'var(--brand-subtle)',
  };
  const bottomRight: ScatterPlotQuadrant = {
    key: 'sanguine',
    label: quadrantLabels.sanguine ?? 'Sanguine',
    color: 'var(--bg-raised)',
  };

  const extraversionBands: BandMark[] = [
    { label: extraversionLabels.deep_introvert ?? '', min: 0, max: 4 },
    { label: extraversionLabels.introvert ?? '', min: 5, max: 8 },
    { label: extraversionLabels.ambivert ?? '', min: 9, max: 14 },
    { label: extraversionLabels.extravert ?? '', min: 15, max: 19 },
  ];

  const neuroticismBands: BandMark[] = [
    { label: neuroticismLabels.low ?? '', min: 0, max: 8 },
    { label: neuroticismLabels.medium ?? '', min: 9, max: 13 },
    { label: neuroticismLabels.high ?? '', min: 14, max: 19 },
    { label: neuroticismLabels.very_high ?? '', min: 20, max: 24 },
  ];

  return (
    <AdminCard
      title={t('psychReport:eysenck.cardTitle')}
      description={t('psychReport:eysenck.cardDescription')}
    >
      <PsychTestHeaderInfo methodology={methodology} />

      {section.protocol_flagged && (
        <div
          role="alert"
          className="flex items-start gap-3 p-3 mb-3 rounded-[14px] border border-danger bg-danger-subtle"
        >
          <AlertTriangle size={15} className="text-danger flex-shrink-0 mt-0.5" />
          <p className={cn(ADMIN_TEXT, 'text-danger font-semibold m-0')}>
            {t('psychReport:eysenck.protocolFlagged', { score: section.lie_scale_raw })}
          </p>
        </div>
      )}

      {hasChart && (
        <div className="flex flex-col items-center gap-3 mb-3">
          <ScatterPlot
            x={section.extraversion_raw!}
            y={section.neuroticism_raw!}
            max={SCALE_MAX}
            quadrants={[topLeft, topRight, bottomLeft, bottomRight]}
            xLabel={t('psychReport:eysenck.extraversionAxis')}
            yLabel={t('psychReport:eysenck.neuroticismAxis')}
          />

          {section.quadrant && (
            <div className="w-full">
              <ScoreRow
                label={<span className={ADMIN_TEXT}>{t('psychReport:eysenck.quadrantRowLabel')}</span>}
                badge={
                  <AdminBadge tone="brand" dot>
                    {quadrantLabels[section.quadrant] ?? section.quadrant}
                  </AdminBadge>
                }
                isOpen={selectedKey === section.quadrant}
                onToggle={() =>
                  setSelectedKey(selectedKey === section.quadrant ? null : section.quadrant!)
                }
              >
                {activeQuadrant && (
                  <PsychDetailCard
                    bare
                    title={activeQuadrant.name}
                    badge={<AdminBadge tone="brand">{t('psychReport:eysenck.quadrantRowLabel')}</AdminBadge>}
                    meaning={activeQuadrant.meaning}
                    means={activeQuadrant.behavioralManifestation}
                    follows={activeQuadrant.psychologistFocus}
                    why={activeQuadrant.normsExplanation}
                    riskWarning={activeQuadrant.riskWarning}
                  />
                )}
              </ScoreRow>
            </div>
          )}
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        {section.extraversion_raw !== null && (
          <ScoreRow
            label={
              <span className={cn(ADMIN_META, isExtraversion && 'text-primary font-semibold')}>
                {t('psychReport:eysenck.extraversionAxis')}
              </span>
            }
            value={<span className={ADMIN_NUM}>{section.extraversion_raw}/{SCALE_MAX}</span>}
            badge={
              section.extraversion_level && (
                <AdminBadge tone={isExtraversion ? 'brand' : 'quiet'}>
                  {extraversionLabels[section.extraversion_level] ?? section.extraversion_level}
                </AdminBadge>
              )
            }
            isOpen={isExtraversion}
            onToggle={() => setSelectedKey(isExtraversion ? null : 'extraversion')}
          >
            <PsychDetailCard
              bare
              title={scales.extraversion?.name ?? ''}
              badge={
                section.extraversion_level ? (
                  <AdminBadge tone="brand">
                    {extraversionLabels[section.extraversion_level]}
                  </AdminBadge>
                ) : undefined
              }
              meaning={scales.extraversion?.description ?? ''}
              means={
                section.extraversion_level
                  ? scales.extraversion?.bands?.[section.extraversion_level]?.meaning ?? ''
                  : ''
              }
              follows={
                section.extraversion_level
                  ? scales.extraversion?.bands?.[section.extraversion_level]?.advice ?? ''
                  : ''
              }
              why={
                section.extraversion_level
                  ? scales.extraversion?.bands?.[section.extraversion_level]?.label ?? ''
                  : ''
              }
            >
              <PsychBandMeter
                value={section.extraversion_raw ?? 0}
                max={SCALE_MAX}
                bands={extraversionBands}
                label={scales.extraversion?.name}
              />
              {section.extraversion_evidence && (
                <div className="mt-3">
                  <BinaryEvidenceView evidence={section.extraversion_evidence} />
                </div>
              )}
            </PsychDetailCard>
          </ScoreRow>
        )}

        {section.neuroticism_raw !== null && (
          <ScoreRow
            label={
              <span className={cn(ADMIN_META, isNeuroticism && 'text-primary font-semibold')}>
                {t('psychReport:eysenck.neuroticismAxis')}
              </span>
            }
            value={<span className={ADMIN_NUM}>{section.neuroticism_raw}/{SCALE_MAX}</span>}
            badge={
              section.neuroticism_level && (
                <AdminBadge tone={isNeuroticism ? 'brand' : 'quiet'}>
                  {neuroticismLabels[section.neuroticism_level] ?? section.neuroticism_level}
                </AdminBadge>
              )
            }
            isOpen={isNeuroticism}
            onToggle={() => setSelectedKey(isNeuroticism ? null : 'neuroticism')}
          >
            <PsychDetailCard
              bare
              title={scales.neuroticism?.name ?? ''}
              badge={
                section.neuroticism_level ? (
                  <AdminBadge tone={section.neuroticism_level === 'very_high' ? 'danger' : 'brand'}>
                    {neuroticismLabels[section.neuroticism_level]}
                  </AdminBadge>
                ) : undefined
              }
              meaning={scales.neuroticism?.description ?? ''}
              means={
                section.neuroticism_level
                  ? scales.neuroticism?.bands?.[section.neuroticism_level]?.meaning ?? ''
                  : ''
              }
              follows={
                section.neuroticism_level
                  ? scales.neuroticism?.bands?.[section.neuroticism_level]?.advice ?? ''
                  : ''
              }
              why={
                section.neuroticism_level
                  ? scales.neuroticism?.bands?.[section.neuroticism_level]?.label ?? ''
                  : ''
              }
              riskWarning={
                section.neuroticism_level === 'high' || section.neuroticism_level === 'very_high'
                  ? scales.neuroticism?.bands?.[section.neuroticism_level]?.advice
                  : undefined
              }
            >
              <PsychBandMeter
                value={section.neuroticism_raw ?? 0}
                max={SCALE_MAX}
                bands={neuroticismBands}
                label={scales.neuroticism?.name}
              />
              {section.neuroticism_evidence && (
                <div className="mt-3">
                  <BinaryEvidenceView evidence={section.neuroticism_evidence} />
                </div>
              )}
            </PsychDetailCard>
          </ScoreRow>
        )}

        {section.lie_scale_raw !== null && (
          <ScoreRow
            label={
              <span className={cn(ADMIN_META, isLieScale && 'text-primary font-semibold')}>
                {t('psychReport:eysenck.lieScaleRowLabel')}
              </span>
            }
            value={<span className={ADMIN_NUM}>{section.lie_scale_raw}/9</span>}
            badge={
              <AdminBadge tone={section.protocol_flagged ? 'danger' : 'neutral'}>
                {section.protocol_flagged
                  ? scales.lie_scale?.bands?.flagged?.label
                  : scales.lie_scale?.bands?.valid?.label}
              </AdminBadge>
            }
            isOpen={isLieScale}
            onToggle={() => setSelectedKey(isLieScale ? null : 'lie_scale')}
          >
            <PsychDetailCard
              bare
              title={scales.lie_scale?.name ?? ''}
              badge={
                <AdminBadge tone={section.protocol_flagged ? 'danger' : 'neutral'}>
                  {section.protocol_flagged
                    ? scales.lie_scale?.bands?.flagged?.label
                    : scales.lie_scale?.bands?.valid?.label}
                </AdminBadge>
              }
              meaning={scales.lie_scale?.description ?? ''}
              means={
                section.protocol_flagged
                  ? scales.lie_scale?.bands?.flagged?.meaning ?? ''
                  : scales.lie_scale?.bands?.valid?.meaning ?? ''
              }
              follows={
                section.protocol_flagged
                  ? scales.lie_scale?.bands?.flagged?.advice ?? ''
                  : scales.lie_scale?.bands?.valid?.advice ?? ''
              }
              why={
                section.protocol_flagged
                  ? scales.lie_scale?.bands?.flagged?.label ?? ''
                  : scales.lie_scale?.bands?.valid?.label ?? ''
              }
              riskWarning={
                section.protocol_flagged
                  ? scales.lie_scale?.bands?.flagged?.advice
                  : undefined
              }
            >
              {section.lie_scale_evidence && <BinaryEvidenceView evidence={section.lie_scale_evidence} />}
            </PsychDetailCard>
          </ScoreRow>
        )}
      </div>
    </AdminCard>
  );
}
