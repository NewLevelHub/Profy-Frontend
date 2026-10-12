import { useTranslation } from 'react-i18next';
import { PrintMasthead } from '@/shared/ui';
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
    profile?.age != null ? t('common:ageYears', { count: profile.age }) : null,
    profile?.city,
  ].filter(Boolean).join(' · ');

  return <PrintMasthead label={t('print.cover.eyebrow')} title={t('page.title')}
    meta={<>{meta && <p>{meta}</p>}{dateLabel && <p>{dateLabel}</p>}</>}>
    <p className="print-masthead-subtitle">{subtitle}</p>
  </PrintMasthead>;
}
