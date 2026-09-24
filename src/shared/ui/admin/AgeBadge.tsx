import React from 'react';
import { useTranslation } from 'react-i18next';
import { AdminBadge } from '@/shared/ui/admin/AdminBadge';
import { ADMIN_META } from '@/shared/ui/admin/density';

/** Student's real age ("16 лет") for staff tables and cards; "—" when unknown. */
export const AgeBadge = React.memo(function AgeBadge({ age }: { age: number | null | undefined }) {
  const { t } = useTranslation();
  if (age == null) return <span className={ADMIN_META}>—</span>;
  return <AdminBadge tone="quiet">{t('common:ageYears', { count: age })}</AdminBadge>;
});
