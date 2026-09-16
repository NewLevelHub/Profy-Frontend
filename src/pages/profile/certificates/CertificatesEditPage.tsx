import { useTranslation } from 'react-i18next';
import { Heading, Button, Input, Mascot } from '@/shared/ui';
import { useCertificatesEdit } from './hooks/useCertificatesEdit';
import {
  CERTIFICATE_TYPES,
  CERTIFICATE_LABELS,
  CERTIFICATE_SCORE_RANGES,
} from '@/shared/config/certificates';

// Same shell as ArtifactsSetupPage's edit-mode branch (opened the same way,
// from a Profile section's "Изменить"/"Добавить") — boxed card, headline +
// note, Save/Cancel footer. Unlike artifacts there's no onboarding-linear
// variant: this page only ever edits scores already collected on step 2.
const MASCOT_EDIT_SIZE = 64;

export default function CertificatesEditPage() {
  const { t } = useTranslation('profile');
  const {
    scores, setScore,
    errors,
    isLoading, saveError,
    handleSave, handleCancel,
  } = useCertificatesEdit();

  return (
    <div className="min-h-screen bg-page flex flex-col">
      <div className="flex-1 overflow-y-auto px-5 py-8 lg:py-12">
        <div className="max-w-2xl mx-auto flex flex-col gap-6">

          <div>
            <h1 className="text-h1 font-black text-primary tracking-tight mb-1">{t('edit.title')}</h1>
            <p className="text-body text-secondary">{t('edit.subtitle')}</p>
          </div>

          <div
            className="flex flex-col gap-6 p-6 sm:p-8"
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex flex-col gap-1.5">
                <Heading level="display-md" as="h2">{t('edit.scoresHeading')}</Heading>
                <p className="text-body-md" style={{ color: 'var(--mute)' }}>
                  {t('edit.scoresHint')}
                </p>
              </div>
              <Mascot state="welcome" size={MASCOT_EDIT_SIZE} className="shrink-0" />
            </div>

            {/* Four fixed rows, not a "pick type then add" flow — the exam
                set is small and known, so direct inline inputs beat an extra
                selection step (see @/shared/config/certificates.ts). */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {CERTIFICATE_TYPES.map(type => {
                const range = CERTIFICATE_SCORE_RANGES[type];
                return (
                  <Input
                    key={type}
                    label={t(CERTIFICATE_LABELS[type])}
                    type="number"
                    inputMode="decimal"
                    value={scores[type]}
                    onChange={e => setScore(type, e.target.value)}
                    placeholder={t('edit.rangePlaceholder', { min: range.min, max: range.max })}
                    min={range.min}
                    max={range.max}
                    step={range.step}
                    error={errors[type]}
                  />
                );
              })}
            </div>

            {saveError && (
              <p className="text-xs text-danger text-center">{t('edit.saveError')}</p>
            )}

            <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-default">
              <Button
                size="lg"
                isLoading={isLoading}
                className="h-12 rounded-pill font-extrabold shadow-button"
                onClick={handleSave}
              >
                {t('common:save')}
              </Button>
              <Button variant="ghost" size="lg" className="h-12 rounded-pill" onClick={handleCancel}>
                {t('common:cancel')}
              </Button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
