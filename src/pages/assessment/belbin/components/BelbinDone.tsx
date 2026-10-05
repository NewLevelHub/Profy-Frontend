import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { AssessmentCompletion } from '../../components/AssessmentCompletion';

export function BelbinDone({ onContinue }: { onContinue: () => void }) {
  const { t } = useTranslation('assessment');
  useEffect(() => {
    const timer = setTimeout(() => { onContinue(); }, 2500);
    return () => clearTimeout(timer);
  }, [onContinue]);

  return (
    <AssessmentCompletion
      title={t('belbin.doneTitle')}
      message={t('belbin.doneMessage')}
      action={t('belbin.toAstur')}
      onContinue={onContinue}
    />
  );
}
