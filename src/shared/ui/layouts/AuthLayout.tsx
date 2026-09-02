import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Outlet, useLocation } from 'react-router';
import { Compass, Landmark, Layers, ListChecks } from 'lucide-react';
import { env } from '@/shared/config/env';
import { LanguageSwitcher } from '@/shared/ui/LanguageSwitcher';

/**
 * Копия левой колонки — своя у каждого экрана авторизации. Колонка есть везде:
 * без неё переход со входа на «Забыли пароль» читался как уход на другой сайт,
 * потому что половина экрана внезапно пустела. Текст при этом разный: вход и
 * регистрация рассказывают о продукте, экраны восстановления — о том, что
 * происходит прямо сейчас и что прогресс не потеряется. Тексты — в
 * auth:layout.aside.*, здесь только маршрут -> ключ.
 */
type AsideCopy = { eyebrow: string; head: string; accent: string; sub: string };

// route -> auth:layout.aside.<key>
const ROUTE_ASIDE_KEY: Record<string, string> = {
  '/login': 'login',
  '/register': 'register',
  '/verify-email': 'verifyEmail',
  '/forgot-password': 'forgotPassword',
  '/reset-password': 'resetPassword',
};

/**
 * Цифры настоящие — те же, что в блоке статистики на лендинге. Оттенки плашек
 * под иконки взяты оттуда же (.feature-icon), чтобы обе поверхности читались
 * одной системой. Тексты — в auth:layout.stats.*.
 */
const BLOCKS: { icon: ReactNode; tint: string; statKey: string }[] = [
  {
    icon: <ListChecks size={18} strokeWidth={1.75} style={{ color: 'var(--pine)' }} />,
    tint: 'rgba(14, 74, 65, 0.10)',
    statKey: 'tests',
  },
  {
    icon: <Compass size={18} strokeWidth={1.75} style={{ color: '#C06A1E' }} />,
    tint: 'rgba(219, 127, 46, 0.12)',
    statKey: 'professions',
  },
  {
    icon: <Landmark size={18} strokeWidth={1.75} style={{ color: 'var(--lake)' }} />,
    tint: 'rgba(44, 106, 140, 0.12)',
    statKey: 'universities',
  },
  {
    icon: <Layers size={18} strokeWidth={1.75} style={{ color: 'var(--pine)' }} />,
    tint: 'rgba(79, 160, 147, 0.16)',
    statKey: 'programs',
  },
];

function AuthAside({ copy }: { copy: AsideCopy }) {
  const { t } = useTranslation('auth');
  return (
    // Ниже lg колонка скрыта: на телефоне форма должна быть первым и
    // единственным, что видно, а не концом прокрутки через маркетинг.
    <aside className="hidden lg:block flex-1 min-w-0" style={{ maxWidth: 600 }}>
      <span className="auth-eyebrow auth-enter">{copy.eyebrow}</span>

      <h1 className="auth-aside-headline auth-enter auth-enter-d1">
        {copy.head} <span className="auth-aside-accent">{copy.accent}</span>
      </h1>

      <p
        className="auth-enter auth-enter-d2 mt-[14px] text-body-md font-book leading-[1.55] text-secondary"
        style={{ maxWidth: '46ch' }}
      >
        {copy.sub}
      </p>

      <div className="grid grid-cols-2 gap-[14px] mt-[32px]">
        {BLOCKS.map((block, i) => (
          <div key={block.statKey} className={`auth-block auth-enter auth-enter-d${i + 3}`}>
            <span className="auth-block-icon" style={{ background: block.tint }}>
              {block.icon}
            </span>
            <div className="text-body-sm font-semibold text-primary leading-[1.25]">
              {t(`layout.stats.${block.statKey}.title`)}
            </div>
            <div className="mt-[5px] text-caption leading-[1.45] text-secondary">
              {t(`layout.stats.${block.statKey}.desc`)}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}

export function AuthLayout() {
  const location = useLocation();
  const { t } = useTranslation('auth');
  const asideKey = ROUTE_ASIDE_KEY[location.pathname];
  const aside: AsideCopy | undefined = asideKey
    ? {
        eyebrow: t(`layout.aside.${asideKey}.eyebrow`),
        head: t(`layout.aside.${asideKey}.head`),
        accent: t(`layout.aside.${asideKey}.accent`),
        sub: t(`layout.aside.${asideKey}.sub`),
      }
    : undefined;

  const card = (
    // key по маршруту: layout между экранами авторизации не размонтируется, и
    // без него css-анимация проигрывалась бы только при первой загрузке —
    // переход «Вход -> Забыли пароль» происходил бы рывком. Префикс обязателен:
    // колонка и карточка — соседи в одном родителе, и с голым pathname у них
    // совпали бы ключи. React отвечает на это не заменой, а двумя элементами
    // разом: путь менялся, а на экране оставался текст предыдущего экрана.
    <div
      key={`card-${location.pathname}`}
      className="auth-enter auth-enter-3 w-full relative z-[1]"
      style={{
        // Карточка — приподнятая поверхность, как карточки на лендинге
        // (--surface на --fog, рамка --line), а не обводка на пустом месте.
        // Ширина и отступы одинаковы на всех экранах авторизации: раньше
        // вход был 488/34px, а восстановление 480/30px, и при переходе между
        // ними строка пересобиралась — колонка и поле ввода дёргались вбок.
        maxWidth: 488,
        flexShrink: 0,
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        // У двухколоночного входа крупный заголовок уехал в левую колонку,
        // поэтому карточке нужно меньше воздуха сверху, чем прежним 56px.
        padding: '44px 34px 48px',
        boxSizing: 'border-box',
      }}
    >
      <Outlet />
    </div>
  );

  return (
    <div className="auth-page relative min-h-screen bg-page px-4 py-8 lg:py-10 flex flex-col">
      {/* Логотип живёт внутри той же колонки шириной 1180, что и содержимое:
          так он встаёт ровно над левым краем текста, а не жмётся к углу окна. */}
      <div
        className="relative z-[1] w-full mx-auto flex items-start justify-between gap-4"
        style={{ maxWidth: 1180 }}
      >
        {/* Пока не ссылка: лендинг приезжает следующим тикетом, и до его мержа
            переход по env.LANDING_URL упирался бы в 404. Адрес уже настроен —
            останется обернуть знак в <a href={env.LANDING_URL}>. */}
        <span className="brand-wordmark auth-enter inline-flex mb-8 lg:mb-0">
          {env.APP_NAME}
          <span className="brand-dot" aria-hidden="true">.</span>
        </span>
        <LanguageSwitcher className="auth-enter" />
      </div>

      <div className="relative z-[1] flex-1 flex items-center justify-center">
        {aside ? (
          <div
            className="w-full flex flex-col lg:flex-row items-center justify-center gap-10 lg:gap-[76px]"
            style={{ maxWidth: 1180 }}
          >
            <AuthAside key={`aside-${location.pathname}`} copy={aside} />
            {card}
          </div>
        ) : (
          card
        )}
      </div>
    </div>
  );
}
