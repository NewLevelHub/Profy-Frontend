import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { homePathForUser } from '@/shared/lib/homePath';
import { useAuthStore } from '@/shared/store/auth';
import { FullScreenPreferences } from '@/shared/ui/FullScreenPreferences';

export default function NotFoundPage() {
  const { t } = useTranslation('common');
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  // Маршрут один на всех (см. router.tsx), поэтому выход выбирается здесь:
  // вошедшему — в свой кабинет (ученик /results, психолог /psychologist),
  // гостю — на посадочную. Ссылка на /results для гостя вела бы на /login.
  const to = token ? homePathForUser(user) : '/';

  return (
    <div className="relative min-h-screen grid place-items-center bg-page text-center px-4">
      <FullScreenPreferences className="absolute top-4 right-4 sm:right-6" />
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
