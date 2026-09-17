import { useState } from 'react';
import { ChevronDown, Sparkles } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { AdminCard } from '@/shared/ui/admin/AdminSectionHeading';
import { AdminBadge } from '@/shared/ui/admin/AdminBadge';
import { ADMIN_META, ADMIN_NUM, ADMIN_TEXT } from '@/shared/ui/admin/density';
import type { ProfessionalTypesSection as ProfessionalTypesSectionData } from '@/shared/types';
import { RadarChart, type RadarChartAxis } from './RadarChart';
import { PsychTestHeaderInfo } from './PsychTestHeaderInfo';
import { PsychDetailCard } from './PsychDetailCard';
import {
  DDO_METHODOLOGY,
  DDO_TYPES,
  DDO_DISSONANCE_NOTE,
} from '../model/psychTestExplanations';

const AXES: RadarChartAxis[] = [
  { key: 'practical', label: 'Ч-П' },
  { key: 'technical', label: 'Ч-Т' },
  { key: 'social', label: 'Ч-Ч' },
  { key: 'sign', label: 'Ч-З' },
  { key: 'artistic', label: 'Ч-Х' },
];

const SCALE_LABELS: Record<string, string> = {
  practical: 'Человек-природа',
  technical: 'Человек-техника',
  social: 'Человек-человек',
  sign: 'Человек-знак',
  artistic: 'Человек-худ. образ',
};

const INTEREST_MAX = 8;
const ABILITIES_MAX = 3;

function interestBand(score: number): { label: string; tone: 'quiet' | 'brand' } {
  if (score >= 8) return { label: 'повышенный', tone: 'brand' };
  if (score >= 4) return { label: 'средний', tone: 'quiet' };
  return { label: 'слабый', tone: 'quiet' };
}

/**
 * ДДО «Профессиональные типы» — Radar Chart, два наложенных полигона
 * (интересы / способности), 5 осей + интерактивное раскрытие сущностей по модели RIASEC.
 */
export function ProfessionalTypesSection({ section }: { section: ProfessionalTypesSectionData | null }) {
  if (!section) return null;
  const { interest_scores, abilities_scores, hybrid_profile } = section;
  const hasChart = Boolean(interest_scores || abilities_scores);

  // Find the top interest type to open as default, or practical
  const topTypeKey = interest_scores
    ? Object.entries(interest_scores).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'social'
    : 'social';

  const [selectedKey, setSelectedKey] = useState<string | null>(topTypeKey);

  const selectedTypeInfo = selectedKey && selectedKey in DDO_TYPES ? DDO_TYPES[selectedKey] : null;

  const currentInterest = selectedKey && interest_scores ? interest_scores[selectedKey] ?? 0 : 0;
  const currentAbility = selectedKey && abilities_scores ? abilities_scores[selectedKey] ?? 0 : 0;

  // Evaluate want vs can balance for the active type
  // Interest is 0-8 (scale of 8), ability is 0-3 (scale of 3)
  const interestRatio = currentInterest / INTEREST_MAX;
  const abilityRatio = currentAbility / ABILITIES_MAX;
  const balanceDifference = interestRatio - abilityRatio;

  let balanceComment = DDO_DISSONANCE_NOTE.balanced;
  if (balanceDifference > 0.25) {
    balanceComment = DDO_DISSONANCE_NOTE.interestHigher;
  } else if (balanceDifference < -0.25) {
    balanceComment = DDO_DISSONANCE_NOTE.abilitiesHigher;
  }

  return (
    <AdminCard title="Профессиональные типы" description="ДДО Климова + Йовайши/Резапкина">
      <PsychTestHeaderInfo methodology={DDO_METHODOLOGY} />

      {hybrid_profile && hybrid_profile.length === 2 && (
        <div className="p-3 mb-3 rounded-[12px] bg-brand-subtle/70 border border-brand/30 flex items-start gap-2.5">
          <Sparkles size={16} className="text-brand flex-shrink-0 mt-0.5" />
          <div className={ADMIN_TEXT}>
            <p className="font-semibold text-primary m-0">
              Гибридный профиль:{' '}
              <span className="text-brand">
                {SCALE_LABELS[hybrid_profile[0]] ?? hybrid_profile[0]} + {SCALE_LABELS[hybrid_profile[1]] ?? hybrid_profile[1]}
              </span>
            </p>
            <p className="text-secondary m-0 mt-0.5 leading-snug">
              Две ведущие шкалы набрали близкие баллы (разница ≤ 1). На приёме рекомендуется обсуждать синтетические и междисциплинарные специальности на стыке этих двух направлений.
            </p>
          </div>
        </div>
      )}

      {hasChart && (
        <div className="flex flex-col items-center gap-3 mb-3">
          <RadarChart
            axes={AXES}
            series={[
              ...(interest_scores
                ? [{ key: 'interest', label: 'Интересы («Хочу»)', color: 'var(--brand)', values: interest_scores, max: INTEREST_MAX }]
                : []),
              ...(abilities_scores
                ? [{ key: 'abilities', label: 'Способности («Могу»)', color: 'var(--accent)', values: abilities_scores, max: ABILITIES_MAX }]
                : []),
            ]}
          />
          <div className="flex items-center gap-4">
            {interest_scores && (
              <span className={cn(ADMIN_META, 'inline-flex items-center gap-1.5')}>
                <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: 'var(--brand)' }} />
                Интересы («Хочу», макс 8)
              </span>
            )}
            {abilities_scores && (
              <span className={cn(ADMIN_META, 'inline-flex items-center gap-1.5')}>
                <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: 'var(--accent)' }} />
                Способности («Могу», макс 3)
              </span>
            )}
          </div>
        </div>
      )}

      {interest_scores && (
        <ul className="m-0 p-0 list-none flex flex-col gap-1.5">
          {AXES.map((axis) => {
            const score = interest_scores[axis.key] ?? 0;
            const band = interestBand(score);
            const ability = abilities_scores?.[axis.key];
            const isSelected = selectedKey === axis.key;

            return (
              <li key={axis.key}>
                <button
                  type="button"
                  onClick={() => setSelectedKey(isSelected ? null : axis.key)}
                  className={cn(
                    'w-full flex items-center justify-between gap-2 p-2 rounded-[10px] text-left transition-colors focus:outline-none',
                    isSelected ? 'bg-brand-subtle/70 ring-1 ring-brand/30' : 'hover:bg-raised/70',
                  )}
                >
                  <span className="flex items-center gap-2">
                    <span className={cn(ADMIN_TEXT, isSelected && 'font-semibold text-primary')}>
                      {SCALE_LABELS[axis.key]}
                    </span>
                    <ChevronDown size={13} className={cn('text-muted transition-transform', isSelected && 'rotate-180')} />
                  </span>
                  <span className="flex items-center gap-2">
                    <span className={ADMIN_NUM}>
                      {score}/{INTEREST_MAX}
                      {ability !== undefined && <span className={ADMIN_META}> · сп. {ability}/{ABILITIES_MAX}</span>}
                    </span>
                    <AdminBadge tone={isSelected ? 'brand' : band.tone}>{band.label}</AdminBadge>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {/* Expanded RIASEC-style Detail Card */}
      {selectedTypeInfo && (
        <PsychDetailCard
          title={selectedTypeInfo.name}
          badge={<AdminBadge tone="brand">{selectedTypeInfo.shortName}</AdminBadge>}
          meaning={selectedTypeInfo.meaning}
          means={selectedTypeInfo.behavioralManifestation}
          follows={selectedTypeInfo.psychologistFocus}
          why={`Выбор в ${currentInterest} из 8 пар интересов. Самооценка способностей: ${currentAbility} из 3.`}
          riskWarning={selectedTypeInfo.riskWarning}
          onClose={() => setSelectedKey(null)}
        >
          <div className="p-3 rounded-[10px] bg-[color-mix(in_srgb,var(--paper)_80%,transparent)] border border-default/60">
            <p className="font-sans text-caption font-bold uppercase tracking-label text-primary m-0 mb-1">
              Баланс «Хочу vs Могу»
            </p>
            <p className={cn(ADMIN_TEXT, 'text-muted m-0 leading-snug')}>
              {balanceComment}
            </p>
          </div>
        </PsychDetailCard>
      )}
    </AdminCard>
  );
}
