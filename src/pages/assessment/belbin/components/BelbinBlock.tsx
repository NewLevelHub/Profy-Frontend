import { Button } from '@/shared/ui/Button';
import { ProgressBar } from '@/shared/ui/ProgressBar';
import { PointAllocator } from '@/shared/ui/PointAllocator';
import { Text } from '@/shared/ui/typography/Text';
import type { BelbinContentSection } from '@/shared/types';

interface BelbinBlockProps {
  section: BelbinContentSection;
  sectionIndex: number;
  sectionCount: number;
  allocation: Record<string, number>;
  blockTotal: number;
  isValid: boolean;
  isLastBlock: boolean;
  submitting: boolean;
  submitError: string | null;
  onChange: (value: Record<string, number>) => void;
  onBack: () => void;
  onNext: () => void;
}

export function BelbinBlock({
  section,
  sectionIndex,
  sectionCount,
  allocation,
  blockTotal,
  isValid,
  isLastBlock,
  submitting,
  submitError,
  onChange,
  onBack,
  onNext,
}: BelbinBlockProps) {
  return (
    <div className="assessment-stage mx-auto w-full max-w-[720px]">
      <div className="assessment-stage__shell journey-shell flex flex-col gap-6 !p-6 sm:!p-8">
        <div className="flex flex-col gap-2">
          <ProgressBar
            value={((sectionIndex + 1) / sectionCount) * 100}
            label={`Раздел ${sectionIndex + 1} из ${sectionCount}`}
          />
          <Text variant="caption" className="text-muted">
            Раздел {section.section} · {sectionIndex + 1}/{sectionCount}
          </Text>
          <p
            className="font-sans font-semibold text-[color:var(--text-heading)]"
            style={{ fontSize: '1.375rem', lineHeight: 1.4 }}
          >
            {section.title}
          </p>
        </div>

        <PointAllocator
          items={section.items.map((item) => ({ id: item.id, label: item.text }))}
          total={blockTotal}
          value={allocation}
          onChange={onChange}
        />

        {submitError && (
          <Text variant="body-sm" className="text-danger">
            {submitError}
          </Text>
        )}

        <div className="flex items-center justify-between gap-3">
          <Button variant="ghost" onClick={onBack} disabled={submitting}>
            Назад
          </Button>
          <Button onClick={onNext} disabled={!isValid} isLoading={isLastBlock && submitting}>
            {isLastBlock ? 'Завершить' : 'Далее'}
          </Button>
        </div>
      </div>
    </div>
  );
}
