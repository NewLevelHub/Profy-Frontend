import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { env } from '@/shared/config/env';

export function Brand() {
  const { t } = useTranslation('common');
  return (
    <Link to="/" className="rd-brand" aria-label={t('toHome')}>
      {env.APP_NAME.toLowerCase()}<span aria-hidden="true">.</span>
    </Link>
  );
}
