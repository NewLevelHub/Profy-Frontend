import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { Heading } from '@/shared/ui/typography/Heading';
import { Text } from '@/shared/ui/typography/Text';

interface AsturDoneProps {
  /** A finished retake goes back to the results; the first attempt goes on
   *  to report generation (АСТУР is the last phase of the main flow). */
  isRetake: boolean;
  onContinue: () => void;
}

export function AsturDone({ isRetake, onContinue }: AsturDoneProps) {
  const { t } = useTranslation('assessment');
  useEffect(() => {
    if (isRetake) return;
    const timer = setTimeout(() => {
      onContinue();
    }, 2500);
    return () => clearTimeout(timer);
  }, [isRetake, onContinue]);

  return (
    <div className="flex flex-col items-center gap-5 text-center py-16">
      <CheckCircle2 size={48} className="text-success" aria-hidden="true" />
      <Heading level="display-sm">{isRetake ? t('astur.retake.doneTitle') : t('astur.doneTitle')}</Heading>
      <Text variant="body-md" className="text-secondary max-w-md">
        {isRetake ? t('astur.retake.doneMessage') : t('astur.doneMessage')}
      </Text>
      <Button size="lg" onClick={onContinue} className="gap-2 mt-2">
        {isRetake ? t('astur.retake.backToResults') : t('astur.generateReport')}
        <ArrowRight size={18} aria-hidden="true" />
      </Button>
    </div>
  );
}
