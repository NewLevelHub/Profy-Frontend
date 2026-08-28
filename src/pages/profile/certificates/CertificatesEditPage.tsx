import { Heading, Button, Input, Mascot } from '@/shared/ui';
import { useCertificatesEdit } from './hooks/useCertificatesEdit';
import { GpaScaleSelector } from './components/GpaScaleSelector';
import {
  CERTIFICATE_TYPES,
  CERTIFICATE_LABELS,
  CERTIFICATE_SCORE_RANGES,
  GPA_SCALE_MAX,
  GPA_SCALE_STEP,
} from './utils/certificateConfig';

// Same shell as ArtifactsSetupPage's edit-mode branch (opened the same way,
// from a Profile section's "Изменить"/"Добавить") — boxed card, headline +
// note, Save/Cancel footer. Unlike artifacts there's no onboarding-linear
// variant: certificates/GPA are added after onboarding, from Profile only.
const MASCOT_EDIT_SIZE = 64;

export default function CertificatesEditPage() {
  const {
    scores, setScore,
    gpaScale, setGpaScale,
    gpaValue, setGpaValue,
    errors,
    isLoading, saveError,
    handleSave, handleCancel,
  } = useCertificatesEdit();

  return (
    <div className="min-h-screen bg-page flex flex-col">
      <div className="flex-1 overflow-y-auto px-5 py-8 lg:py-12">
        <div className="max-w-2xl mx-auto flex flex-col gap-6">

          <div>
            <h1 className="text-h1 font-black text-primary tracking-tight mb-1">Сертификаты и GPA</h1>
            <p className="text-body text-secondary">Баллы IELTS, ЕНТ, SAT, TOEFL и средний балл — если уже есть</p>
          </div>

          <div
            className="flex flex-col gap-6 p-6 sm:p-8"
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex flex-col gap-1.5">
                <Heading level="display-md" as="h2">Языковые и вступительные баллы</Heading>
                <p className="text-body-md" style={{ color: 'var(--mute)' }}>
                  Заполни то, что уже сдавал — остальное можно оставить пустым
                </p>
              </div>
              <Mascot state="welcome" size={MASCOT_EDIT_SIZE} className="shrink-0" />
            </div>

            {/* Four fixed rows, not a "pick type then add" flow — the exam
                set is small and known, so direct inline inputs beat an extra
                selection step (see certificateConfig.ts). */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {CERTIFICATE_TYPES.map(type => {
                const range = CERTIFICATE_SCORE_RANGES[type];
                return (
                  <Input
                    key={type}
                    label={CERTIFICATE_LABELS[type]}
                    type="number"
                    inputMode="decimal"
                    value={scores[type]}
                    onChange={e => setScore(type, e.target.value)}
                    placeholder={`от ${range.min} до ${range.max}`}
                    min={range.min}
                    max={range.max}
                    step={range.step}
                    error={errors[type]}
                  />
                );
              })}
            </div>

            <div className="flex flex-col gap-4 pt-2 border-t border-default">
              <div className="pt-2">
                <Heading level="display-md" as="h2">Средний балл (GPA)</Heading>
                <p className="text-body mt-1" style={{ color: 'var(--ink)' }}>Выбери систему оценки в своей школе</p>
              </div>

              <GpaScaleSelector value={gpaScale} onChange={setGpaScale} />

              <Input
                label="Балл"
                type="number"
                inputMode="decimal"
                value={gpaValue}
                onChange={e => setGpaValue(e.target.value)}
                placeholder={gpaScale ? `от 0 до ${GPA_SCALE_MAX[gpaScale]}` : 'сначала выбери систему'}
                disabled={!gpaScale}
                min={0}
                max={gpaScale ? GPA_SCALE_MAX[gpaScale] : undefined}
                step={gpaScale ? GPA_SCALE_STEP[gpaScale] : undefined}
                error={errors.gpa}
              />
            </div>

            {saveError && (
              <p className="text-xs text-danger text-center">Не удалось сохранить. Попробуй ещё раз.</p>
            )}

            <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-default">
              <Button
                size="lg"
                isLoading={isLoading}
                className="h-12 rounded-pill font-extrabold shadow-button"
                onClick={handleSave}
              >
                Сохранить
              </Button>
              <Button variant="ghost" size="lg" className="h-12 rounded-pill" onClick={handleCancel}>
                Отмена
              </Button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
