import { Heading } from '@/shared/ui/typography/Heading';
import { Text } from '@/shared/ui/typography/Text';
import { AGE_GROUP_LABELS } from '@/shared/config/constants';
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
  const date = new Date(createdAt);
  const dateLabel = Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString('ru-RU');
  const meta = [
    profile?.name,
    profile?.age_group ? AGE_GROUP_LABELS[profile.age_group] : null,
    profile?.city,
  ].filter(Boolean).join(' · ');

  return (
    <header className="print-block space-y-3 border-b border-[var(--hairline)] pb-5">
      <div className="flex items-baseline justify-between gap-4">
        <p className="font-mono text-mono-xs font-bold uppercase tracking-label text-muted">
          PROFY · РЕЗУЛЬТАТ ТЕСТА
        </p>
        {dateLabel && (
          <p className="font-mono text-mono-xs uppercase tracking-label text-muted">{dateLabel}</p>
        )}
      </div>
      <div>
        <Heading level="display-md" className="text-[color:var(--midnight)]">
          Что мы узнали о тебе
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
