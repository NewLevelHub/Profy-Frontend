import i18next from 'i18next';
import { useTranslation } from 'react-i18next';
import { Info } from 'lucide-react';

/**
 * KZ-502 — non-blocking note shown when a catalog description is served in a
 * different language than the UI (backend `*_locale` field vs. active locale).
 * Until KZ-504 batch-translates the ~2650 university/program descriptions, a
 * `kk` student sees the Russian text with this note; it renders nothing when
 * the locales match (which is always the case pre-KZ-603).
 */
export function DescriptionLocaleNote({ locale }: { locale: string | null | undefined }) {
  const { t } = useTranslation('results');
  const active = i18next.language || 'ru';
  if (!locale || locale === active) return null;

  return (
    <p
      role="note"
      className="flex items-start gap-1.5 text-caption text-muted font-semibold m-0 mb-3"
    >
      <Info className="w-3.5 h-3.5 mt-px shrink-0" aria-hidden="true" />
      <span>{t('program.descriptionLocaleNote')}</span>
    </p>
  );
}
