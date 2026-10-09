import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { env } from '@/shared/config/env';

export function Brand({ linked = true }: { linked?: boolean }) {
  const { t } = useTranslation('common');
  const wordmark = <>{env.APP_NAME.toLowerCase()}<span aria-hidden="true">.</span></>;
  if (!linked) return <span className="rd-brand">{wordmark}</span>;
  return (
    <Link to="/" className="rd-brand" aria-label={t('toHome')}>
      {wordmark}
    </Link>
  );
}
