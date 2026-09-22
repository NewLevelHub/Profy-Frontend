import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Heading } from '@/shared/ui/typography/Heading';
import { Text } from '@/shared/ui/typography/Text';
import { AssessmentStageShell } from '../../components/AssessmentStageShell';
import { LAYOUT, PSYCHO_COLOR_BY_ID, CHOICE_COUNT } from '../data/colors';
import { ColorSwatch } from './ColorSwatch';

interface ColorCircleStepProps {
  instruction: string;
  /** Круг завершён: порядок 8 ID (приятный → неприятный) + Δt каждого выбора (мс). */
  onComplete: (order: number[], dtMs: number[]) => void;
}

/**
 * Раскладка §5.3 / §5.5. 8 плашек в фиксированном расположении `LAYOUT`
 * (одинаковом на обоих кругах). Выбор от самого приятного к самому
 * неприятному; выбранная плашка убирается из ряда. Фиксируется порядок ID
 * и Δt между кликами.
 * PRO-397: same journey-shell card as AssessmentIntro / CheckInStep.
 */
export function ColorCircleStep({ instruction, onComplete }: ColorCircleStepProps) {
  const { t } = useTranslation('assessment');
  const [picked, setPicked] = useState<number[]>([]);
  const dtMsRef = useRef<number[]>([]);
  const lastPickAtRef = useRef<number>(Date.now());

  function handleSelect(id: number) {
    if (picked.includes(id)) return;
    const now = Date.now();
    dtMsRef.current.push(now - lastPickAtRef.current);
    lastPickAtRef.current = now;

    const next = [...picked, id];
    setPicked(next);
    if (next.length === CHOICE_COUNT) onComplete(next, dtMsRef.current);
  }

  const remaining = LAYOUT.filter((id) => !picked.includes(id));

  return (
    <AssessmentStageShell
      centered
      contentClassName="flex flex-col items-center gap-6 !p-6 sm:!p-8"
    >
      <Heading level="display-sm" as="h2" className="text-primary text-center text-balance">
        {instruction}
      </Heading>
      <div
        className="grid w-full max-w-[420px] gap-3"
        style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}
      >
        {remaining.map((id) => (
          <ColorSwatch
            key={id}
            color={PSYCHO_COLOR_BY_ID[id]}
            onSelect={handleSelect}
          />
        ))}
      </div>
      <Text variant="body-sm" className="text-muted">
        {t('psychoemotional.pickedOfTotal', { picked: picked.length, total: CHOICE_COUNT })}
      </Text>
    </AssessmentStageShell>
  );
}
