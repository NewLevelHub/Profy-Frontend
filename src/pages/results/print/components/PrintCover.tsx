import { useTranslation } from 'react-i18next';
import { Heading } from '@/shared/ui/typography/Heading';
import { Text } from '@/shared/ui/typography/Text';
import { AGE_GROUP_LABELS } from '@/shared/config/constants';
import { formatDate } from '@/shared/i18n/format';
import type { ProfileResponse } from '@/shared/types';

interface PrintCoverProps {
  profile: ProfileResponse | null;
  subtitle: string;
  createdAt: string;
}

/**
 * Document masthead. A PDF leaves the app and gets shown to a parent or a
 * teacher, so unlike the screen it has to answer "whose result is this, and
 * when was it taken" on its own — the app chrome that carried the name and
 * the navigation context isn't there any more.
 */
export function PrintCover({ profile, subtitle, createdAt }: PrintCoverProps) {
  const { t } = useTranslation('results');
  const date = new Date(createdAt);
  const dateLabel = Number.isNaN(date.getTime()) ? '' : formatDate(date);
  const meta = [
    profile?.name,
    profile?.age_group ? t(AGE_GROUP_LABELS[profile.age_group]) : null,
    profile?.city,
  ].filter(Boolean).join(' · ');

  return (
    <header className="print-block space-y-3 border-b border-[var(--hairline)] pb-5">
      <div className="flex items-baseline justify-between gap-4">
        <p className="font-mono text-mono-xs font-bold uppercase tracking-label text-muted">
          {t('print.cover.eyebrow')}
        </p>
        {dateLabel && (
          <p className="font-mono text-mono-xs uppercase tracking-label text-muted">{dateLabel}</p>
        )}
      </div>
      <div>
        <Heading level="display-md" className="text-[color:var(--text-heading)]">
          {t('page.title')}
        </Heading>
        <Text variant="body-sm" className="text-secondary font-semibold mt-[3px]">
          {subtitle}
        </Text>
      </div>
      {meta && (
        <Text variant="caption" className="text-secondary">
          {meta}
        </Text>
      )}
    </header>
  );
}
