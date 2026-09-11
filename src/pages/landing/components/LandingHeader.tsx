import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { cn } from '@/shared/lib/cn';
import { env } from '@/shared/config/env';
import { LanguageSwitcher } from '@/shared/ui/LanguageSwitcher';
import { LOCALE_SWITCH_ENABLED } from '@/shared/store/locale';
import { ThemeToggle } from '@/shared/ui/ThemeToggle';
import { CtaLink, ArrowIcon } from './primitives';
import { useScrollProgress, scrollToAnchor } from '../hooks';

const NAV_IDS = ['how', 'features', 'inside', 'try', 'faq'] as const;

/** Вордмарк: имя набором и акцентная точка на базовой линии. */
function Wordmark({ className, onClick }: { className?: string; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick ?? (() => scrollToAnchor('hero'))}
      aria-label={env.APP_NAME}
      className={cn(
        'group inline-flex items-baseline font-display font-bold text-[1.22rem] tracking-[-0.045em] leading-none',
        className,
      )}
      style={{ color: 'var(--text-heading)' }}
    >
      {env.APP_NAME}
      <span
        aria-hidden="true"
        className="ml-[0.04em] inline-block transition-transform group-hover:-translate-y-[0.12em]"
        style={{ color: 'var(--dawn)' }}
      >
        .
      </span>
    </button>
  );
}

export function LandingHeader() {
  const { t } = useTranslation('landing');
  const { progress, scrolled } = useScrollProgress();
  const [menuOpen, setMenuOpen] = useState(false);
  const nav = NAV_IDS.map(id => ({ id, label: t(`nav.${id}`) }));

  // Пока открыто мобильное меню, страница под ним не прокручивается.
  // Снимаем блокировку и при размонтировании: уйти с лендинга можно прямо
  // из меню, и застрявший overflow:hidden достался бы всему приложению.
  useEffect(() => {
    if (!menuOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [menuOpen]);

  // Esc закрывает меню — обычное ожидание от полноэкранного слоя.
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  const goToAnchor = (id: string) => {
    setMenuOpen(false);
    scrollToAnchor(id);
  };

  return (
    <>
      {/* Полоса прочитанного. transform вместо width — не вызывает пересчёт раскладки. */}
      <div
        className="fixed top-0 left-0 h-[3px] w-full origin-left z-[1000]"
        style={{ background: 'var(--dawn)', transform: `scaleX(${progress})` }}
        aria-hidden="true"
      />

      {/* Шапка не разрезает страницу линией: сверху она прозрачна, а при
          прокрутке собирается в плавающий остров со стеклом и обводкой. */}
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-[900] transition-[padding] duration-200',
          scrolled ? 'py-[0.65rem]' : 'py-[1.1rem]',
        )}
      >
        <div className="w-[min(1220px,92%)] mx-auto">
          <div
            className={cn(
              'flex items-center justify-between gap-4 rounded-[var(--radius)] py-[0.45rem] pl-4 pr-2 border transition-colors duration-200',
              scrolled ? 'border-default backdrop-blur-[16px] backdrop-saturate-150' : 'border-transparent',
            )}
            style={scrolled ? { background: 'color-mix(in srgb, var(--bg-surface) 82%, transparent)' } : undefined}
          >
            <Wordmark />

            <nav className="hidden min-[901px]:flex items-center gap-[2.1rem]">
              {nav.map(item => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => goToAnchor(item.id)}
                  className="nav-underline relative text-[0.93rem] font-medium text-secondary hover:text-primary transition-colors"
                >
                  {item.label}
                </button>
              ))}
            </nav>

            <div className="flex items-center gap-[0.9rem]">
              <LanguageSwitcher className="hidden min-[901px]:inline-flex" />
              <ThemeToggle className="hidden min-[901px]:inline-flex" />

              <Link
                to="/login"
                className="hidden min-[901px]:inline text-[0.93rem] font-semibold text-secondary hover:text-primary transition-colors no-underline"
              >
                {t('cta.login')}
              </Link>
              <CtaLink to="/register" size="sm" className="hidden min-[901px]:inline-flex">
                {t('cta.takeTest')}
                <ArrowIcon />
              </CtaLink>

              <button
                type="button"
                onClick={() => setMenuOpen(v => !v)}
                aria-label={menuOpen ? t('cta.closeMenu') : t('cta.openMenu')}
                aria-expanded={menuOpen}
                className="min-[901px]:hidden w-10 h-10 rounded-[var(--radius)] bg-surface border border-default flex items-center justify-center"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-[18px] h-[18px] text-primary">
                  {menuOpen ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Мобильное меню */}
      <div
        className={cn(
          'fixed inset-0 z-[895] flex-col gap-[1.6rem] px-[6%] pt-[6.5rem] pb-12 backdrop-blur-[10px] transition-all duration-200 min-[901px]:hidden',
          menuOpen ? 'flex opacity-100 translate-y-0 pointer-events-auto' : 'hidden opacity-0 -translate-y-3 pointer-events-none',
        )}
        style={{ background: 'color-mix(in srgb, var(--bg-page) 98%, transparent)' }}
      >
        {nav.map(item => (
          <button
            key={item.id}
            type="button"
            onClick={() => goToAnchor(item.id)}
            className="text-left font-display text-[1.25rem] font-semibold tracking-[-0.02em]"
            style={{ color: 'var(--text-heading)' }}
          >
            {item.label}
          </button>
        ))}
        {LOCALE_SWITCH_ENABLED && (
          <div className="flex items-center justify-between gap-3 mt-2">
            <span className="text-body-sm font-semibold text-secondary">{t('cta.language', { defaultValue: 'Язык' })}</span>
            <LanguageSwitcher />
          </div>
        )}
        <div className="flex items-center justify-between gap-3">
          <span className="text-body-sm font-semibold text-secondary">{t('cta.theme', { defaultValue: 'Тема' })}</span>
          <ThemeToggle />
        </div>

        <div className="flex flex-col gap-[0.9rem] mt-2">
          <CtaLink to="/login" variant="ghost" size="lg" className="w-full">
            {t('cta.login')}
          </CtaLink>
          <CtaLink to="/register" size="lg" className="w-full">
            {t('cta.takeDiagnostic')}
            <ArrowIcon />
          </CtaLink>
        </div>
      </div>
    </>
  );
}
