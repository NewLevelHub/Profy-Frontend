import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Sparkles } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { AdminCard } from '@/shared/ui/admin/AdminSectionHeading';
import { AdminBadge } from '@/shared/ui/admin/AdminBadge';
import { ADMIN_META, ADMIN_NUM, ADMIN_TEXT } from '@/shared/ui/admin/density';
import type { ProfessionalTypesSection as ProfessionalTypesSectionData } from '@/shared/types';
import { RadarChart, type RadarChartAxis } from './RadarChart';
import { PsychTestHeaderInfo } from './PsychTestHeaderInfo';
import { PsychDetailCard } from './PsychDetailCard';
import { PairEvidenceView } from './AnswerEvidence';
import { ScoreRow } from './ScoreRow';
import {
  getDdoMethodology,
  getDdoTypes,
  getDdoDissonanceNote,
} from '../model/psychTestExplanations';

const INTEREST_MAX = 8;
const ABILITIES_MAX = 3;

/**
 * DDO "Professional Types" — Radar Chart, two overlapping polygons
 * (interests / abilities), 5 axes + interactive RIASEC entity detail.
 */
export function ProfessionalTypesSection({ section }: { section: ProfessionalTypesSectionData | null }) {
  const { t } = useTranslation('psychReport');
  if (!section) return null;

  const methodology = getDdoMethodology(t);
  const types = getDdoTypes(t);
  const dissonanceNote = getDdoDissonanceNote(t);

  const scaleLabels: Record<string, string> = Object.fromEntries(
    Object.entries(types).map(([k, v]) => [k, v.name]),
  );
  const bandLabels = (t('psychReport:ddo.bandLabels', {
    returnObjects: true,
  }) || {}) as Record<string, string>;
  const axesShort = (t('psychReport:ddo.axesShort', {
    returnObjects: true,
  }) || {}) as Record<string, string>;

  const axes: RadarChartAxis[] = [
    { key: 'practical', label: axesShort.practical ?? 'practical' },
    { key: 'technical', label: axesShort.technical ?? 'technical' },
    { key: 'social', label: axesShort.social ?? 'social' },
    { key: 'sign', label: axesShort.sign ?? 'sign' },
    { key: 'artistic', label: axesShort.artistic ?? 'artistic' },
  ];

  function interestBand(score: number): { label: string; tone: 'quiet' | 'brand' } {
    if (score >= 8) return { label: bandLabels.high ?? '', tone: 'brand' };
    if (score >= 4) return { label: bandLabels.medium ?? '', tone: 'quiet' };
    return { label: bandLabels.weak ?? '', tone: 'quiet' };
  }

  const { interest_scores, abilities_scores, hybrid_profile, interest_evidence, abilities_evidence } = section;
  const hasChart = Boolean(interest_scores || abilities_scores);

  // Find the top interest type to open as default, or practical
  const topTypeKey = interest_scores
    ? Object.entries(interest_scores).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'social'
    : 'social';

  const [selectedKey, setSelectedKey] = useState<string | null>(topTypeKey);

  return (
    <AdminCard title={t('psychReport:ddo.cardTitle')} description={t('psychReport:ddo.cardDescription')}>
      <PsychTestHeaderInfo methodology={methodology} />

      {hybrid_profile && hybrid_profile.length === 2 && (
        <div className="p-3 mb-3 rounded-[12px] bg-brand-subtle/70 border border-brand/30 flex items-start gap-2.5">
          <Sparkles size={16} className="text-brand flex-shrink-0 mt-0.5" />
          <div className={ADMIN_TEXT}>
            <p className="font-semibold text-primary m-0">
              {t('psychReport:ddo.hybridProfile')}{' '}
              <span className="text-brand">
                {scaleLabels[hybrid_profile[0]] ?? hybrid_profile[0]} + {scaleLabels[hybrid_profile[1]] ?? hybrid_profile[1]}
              </span>
            </p>
            <p className="text-secondary m-0 mt-0.5 leading-snug">
              {t('psychReport:ddo.hybridProfileNote')}
            </p>
          </div>
        </div>
      )}

      {hasChart && (
        <div className="flex flex-col items-center gap-3 mb-3">
          <RadarChart
            axes={axes}
            series={[
              ...(interest_scores
                ? [{ key: 'interest', label: t('psychReport:ddo.interestLegend'), color: 'var(--brand)', values: interest_scores, max: INTEREST_MAX }]
                : []),
              ...(abilities_scores
                ? [{ key: 'abilities', label: t('psychReport:ddo.abilitiesLegend'), color: 'var(--accent)', values: abilities_scores, max: ABILITIES_MAX }]
                : []),
            ]}
          />
          <div className="flex items-center gap-4">
            {interest_scores && (
              <span className={cn(ADMIN_META, 'inline-flex items-center gap-1.5')}>
                <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: 'var(--brand)' }} />
                {t('psychReport:ddo.interestSubLegend')}
              </span>
            )}
            {abilities_scores && (
              <span className={cn(ADMIN_META, 'inline-flex items-center gap-1.5')}>
                <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: 'var(--accent)' }} />
                {t('psychReport:ddo.abilitiesSubLegend')}
              </span>
            )}
          </div>
        </div>
      )}

      {interest_scores && (
        <div className="flex flex-col gap-1.5">
          {axes.map((axis) => {
            const score = interest_scores[axis.key] ?? 0;
            const band = interestBand(score);
            const ability = abilities_scores?.[axis.key];
            const isSelected = selectedKey === axis.key;
            const info = axis.key in types ? types[axis.key] : null;
            const interestRatio = score / INTEREST_MAX;
            const abilityRatio = (ability ?? 0) / ABILITIES_MAX;
            const diff = interestRatio - abilityRatio;
            const comment =
              diff > 0.25
                ? dissonanceNote.interestHigher
                : diff < -0.25
                  ? dissonanceNote.abilitiesHigher
                  : dissonanceNote.balanced;

            return (
              <ScoreRow
                key={axis.key}
                label={<span className={cn(ADMIN_TEXT, isSelected && 'font-semibold text-primary')}>{scaleLabels[axis.key] ?? axis.key}</span>}
                value={
                  <span className={ADMIN_NUM}>
                    {score}/{INTEREST_MAX}
                    {ability !== undefined && <span className={ADMIN_META}> · {ability}/{ABILITIES_MAX}</span>}
                  </span>
                }
                badge={<AdminBadge tone={isSelected ? 'brand' : band.tone}>{band.label}</AdminBadge>}
                isOpen={isSelected}
                onToggle={() => setSelectedKey(isSelected ? null : axis.key)}
              >
                {info && (
                  <PsychDetailCard
                    bare
                    title={info.name}
                    badge={<AdminBadge tone="brand">{info.shortName ?? info.name}</AdminBadge>}
                    meaning={info.meaning}
                    means={info.behavioralManifestation}
                    follows={info.psychologistFocus}
                    why={info.normsExplanation}
                    riskWarning={info.riskWarning}
                  >
                    <div className="p-3 rounded-[10px] bg-[color-mix(in_srgb,var(--paper)_80%,transparent)] border border-default/60">
                      <p className="font-sans text-caption font-bold uppercase tracking-label text-primary m-0 mb-1">
                        {dissonanceNote.title}
                      </p>
                      <p className={cn(ADMIN_TEXT, 'text-muted m-0 leading-snug')}>{comment}</p>
                    </div>
                    {interest_evidence?.[axis.key] && (
                      <div className="mt-3">
                        <PairEvidenceView evidence={interest_evidence[axis.key]} scaleLabel={scaleLabels[axis.key] ?? axis.key} />
                      </div>
                    )}
                    {abilities_evidence?.[axis.key] && (
                      <p className={cn(ADMIN_TEXT, 'text-muted m-0 mt-3 leading-snug')}>
                        {t('psychReport:evidence.abilitiesAnswer', {
                          text: abilities_evidence[axis.key].text,
                          value: abilities_evidence[axis.key].value,
                          max: ABILITIES_MAX,
                        })}
                      </p>
                    )}
                  </PsychDetailCard>
                )}
              </ScoreRow>
            );
          })}
        </div>
      )}
    </AdminCard>
  );
}
