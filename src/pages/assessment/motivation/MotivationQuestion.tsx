import { Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/shared/lib/cn';
import { Button } from '@/shared/ui/Button';
import { Heading } from '@/shared/ui/typography/Heading';
import { Text } from '@/shared/ui/typography/Text';
import type { MotivationStatement } from '@/shared/types';
import { TripletRanking } from '../components/TripletRanking';

interface MotivationQuestionProps {
  statements: MotivationStatement[];
  onReorder: (ids: string[]) => void;
  onConfirm: () => void;
  confirmed: boolean;
  onNext: () => void;
  canProceed: boolean;
  disabled: boolean;
}

export function MotivationQuestion({ statements, onReorder, onConfirm, confirmed, onNext, canProceed, disabled }: MotivationQuestionProps) {
  const { t } = useTranslation('assessment');
  return (
    <>
      <Heading level="display-sm" as="h1" className="rd-assessment-page-title">
        {t('format.rankPriority')}
      </Heading>
      <Text variant="caption" className="rd-assessment-instruction">
        {t('format.dragToTop')}
      </Text>
      <TripletRanking
        statements={statements}
        onReorder={onReorder}
        disabled={disabled}
      />
      <button
        type="button"
        onClick={onConfirm}
        disabled={disabled}
        aria-pressed={confirmed}
        className={cn(
          'rd-assessment-confirm mt-3 inline-flex items-center gap-1.5 text-body-sm font-medium transition-colors',
          'disabled:cursor-not-allowed disabled:opacity-50',
          confirmed ? 'text-brand' : 'text-secondary hover:text-primary',
        )}
      >
        <Check size={14} aria-hidden />
        {confirmed ? t('triplet.orderConfirmed') : t('triplet.confirmOrder')}
      </button>
      <Button
        onClick={onNext}
        disabled={!canProceed || disabled}
        size="lg"
        className="rd-assessment-next"
      >
        {t('priority.continue')}
      </Button>
    </>
  );
}
