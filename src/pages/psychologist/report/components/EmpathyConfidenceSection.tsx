import { useState } from 'react';
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
  BOYKO_KONDASH_METHODOLOGY,
  BOYKO_CHANNELS,
  BOYKO_TOTAL_LEVELS,
  KONDASH_LEVELS,
} from '../model/psychTestExplanations';

const CHANNEL_LABELS: Record<string, string> = {
  rational: 'Рациональный канал',
  emotional: 'Эмоциональный канал',
  intuitive: 'Интуитивный канал',
  attitudes: 'Установки к эмпатии',
  penetration: 'Проникающая способность',
  identification: 'Идентификация',
};

const CHANNEL_ORDER = ['rational', 'emotional', 'intuitive', 'attitudes', 'penetration', 'identification'];

const CHANNEL_SHORT_LABELS: Record<string, string> = {
  rational: 'Рацион.',
  emotional: 'Эмоц.',
  intuitive: 'Интуит.',
  attitudes: 'Установки',
  penetration: 'Проникн.',
  identification: 'Идентиф.',
};

const EMPATHY_LEVEL_LABELS: Record<string, string> = {
  very_low: 'Очень низкая',
  underestimated: 'Заниженная',
  average: 'Средняя',
  very_high: 'Очень высокая',
};

const EMPATHY_LEVEL_TONES: Record<string, AdminBadgeTone> = {
  very_low: 'danger',
  underestimated: 'quiet',
  average: 'quiet',
  very_high: 'brand',
};

const CONFIDENCE_LEVEL_LABELS: Record<string, string> = {
  high: 'Высокая уверенность',
  normative: 'Нормативный диапазон',
  low: 'Низкая уверенность',
};

const CONFIDENCE_LEVEL_TONES: Record<string, AdminBadgeTone> = {
  high: 'brand',
  normative: 'quiet',
  low: 'danger',
};

const CHANNEL_MAX = 6;

/**
 * Бойко «Эмпатия» + Кондаш «Соц. уверенность» с подробным раскрытием каналов
 * и перекрёстной интерпретации для психолога.
 */
export function EmpathyConfidenceSection({ section }: { section: EmpathyConfidenceSectionData | null }) {
  if (!section) return null;
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
        label: CHANNEL_SHORT_LABELS[key] ?? key,
        value: empathy_channels[key],
      }))
    : null;

  const isHighEmpathy = empathy_level === 'average' || empathy_level === 'very_high';
  const isLowConfidence = confidence_level === 'low';
  const showVulnerabilityWarning = isHighEmpathy && isLowConfidence;

  const isTotalEmpathy = selectedKey === 'total_empathy';
  const isConfidence = selectedKey === 'confidence';

  return (
    <AdminCard title="Эмпатия и уверенность" description="Бойко + Кондаш/Прихожан">
      <PsychTestHeaderInfo methodology={BOYKO_KONDASH_METHODOLOGY} />

      {showVulnerabilityWarning && (
        <div className="p-3 mb-3 rounded-[12px] bg-danger-subtle border border-danger/30 flex items-start gap-2.5">
          <ShieldAlert size={16} className="text-danger flex-shrink-0 mt-0.5" />
          <div className={ADMIN_TEXT}>
            <p className="font-semibold text-danger m-0">
              Внимание: чувствительность при низкой социальной уверенности
            </p>
            <p className="text-danger m-0 mt-0.5 leading-snug">
              Ученик глубоко считывает чужие эмоции, но испытывает тревожность в общении. Высокий риск угодничества, страха отказать и подавления собственных потребностей. Рекомендуется тренинг ассертивности и защиты личных границ.
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
                label={<span className={ADMIN_TEXT}>Итого по всем каналам</span>}
                value={empathy_total !== null && <span className={cn(ADMIN_NUM, 'text-primary')}>{empathy_total}/36</span>}
                badge={<AdminBadge tone={EMPATHY_LEVEL_TONES[empathy_level] ?? 'neutral'}>{EMPATHY_LEVEL_LABELS[empathy_level] ?? empathy_level}</AdminBadge>}
                isOpen={isTotalEmpathy}
                onToggle={() => setSelectedKey(isTotalEmpathy ? null : 'total_empathy')}
              >
                <PsychDetailCard
                  bare
                  title={`Общий уровень эмпатии: ${EMPATHY_LEVEL_LABELS[empathy_level]}`}
                  badge={<AdminBadge tone={EMPATHY_LEVEL_TONES[empathy_level]}>{EMPATHY_LEVEL_LABELS[empathy_level]}</AdminBadge>}
                  meaning={BOYKO_TOTAL_LEVELS[empathy_level]?.meaning ?? ''}
                  means={BOYKO_TOTAL_LEVELS[empathy_level]?.meaning ?? ''}
                  follows={BOYKO_TOTAL_LEVELS[empathy_level]?.advice ?? ''}
                  why={`Разбивка по каналам: ${sectors.map((s) => `${CHANNEL_LABELS[s.key] ?? s.key} — ${s.value}/${CHANNEL_MAX}`).join(', ')}. Сумма: ${empathy_total}/36 (уровень «${EMPATHY_LEVEL_LABELS[empathy_level]}»).`}
                />
              </ScoreRow>
            </div>
          )}

          <div className="flex flex-col gap-1 w-full">
            {sectors.map((sector) => {
              const isSelected = selectedKey === sector.key;
              const info = sector.key in BOYKO_CHANNELS ? BOYKO_CHANNELS[sector.key] : null;
              return (
                <ScoreRow
                  key={sector.key}
                  label={<span className={cn(ADMIN_META, isSelected && 'text-primary font-medium')}>{CHANNEL_LABELS[sector.key] ?? sector.key}</span>}
                  value={<span className={cn(ADMIN_NUM, isSelected && 'font-bold text-brand')}>{sector.value}/{CHANNEL_MAX}</span>}
                  isOpen={isSelected}
                  onToggle={() => setSelectedKey(isSelected ? null : sector.key)}
                >
                  {info && (
                    <PsychDetailCard
                      bare
                      title={info.name}
                      badge={<AdminBadge tone="brand">Канал эмпатии</AdminBadge>}
                      meaning={info.meaning}
                      means={info.behavioralManifestation}
                      follows={info.psychologistFocus}
                      why={`Балл ученика: ${sector.value} из ${CHANNEL_MAX}. ${info.normsExplanation ?? ''}`}
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
          <p className={cn(ADMIN_TEXT, 'font-medium text-primary mb-2')}>Социальная уверенность (Кондаш)</p>
          <StenProgressBar value={confidence_stens} min={1} max={10} normativeFrom={4} normativeTo={6} />
          <div className="mt-2.5">
            <ScoreRow
              label={<span className={ADMIN_TEXT}>Разбор результата</span>}
              value={<span className={ADMIN_NUM}>{confidence_stens} стен</span>}
              badge={
                confidence_level && (
                  <AdminBadge tone={CONFIDENCE_LEVEL_TONES[confidence_level] ?? 'neutral'}>
                    {CONFIDENCE_LEVEL_LABELS[confidence_level] ?? confidence_level}
                  </AdminBadge>
                )
              }
              isOpen={isConfidence}
              onToggle={() => setSelectedKey(isConfidence ? null : 'confidence')}
            >
              {confidence_level && (
                <PsychDetailCard
                  bare
                  title={`Социальная уверенность: ${CONFIDENCE_LEVEL_LABELS[confidence_level]}`}
                  badge={<AdminBadge tone={CONFIDENCE_LEVEL_TONES[confidence_level]}>{confidence_stens} стен</AdminBadge>}
                  meaning={KONDASH_LEVELS[confidence_level]?.meaning ?? ''}
                  means={KONDASH_LEVELS[confidence_level]?.meaning ?? ''}
                  follows={KONDASH_LEVELS[confidence_level]?.advice ?? ''}
                  why={`Результат респондента: ${confidence_stens} из 10 стенов (нормативный диапазон — 4–6 стенов).`}
                  riskWarning={
                    confidence_level === 'low'
                      ? 'Страх публичных ответов у доски, скованность перед незнакомыми, чувствительность к оценке окружающих. Требуется постепенная адаптация без стресса.'
                      : undefined
                  }
                >
                  {confidence_evidence && (
                    <RatedEvidenceView
                      evidence={confidence_evidence}
                      valueLabels={['0 — совсем не тревожит', '1', '2', '3', '4 — очень тревожит']}
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
