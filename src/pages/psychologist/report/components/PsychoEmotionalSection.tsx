import { useTranslation } from 'react-i18next';
import { formatDate } from '@/shared/i18n/format';
import { cn } from '@/shared/lib/cn';
import type { PsychoEmotionalSection as PsychoEmotionalSectionData } from '@/shared/types';
import { PsychoEmotionalReport } from '@/shared/ui';
import { AdminBadge, type AdminBadgeTone } from '@/shared/ui/admin/AdminBadge';
import { AdminCard } from '@/shared/ui/admin/AdminSectionHeading';
import { ADMIN_META } from '@/shared/ui/admin/density';

const VALIDITY_FLAG_TONES: Record<string, AdminBadgeTone> = {
  ok: 'brand',
  caution: 'quiet',
  low: 'danger',
};

/** Full specialist reading; the same report body is used on /result. */
export function PsychoEmotionalSection({ section }: { section?: PsychoEmotionalSectionData | null }) {
  const { t } = useTranslation('psychologist');
  if (!section) return null;

  return (
    <AdminCard
      title={t('psycho.title')}
      description={t('psycho.method')}
      aside={<AdminBadge tone="quiet">{t('psycho.run', { n: section.run_number })}</AdminBadge>}
    >
      <p className={cn(ADMIN_META, 'mb-3')}>
        {formatDate(section.completed_at, {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })}
      </p>

      {section.validity_flag && (
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <AdminBadge tone={VALIDITY_FLAG_TONES[section.validity_flag] ?? 'neutral'}>
            {t(`psychoCabinet.validity.${section.validity_flag}`)}
          </AdminBadge>
          {section.validity_reasons.length > 0 && (
            <span className={ADMIN_META}>
              {section.validity_reasons
                .map((code) => t(`psycho.reason.${code}`, { defaultValue: code }))
                .join(', ')}
            </span>
          )}
        </div>
      )}

      <PsychoEmotionalReport section={section} />
    </AdminCard>
  );
}
