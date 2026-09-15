import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { useAuthStore } from '@/shared/store/auth';

export default function NotFoundPage() {
  const { t } = useTranslation('common');
  const token = useAuthStore((s) => s.token);
  // Маршрут один на всех (см. router.tsx), поэтому выход выбирается здесь:
  // вошедшему — в приложение, гостю — на посадочную страницу. Ссылка на
  // /results для гостя вела бы на /login и выглядела как «вас выкинуло».
  const to = token ? '/results' : '/';

  return (
    <div className="min-h-screen grid place-items-center bg-page text-center px-4">
      <div className="space-y-4">
        <p className="text-6xl font-black text-subtle">404</p>
        <h1 className="text-xl font-black text-primary">{t('notFound.title')}</h1>
        <Link
          to={to}
          className="inline-block mt-2 rounded-xl bg-brand text-on-brand px-6 py-3 text-sm font-extrabold hover:bg-brand-hover transition-colors"
        >
          {t('goHome')}
        </Link>
      </div>
    </div>
  );
}
