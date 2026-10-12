import { useTranslation } from 'react-i18next';
import { AssessmentCompletion } from '../../components/AssessmentCompletion';

interface AsturCompletedProps {
  completedAt: string | null;
  onContinue: () => void;
}

/** Shown when this assessment's АСТУР is already finished and no attempt is
 *  open — instead of silently starting a new attempt. */
export function AsturCompleted({ completedAt, onContinue }: AsturCompletedProps) {
  const { t, i18n } = useTranslation('assessment');
  const date = completedAt ? new Date(completedAt).toLocaleDateString(i18n.language) : null;

  return (
    <AssessmentCompletion
      title={t('astur.completed.title')}
      message={date ? t('astur.completed.bodyWithDate', { date }) : t('astur.completed.body')}
      action={t('astur.completed.continue')}
      onContinue={onContinue}
    />
  );
}
