import { useTranslation } from 'react-i18next';
import { UsersRound } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { PointAllocator } from '@/shared/ui/PointAllocator';
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
  const { t } = useTranslation('assessment');
  return (
    <section className="rd-belbin">
      <div className="rd-assessment-section-heading">
        <span className="rd-icon-tile rd-lilac" aria-hidden="true"><UsersRound /></span>
        <div>
          <p className="rd-assessment-kicker">
            {t('belbin.sectionLabel', { section: section.section, current: sectionIndex + 1, total: sectionCount })}
          </p>
          <h1>{section.title}</h1>
        </div>
      </div>
      <p className="rd-belbin-instruction">{t('redesign.belbinInstruction', { total: blockTotal })}</p>

      <PointAllocator
        className="rd-point-allocator"
        items={section.items.map((item) => ({ id: item.id, label: item.text }))}
        total={blockTotal}
        value={allocation}
        onChange={onChange}
      />

      {submitError && <p className="text-body-sm text-danger" role="alert">{submitError}</p>}

      <div className="rd-assessment-actions">
        <Button variant="ghost" onClick={onBack} disabled={submitting}>
          {t('common:back')}
        </Button>
        <Button onClick={onNext} disabled={!isValid || submitting} isLoading={submitting}>
          {isLastBlock ? t('belbin.finish') : t('common:next')}
        </Button>
      </div>
    </section>
  );
}
