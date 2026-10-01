import { useTranslation } from 'react-i18next';
import { CheckCircle2, RotateCcw } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { Heading } from '@/shared/ui/typography/Heading';
import { Text } from '@/shared/ui/typography/Text';

interface AsturCompletedProps {
  completedAt: string | null;
  onContinue: () => void;
  onRetake: () => void;
}

/** Shown when this assessment's АСТУР is already finished and no attempt is
 *  open — instead of silently starting a new attempt. */
export function AsturCompleted({ completedAt, onContinue, onRetake }: AsturCompletedProps) {
  const { t, i18n } = useTranslation('assessment');
  const date = completedAt ? new Date(completedAt).toLocaleDateString(i18n.language) : null;

  return (
    <div className="flex flex-col items-center gap-5 text-center py-16">
      <CheckCircle2 size={48} className="text-success" aria-hidden="true" />
      <Heading level="display-sm">{t('astur.completed.title')}</Heading>
      <Text variant="body-md" className="text-secondary max-w-md">
        {date ? t('astur.completed.bodyWithDate', { date }) : t('astur.completed.body')}
      </Text>
      <div className="flex flex-col sm:flex-row gap-2 mt-2">
        <Button size="lg" onClick={onContinue}>
          {t('astur.completed.continue')}
        </Button>
        <Button size="lg" variant="ghost" onClick={onRetake} className="gap-2">
          <RotateCcw size={16} aria-hidden="true" />
          {t('astur.retake.cta')}
        </Button>
      </div>
    </div>
  );
}
