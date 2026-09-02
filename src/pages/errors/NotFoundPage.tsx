import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

export default function NotFoundPage() {
  const { t } = useTranslation('common');
  return (
    <div className="min-h-[60vh] grid place-items-center bg-page text-center px-4">
      <div className="space-y-4">
        <p className="text-6xl font-black text-subtle">404</p>
        <h1 className="text-xl font-black text-primary">{t('notFound.title')}</h1>
        <Link
          to="/results"
          className="inline-block mt-2 rounded-xl bg-brand text-on-brand px-6 py-3 text-sm font-extrabold hover:bg-brand-hover transition-colors"
        >
          {t('goHome')}
        </Link>
      </div>
    </div>
  );
}
