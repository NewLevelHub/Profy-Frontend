import { useState } from 'react';
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
  EYSENCK_METHODOLOGY,
  TEMPERAMENT_QUADRANTS,
  EYSENCK_SCALES,
} from '../model/psychTestExplanations';

const EXTRAVERSION_LABELS: Record<string, string> = {
  deep_introvert: 'Глубокий интроверт',
  introvert: 'Интроверт',
  ambivert: 'Амбиверт',
  extravert: 'Экстраверт',
  bright_extravert: 'Яркий экстраверт',
};

const NEUROTICISM_LABELS: Record<string, string> = {
  low: 'Низкий (эмоц. устойчивость)',
  medium: 'Средний',
  high: 'Высокий',
  very_high: 'Очень высокий',
};

const QUADRANT_LABELS: Record<string, string> = {
  choleric: 'Холерик',
  sanguine: 'Сангвиник',
  phlegmatic: 'Флегматик',
  melancholic: 'Меланхолик',
};

const SCALE_MAX = 24;

const TOP_LEFT: ScatterPlotQuadrant = { key: 'melancholic', label: 'Меланхолик', color: 'var(--danger-bg)' };
const TOP_RIGHT: ScatterPlotQuadrant = { key: 'choleric', label: 'Холерик', color: 'var(--accent-soft)' };
const BOTTOM_LEFT: ScatterPlotQuadrant = { key: 'phlegmatic', label: 'Флегматик', color: 'var(--brand-subtle)' };
const BOTTOM_RIGHT: ScatterPlotQuadrant = { key: 'sanguine', label: 'Сангвиник', color: 'var(--bg-raised)' };

const EXTRAVERSION_BANDS: BandMark[] = [
  { label: 'Гл. интроверт', min: 0, max: 4 },
  { label: 'Интроверт', min: 5, max: 8 },
  { label: 'Амбиверт', min: 9, max: 14 },
  { label: 'Экстраверт', min: 15, max: 19 },
];

const NEUROTICISM_BANDS: BandMark[] = [
  { label: 'Низкий', min: 0, max: 8 },
  { label: 'Средний', min: 9, max: 13 },
  { label: 'Высокий', min: 14, max: 19 },
  { label: 'Очень высокий', min: 20, max: 24 },
];

export function TemperamentSection({ section }: { section: TemperamentSectionData | null }) {
  if (!section) return null;
  const hasChart = section.extraversion_raw !== null && section.neuroticism_raw !== null;

  // Initial active view: the student's quadrant, or extraversion if none
  const [selectedKey, setSelectedKey] = useState<string | null>(section.quadrant ?? 'extraversion');

  const activeQuadrant = selectedKey && selectedKey in TEMPERAMENT_QUADRANTS ? TEMPERAMENT_QUADRANTS[selectedKey] : null;
  const isExtraversion = selectedKey === 'extraversion';
  const isNeuroticism = selectedKey === 'neuroticism';
  const isLieScale = selectedKey === 'lie_scale';

  return (
    <AdminCard title="Темперамент" description="Eysenck EPI (адапт. Шмелева)">
      <PsychTestHeaderInfo methodology={EYSENCK_METHODOLOGY} />

      {section.protocol_flagged && (
        <div
          role="alert"
          className="flex items-start gap-3 p-3 mb-3 rounded-[14px] border border-danger bg-danger-subtle"
        >
          <AlertTriangle size={15} className="text-danger flex-shrink-0 mt-0.5" />
          <p className={cn(ADMIN_TEXT, 'text-danger font-semibold m-0')}>
            Протокол под вопросом — шкала лжи выше нормы ({section.lie_scale_raw}/9), интерпретировать результаты с осторожностью.
          </p>
        </div>
      )}

      {hasChart && (
        <div className="flex flex-col items-center gap-3 mb-3">
          <ScatterPlot
            x={section.extraversion_raw!}
            y={section.neuroticism_raw!}
            max={SCALE_MAX}
            quadrants={[TOP_LEFT, TOP_RIGHT, BOTTOM_LEFT, BOTTOM_RIGHT]}
            xLabel="Экстраверсия"
            yLabel="Нейротизм"
          />

          {section.quadrant && (
            <div className="w-full">
              <ScoreRow
                label={<span className={ADMIN_TEXT}>Тип темперамента</span>}
                badge={<AdminBadge tone="brand" dot>{QUADRANT_LABELS[section.quadrant] ?? section.quadrant}</AdminBadge>}
                isOpen={selectedKey === section.quadrant}
                onToggle={() => setSelectedKey(selectedKey === section.quadrant ? null : section.quadrant!)}
              >
                {activeQuadrant && (
                  <PsychDetailCard
                    bare
                    title={activeQuadrant.name}
                    badge={<AdminBadge tone="brand">Тип темперамента</AdminBadge>}
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
            label={<span className={cn(ADMIN_META, isExtraversion && 'text-primary font-semibold')}>Экстраверсия</span>}
            value={<span className={ADMIN_NUM}>{section.extraversion_raw}/{SCALE_MAX}</span>}
            badge={
              section.extraversion_level && (
                <AdminBadge tone={isExtraversion ? 'brand' : 'quiet'}>
                  {EXTRAVERSION_LABELS[section.extraversion_level] ?? section.extraversion_level}
                </AdminBadge>
              )
            }
            isOpen={isExtraversion}
            onToggle={() => setSelectedKey(isExtraversion ? null : 'extraversion')}
          >
            <PsychDetailCard
              bare
              title={EYSENCK_SCALES.extraversion.name}
              badge={
                section.extraversion_level ? (
                  <AdminBadge tone="brand">{EXTRAVERSION_LABELS[section.extraversion_level]}</AdminBadge>
                ) : undefined
              }
              meaning={EYSENCK_SCALES.extraversion.description}
              means={
                section.extraversion_level
                  ? EYSENCK_SCALES.extraversion.bands[section.extraversion_level]?.meaning ?? ''
                  : ''
              }
              follows={
                section.extraversion_level
                  ? EYSENCK_SCALES.extraversion.bands[section.extraversion_level]?.advice ?? ''
                  : ''
              }
              why={`Ученик набрал ${section.extraversion_raw} из ${SCALE_MAX} баллов по шкале экстраверсии, что классифицирует его как «${section.extraversion_level ? EXTRAVERSION_LABELS[section.extraversion_level] : ''}».`}
            >
              <PsychBandMeter
                value={section.extraversion_raw ?? 0}
                max={SCALE_MAX}
                bands={EXTRAVERSION_BANDS}
                label="Положение на шкале экстраверсии"
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
            label={<span className={cn(ADMIN_META, isNeuroticism && 'text-primary font-semibold')}>Нейротизм</span>}
            value={<span className={ADMIN_NUM}>{section.neuroticism_raw}/{SCALE_MAX}</span>}
            badge={
              section.neuroticism_level && (
                <AdminBadge tone={isNeuroticism ? 'brand' : 'quiet'}>
                  {NEUROTICISM_LABELS[section.neuroticism_level] ?? section.neuroticism_level}
                </AdminBadge>
              )
            }
            isOpen={isNeuroticism}
            onToggle={() => setSelectedKey(isNeuroticism ? null : 'neuroticism')}
          >
            <PsychDetailCard
              bare
              title={EYSENCK_SCALES.neuroticism.name}
              badge={
                section.neuroticism_level ? (
                  <AdminBadge tone={section.neuroticism_level === 'very_high' ? 'danger' : 'brand'}>
                    {NEUROTICISM_LABELS[section.neuroticism_level]}
                  </AdminBadge>
                ) : undefined
              }
              meaning={EYSENCK_SCALES.neuroticism.description}
              means={
                section.neuroticism_level
                  ? EYSENCK_SCALES.neuroticism.bands[section.neuroticism_level]?.meaning ?? ''
                  : ''
              }
              follows={
                section.neuroticism_level
                  ? EYSENCK_SCALES.neuroticism.bands[section.neuroticism_level]?.advice ?? ''
                  : ''
              }
              why={`Ученик набрал ${section.neuroticism_raw} из ${SCALE_MAX} баллов по шкале эмоциональной лабильности (нейротизма).`}
              riskWarning={
                section.neuroticism_level === 'high' || section.neuroticism_level === 'very_high'
                  ? 'Повышенная уязвимость к эмоциональному истощению, стрессу экзаменов и дедлайнов. Требуется обучение техникам саморегуляции.'
                  : undefined
              }
            >
              <PsychBandMeter
                value={section.neuroticism_raw ?? 0}
                max={SCALE_MAX}
                bands={NEUROTICISM_BANDS}
                label="Положение на шкале нейротизма"
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
            label={<span className={cn(ADMIN_META, isLieScale && 'text-primary font-semibold')}>Шкала лжи (искренность)</span>}
            value={<span className={ADMIN_NUM}>{section.lie_scale_raw}/9</span>}
            badge={
              <AdminBadge tone={section.protocol_flagged ? 'danger' : 'neutral'}>
                {section.protocol_flagged ? 'Выше нормы (>4)' : 'Достоверно (≤4)'}
              </AdminBadge>
            }
            isOpen={isLieScale}
            onToggle={() => setSelectedKey(isLieScale ? null : 'lie_scale')}
          >
            <PsychDetailCard
              bare
              title={EYSENCK_SCALES.lie_scale.name}
              badge={
                <AdminBadge tone={section.protocol_flagged ? 'danger' : 'neutral'}>
                  {section.protocol_flagged ? 'Флаг неискренности' : 'Протокол валиден'}
                </AdminBadge>
              }
              meaning={EYSENCK_SCALES.lie_scale.description}
              means={
                section.protocol_flagged
                  ? EYSENCK_SCALES.lie_scale.bands.flagged.meaning
                  : EYSENCK_SCALES.lie_scale.bands.valid.meaning
              }
              follows={
                section.protocol_flagged
                  ? EYSENCK_SCALES.lie_scale.bands.flagged.advice
                  : EYSENCK_SCALES.lie_scale.bands.valid.advice
              }
              why={`Шкала лжи состоит из 9 контрольных вопросов. Результат респондента: ${section.lie_scale_raw}/9. Нормативный порог — 4 балла.`}
              riskWarning={
                section.protocol_flagged
                  ? 'Балл превысил 4. Подросток мог стремиться казаться лучше, чем он есть. В личной беседе важно создать максимально доверительную обстановку без оценки.'
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
