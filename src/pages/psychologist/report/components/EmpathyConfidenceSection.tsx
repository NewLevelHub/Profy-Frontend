import { useState } from 'react';
import { ChevronDown, ShieldAlert } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { AdminCard } from '@/shared/ui/admin/AdminSectionHeading';
import { AdminBadge, type AdminBadgeTone } from '@/shared/ui/admin/AdminBadge';
import { ADMIN_META, ADMIN_NUM, ADMIN_TEXT } from '@/shared/ui/admin/density';
import type { EmpathyConfidenceSection as EmpathyConfidenceSectionData } from '@/shared/types';
import { PolarAreaChart, type PolarAreaSector } from './PolarAreaChart';
import { StenProgressBar } from './StenProgressBar';
import { PsychTestHeaderInfo } from './PsychTestHeaderInfo';
import { PsychDetailCard } from './PsychDetailCard';
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
  const { empathy_channels, empathy_total, empathy_level, confidence_stens, confidence_level } = section;

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

  const selectedChannelInfo = selectedKey && selectedKey in BOYKO_CHANNELS ? BOYKO_CHANNELS[selectedKey] : null;
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
          <div className="flex items-center gap-2">
            {empathy_total !== null && (
              <span className={cn(ADMIN_NUM, 'text-primary')}>
                Итого: {empathy_total}/36
              </span>
            )}
            {empathy_level && (
              <button
                type="button"
                onClick={() => setSelectedKey(isTotalEmpathy ? null : 'total_empathy')}
                className="inline-flex items-center gap-1 group focus:outline-none"
              >
                <AdminBadge tone={EMPATHY_LEVEL_TONES[empathy_level] ?? 'neutral'}>
                  {EMPATHY_LEVEL_LABELS[empathy_level] ?? empathy_level}
                </AdminBadge>
                <ChevronDown size={13} className={cn('text-muted transition-transform', isTotalEmpathy && 'rotate-180')} />
              </button>
            )}
          </div>

          <ul className="m-0 p-0 list-none flex flex-col gap-1 w-full max-w-[320px]">
            {sectors.map((sector) => {
              const isSelected = selectedKey === sector.key;
              return (
                <li key={sector.key}>
                  <button
                    type="button"
                    onClick={() => setSelectedKey(isSelected ? null : sector.key)}
                    className={cn(
                      'w-full flex items-center justify-between gap-2 p-1.5 rounded-[8px] text-left transition-colors focus:outline-none',
                      isSelected ? 'bg-brand-subtle ring-1 ring-brand/30' : 'hover:bg-raised/70',
                    )}
                  >
                    <span className="flex items-center gap-1.5">
                      <span className={cn(ADMIN_META, isSelected && 'text-primary font-medium')}>
                        {CHANNEL_LABELS[sector.key] ?? sector.key}
                      </span>
                      <ChevronDown size={12} className={cn('text-muted transition-transform', isSelected && 'rotate-180')} />
                    </span>
                    <span className={cn(ADMIN_NUM, isSelected && 'font-bold text-brand')}>
                      {sector.value}/{CHANNEL_MAX}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {confidence_stens !== null && (
        <div className="pt-3 border-t border-default">
          <button
            type="button"
            onClick={() => setSelectedKey(isConfidence ? null : 'confidence')}
            className={cn(
              'w-full flex items-center justify-between gap-2 p-1.5 rounded-[8px] mb-2 text-left transition-colors focus:outline-none',
              isConfidence ? 'bg-brand-subtle ring-1 ring-brand/30' : 'hover:bg-raised/50',
            )}
          >
            <span className="flex items-center gap-1.5">
              <span className={cn(ADMIN_TEXT, 'font-medium', isConfidence && 'text-brand font-semibold')}>
                Социальная уверенность (Кондаш)
              </span>
              <ChevronDown size={13} className={cn('text-muted transition-transform', isConfidence && 'rotate-180')} />
            </span>
            <div className="flex items-center gap-2">
              <span className={ADMIN_NUM}>{confidence_stens} стен</span>
              {confidence_level && (
                <AdminBadge tone={CONFIDENCE_LEVEL_TONES[confidence_level] ?? 'neutral'}>
                  {CONFIDENCE_LEVEL_LABELS[confidence_level] ?? confidence_level}
                </AdminBadge>
              )}
            </div>
          </button>
          <StenProgressBar value={confidence_stens} min={1} max={10} normativeFrom={4} normativeTo={6} />
        </div>
      )}

      {/* Expanded RIASEC-style Detail Card */}
      {selectedChannelInfo && (
        <PsychDetailCard
          title={selectedChannelInfo.name}
          badge={<AdminBadge tone="brand">Канал эмпатии</AdminBadge>}
          meaning={selectedChannelInfo.meaning}
          means={selectedChannelInfo.behavioralManifestation}
          follows={selectedChannelInfo.psychologistFocus}
          why={`Балл ученика: ${empathy_channels?.[selectedKey!] ?? 0} из ${CHANNEL_MAX}. ${selectedChannelInfo.normsExplanation ?? ''}`}
          riskWarning={selectedChannelInfo.riskWarning}
          onClose={() => setSelectedKey(null)}
        />
      )}

      {isTotalEmpathy && empathy_level && (
        <PsychDetailCard
          title={`Общий уровень эмпатии: ${EMPATHY_LEVEL_LABELS[empathy_level]}`}
          badge={<AdminBadge tone={EMPATHY_LEVEL_TONES[empathy_level]}>{EMPATHY_LEVEL_LABELS[empathy_level]}</AdminBadge>}
          meaning={BOYKO_TOTAL_LEVELS[empathy_level]?.meaning ?? ''}
          means={BOYKO_TOTAL_LEVELS[empathy_level]?.meaning ?? ''}
          follows={BOYKO_TOTAL_LEVELS[empathy_level]?.advice ?? ''}
          why={`Суммарный балл по всем 6 каналам: ${empathy_total}/36. В авторской шкале Бойко уровни: 0–14 (очень низкий), 15–21 (заниженный), 22–29 (средний), 30–36 (очень высокий).`}
          onClose={() => setSelectedKey(null)}
        />
      )}

      {isConfidence && confidence_level && (
        <PsychDetailCard
          title={`Социальная уверенность: ${CONFIDENCE_LEVEL_LABELS[confidence_level]}`}
          badge={<AdminBadge tone={CONFIDENCE_LEVEL_TONES[confidence_level]}>{confidence_stens} стен</AdminBadge>}
          meaning={KONDASH_LEVELS[confidence_level]?.meaning ?? ''}
          means={KONDASH_LEVELS[confidence_level]?.meaning ?? ''}
          follows={KONDASH_LEVELS[confidence_level]?.advice ?? ''}
          why={`Шкала межличностной тревожности А.М. Прихожан (по Кондашу) инвертирована в показатель уверенности в диапазоне 1–10 стенов. Стены 4–6 — нормативный возрастной диапазон, стены 1–3 — раскованность/высокая уверенность, стены 7–10 — повышенная тревожность в контактах.`}
          riskWarning={
            confidence_level === 'low'
              ? 'Страх публичных ответов у доски, скованность перед незнакомыми, чувствительность к оценке окружающих. Требуется постепенная адаптация без стресса.'
              : undefined
          }
          onClose={() => setSelectedKey(null)}
        />
      )}
    </AdminCard>
  );
}
