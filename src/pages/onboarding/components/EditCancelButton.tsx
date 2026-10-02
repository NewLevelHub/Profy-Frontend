/** «Отмена» in the onboarding header — only when an existing profile is being
 *  edited (the «Изменить» buttons on /profile reuse these screens). Leaves
 *  without saving; fresh onboarding has no way out on purpose, the app needs
 *  a profile.
 */
import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/shared/ui';

export function EditCancelButton({ onClick }: { onClick: () => void }) {
  const { t } = useTranslation('common');
  return (
    <Button variant="ghost" size="sm" className="rounded-pill press-scale gap-1.5" onClick={onClick}>
      <X size={16} aria-hidden="true" />
      {t('cancel')}
    </Button>
  );
}
