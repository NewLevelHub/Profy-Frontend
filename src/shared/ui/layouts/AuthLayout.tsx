import { ReactNode } from 'react';
import { Outlet, useLocation } from 'react-router';
import { Compass, Landmark, Layers, ListChecks } from 'lucide-react';
import { env } from '@/shared/config/env';

/**
 * Копия левой колонки — своя у каждого экрана авторизации. Колонка есть везде:
 * без неё переход со входа на «Забыли пароль» читался как уход на другой сайт,
 * потому что половина экрана внезапно пустела. Текст при этом разный: вход и
 * регистрация рассказывают о продукте, экраны восстановления — о том, что
 * происходит прямо сейчас и что прогресс не потеряется.
 */
type AsideCopy = { eyebrow: string; head: string; accent: string; sub: string };

const ROUTE_ASIDE: Record<string, AsideCopy> = {
  '/login': {
    eyebrow: 'Личный кабинет',
    head: 'Продолжим с того места, где',
    accent: 'остановились',
    sub: 'Результаты тестов, подобранные направления и план поступления ждут тебя в кабинете.',
  },
  '/register': {
    eyebrow: 'Регистрация',
    head: 'Пара шагов — и',
    accent: 'можно начинать',
    sub: 'Профиль нужен, чтобы сохранить результаты тестов и продолжить с любого устройства.',
  },
  // Ниже — экраны восстановления. Колонка у них своя по смыслу, но она есть:
  // без неё переход со входа на «Забыли пароль» ощущался как уход на другой
  // сайт — половина экрана внезапно пустела.
  '/verify-email': {
    eyebrow: 'Подтверждение',
    head: 'Остался',
    accent: 'один шаг',
    sub: 'Введите код из письма — и профиль готов. Код действует 15 минут.',
  },
  '/forgot-password': {
    eyebrow: 'Восстановление',
    head: 'Вернём доступ —',
    accent: 'за пару минут',
    sub: 'Пришлём код на почту. Результаты тестов и прогресс при смене пароля не теряются.',
  },
  '/reset-password': {
    eyebrow: 'Новый пароль',
    head: 'Почти всё —',
    accent: 'осталось придумать пароль',
    sub: 'После сохранения сразу войдёте в кабинет. Результаты тестов останутся на месте.',
  },
};

/**
 * Цифры настоящие — те же, что в блоке статистики на лендинге. Оттенки плашек
 * под иконки взяты оттуда же (.feature-icon), чтобы обе поверхности читались
 * одной системой.
 */
const BLOCKS: { icon: ReactNode; tint: string; title: string; desc: string }[] = [
  {
    icon: <ListChecks size={18} strokeWidth={1.75} style={{ color: 'var(--pine)' }} />,
    tint: 'rgba(14, 74, 65, 0.10)',
    title: '3 теста в одном',
    desc: 'Интересы, личность и мотивация — за одно прохождение.',
  },
  {
    icon: <Compass size={18} strokeWidth={1.75} style={{ color: '#C06A1E' }} />,
    tint: 'rgba(219, 127, 46, 0.12)',
    title: '92 профессии',
    desc: 'Для каждой уже подобраны программы вузов.',
  },
  {
    icon: <Landmark size={18} strokeWidth={1.75} style={{ color: 'var(--lake)' }} />,
    tint: 'rgba(44, 106, 140, 0.12)',
    title: '250 университетов',
    desc: '110 в Казахстане и 140 международных.',
  },
  {
    icon: <Layers size={18} strokeWidth={1.75} style={{ color: 'var(--pine)' }} />,
    tint: 'rgba(79, 160, 147, 0.16)',
    title: '2400 программ',
    desc: 'С городом и рейтингом вуза.',
  },
];

function AuthAside({ copy }: { copy: AsideCopy }) {
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
          <div key={block.title} className={`auth-block auth-enter auth-enter-d${i + 3}`}>
            <span className="auth-block-icon" style={{ background: block.tint }}>
              {block.icon}
            </span>
            <div className="text-body-sm font-semibold text-primary leading-[1.25]">{block.title}</div>
            <div className="mt-[5px] text-caption leading-[1.45] text-secondary">{block.desc}</div>
          </div>
        ))}
      </div>
    </aside>
  );
}

export function AuthLayout() {
  const location = useLocation();
  const aside = ROUTE_ASIDE[location.pathname];

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
      <div className="relative z-[1] w-full mx-auto" style={{ maxWidth: 1180 }}>
        {/* Пока не ссылка: лендинг приезжает следующим тикетом, и до его мержа
            переход по env.LANDING_URL упирался бы в 404. Адрес уже настроен —
            останется обернуть знак в <a href={env.LANDING_URL}>. */}
        <span className="brand-wordmark auth-enter inline-flex mb-8 lg:mb-0">
          {env.APP_NAME}
          <span className="brand-dot" aria-hidden="true">.</span>
        </span>
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
