import { cn } from '@/shared/lib/cn';
import { useTranslation } from 'react-i18next';
import { CONTENT_LOCALE_LABELS, CONTENT_LOCALE_SHORT } from '@/shared/lib/contentLabels';
import { Tooltip } from '@/shared/ui/Tooltip';
import { MONO_LABEL } from '@/shared/ui/admin/density';
import type { Locale } from '@/shared/store/locale';

/**
 * Which locale's copy of a content row this is.
 *
 * KZ-301 turned one logical content unit into one row per locale, so every
 * content list now returns the ru and the kk copy of the same question back to
 * back. Without a marker the two are indistinguishable in the table — and an
 * admin editing "the" question has no way to tell which language they are
 * about to change.
 *
 * Deliberately quiet: this is an orientation aid on every row, not a status
 * worth shouting about, so `ru` (the overwhelming majority and the default)
 * stays muted and only `kk` gets tinted.
 */
export function LocaleBadge({ locale }: { locale: Locale }) {
  const { t } = useTranslation('admin');
  return (
    <Tooltip content={t(CONTENT_LOCALE_LABELS[locale])}>
      <span
        tabIndex={0}
        className={cn(
          MONO_LABEL,
          'inline-flex items-center px-1.5 py-0.5 rounded-[2px]',
          locale === 'kk' ? 'bg-brand-subtle text-brand' : 'bg-raised text-muted',
          'focus:outline-none focus:ring-2 focus:ring-[color-mix(in_srgb,var(--brand)_30%,transparent)]',
        )}
      >
        {CONTENT_LOCALE_SHORT[locale]}
      </span>
    </Tooltip>
  );
}
