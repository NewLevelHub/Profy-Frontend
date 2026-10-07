import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { AssessmentCompletion } from '../../components/AssessmentCompletion';

export function AsturDone({ onContinue }: { onContinue: () => void }) {
  const { t } = useTranslation('assessment');
  useEffect(() => {
    const timer = setTimeout(() => { onContinue(); }, 2500);
    return () => clearTimeout(timer);
  }, [onContinue]);

  return (
    <AssessmentCompletion
      title={t('astur.doneTitle')}
      message={t('astur.doneMessage')}
      action={t('astur.generateReport')}
      onContinue={onContinue}
    />
  );
}
