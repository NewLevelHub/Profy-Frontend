import { useTranslation } from 'react-i18next';
import { Button, Input } from '@/shared/ui';
import { JourneyShell } from '@/shared/ui/redesign/JourneyShell';
import { useCertificatesEdit } from './hooks/useCertificatesEdit';
import { CERTIFICATE_TYPES, CERTIFICATE_LABELS, CERTIFICATE_SCORE_RANGES } from '@/shared/config/certificates';

export default function CertificatesEditPage() {
  const model = useCertificatesEdit();
  return <JourneyShell><main id="journey-content" tabIndex={-1} className="rd-certificate-edit">
    <CertificateEditView model={model} />
  </main></JourneyShell>;
}

/** Same validation, save and unsaved-changes guard remain in the page hook. */
export function CertificateEditView({ model }: { model: ReturnType<typeof useCertificatesEdit> }) {
  const { t } = useTranslation('profile');
  const { scores, setScore, errors, isLoading, saveError, handleSave, handleCancel } = model;
  return <div className="rd-setup-card rd-setup-content">
    <div className="rd-certificate-heading">
      <div className="rd-setup-heading"><h1>{t('redesign.scoresTitle')}</h1><p>{t('edit.scoresHint')}</p></div>
      <img src="/mascot/redesign/notepad.png" alt="" width={120} height={140} />
    </div>
    <div className="rd-subject-grid">
      {CERTIFICATE_TYPES.map(type => {
        const range = CERTIFICATE_SCORE_RANGES[type];
        return <Input key={type} label={t(CERTIFICATE_LABELS[type])} type="number" inputMode="decimal"
          value={scores[type]} onChange={event => setScore(type, event.target.value)}
          placeholder={t('edit.rangePlaceholder', { min: range.min, max: range.max })}
          min={range.min} max={range.max} step={range.step} error={errors[type]} />;
      })}
    </div>
    {saveError && <p className="rd-journey-error" role="alert">{t('edit.saveError')}</p>}
    <div className="rd-setup-actions">
      <Button variant="ghost" className="rd-button rd-button-outline" onClick={handleCancel}>{t('common:cancel')}</Button>
      <Button className="rd-button rd-setup-next" isLoading={isLoading} onClick={handleSave}>{t('common:save')}</Button>
    </div>
  </div>;
}
