import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { homePathForUser } from '@/shared/lib/homePath';
import { useAuthStore } from '@/shared/store/auth';
import { ArrowRight } from 'lucide-react';
import { JourneyCheckpoint } from '@/shared/ui';

export default function NotFoundPage() {
  const { t } = useTranslation('common');
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  // Маршрут один на всех (см. router.tsx), поэтому выход выбирается здесь:
  // вошедшему — в свой кабинет (ученик /results, психолог /psychologist),
  // гостю — на посадочную. Ссылка на /results для гостя вела бы на /login.
  const to = token ? homePathForUser(user) : '/';

  return <JourneyCheckpoint kicker="404" title={t('notFound.title')} body={t('notFound.body')} illustration="rest"
    actions={<Link to={to} className="rd-button">{t('goHome')}<ArrowRight size={18} aria-hidden="true" /></Link>} />;
}
