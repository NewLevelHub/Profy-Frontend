import { useTranslation } from 'react-i18next';
import { Brain, RotateCcw } from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { Text } from '@/shared/ui/typography/Text';
import { RetakeConfirmModal } from '@/pages/assessment/astur/components/RetakeConfirmModal';
import { useAsturRetake } from '../hooks/useAsturRetake';

/** Status of the cognitive-skills test + explicit «Пройти заново». The
 *  result itself is shown to the psychologist, not here. */
export function AsturRetakeCard({ assessmentId }: { assessmentId: string | null }) {
  const { t, i18n } = useTranslation('results');
  const retake = useAsturRetake(assessmentId);
  if (!retake.visible) return null;

  const date = retake.completedAt ? new Date(retake.completedAt).toLocaleDateString(i18n.language) : '';

  return (
    <Card className="flex flex-col sm:flex-row sm:items-center gap-4 p-5">
      <span className="journey-feature-icon journey-feature-icon--iris flex-shrink-0" aria-hidden="true">
        <Brain size={18} strokeWidth={2} />
      </span>
      <div className="flex flex-col gap-1 min-w-0 flex-1">
        <span className="text-body-sm font-semibold text-[color:var(--text-heading)]">{t('astur.title')}</span>
        <Text variant="body-sm" className="text-secondary">
          {retake.retakeInProgress ? t('astur.retakeInProgress', { date }) : t('astur.completedOn', { date })}
        </Text>
        {retake.failed && (
          <Text variant="body-sm" className="text-danger">
            {t('astur.retakeFailed')}
          </Text>
        )}
      </div>
      {retake.retakeInProgress ? (
        <Button variant="primary" size="md" onClick={retake.continueRetake}>
          {t('astur.continue')}
        </Button>
      ) : (
        <Button variant="ghost" size="md" onClick={retake.openConfirm} className="gap-2">
          <RotateCcw size={16} aria-hidden="true" />
          {t('astur.retake')}
        </Button>
      )}
      <RetakeConfirmModal
        open={retake.confirmOpen}
        pending={retake.starting}
        onConfirm={retake.confirmRetake}
        onCancel={retake.cancelConfirm}
      />
    </Card>
  );
}
