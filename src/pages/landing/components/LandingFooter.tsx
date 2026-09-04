import type { ReactNode } from 'react';
import { env } from '@/shared/config/env';
import { scrollToAnchor } from '../hooks';

/* Соцсети, «О нас» и правовые страницы ждут настоящих адресов. До тех пор они
   не ссылки, а текст: <a href="#"> прокручивал бы страницу наверх, и клик по
   «Конфиденциальности» выглядел бы как поломка, а не как «раздела пока нет».
   Когда адреса появятся, span меняется на <a>/<Link> — разметка та же. */
const SOCIAL: { label: string; icon: ReactNode }[] = [
  { label: 'Telegram', icon: <path d="M21 4L3 11l6 2.5M21 4l-4 17-8-6.5M21 4L9 14.5v5" /> },
  { label: 'Instagram', icon: <><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.2" cy="6.8" r="1" /></> },
  { label: 'WhatsApp', icon: <path d="M21 11.5a8.5 8.5 0 01-12.3 7.6L3 20l1-5.5A8.5 8.5 0 1121 11.5z" /> },
];

function AnchorLink({ id, children }: { id: string; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={() => scrollToAnchor(id)}
      className="text-left text-[0.9rem] text-subtle hover:text-brand transition-colors"
    >
      {children}
    </button>
  );
}

export function LandingFooter() {
  return (
    <footer className="relative pt-[4.5rem] pb-8 bg-surface" style={{ borderTop: '1px solid var(--border-faint)' }}>
      <div className="w-[min(1220px,92%)] mx-auto">
        <div
          className="grid grid-cols-[1.6fr_1fr_1fr_1.2fr] gap-10 pb-12 max-[1024px]:grid-cols-2 max-[1024px]:gap-y-10 max-[680px]:grid-cols-1"
          style={{ borderBottom: '1px solid var(--border-faint)' }}
        >
          <div>
            <button
              type="button"
              onClick={() => scrollToAnchor('hero')}
              className="group inline-flex items-baseline font-display font-bold text-[1.35rem] tracking-[-0.045em] leading-none"
              style={{ color: 'var(--midnight)' }}
              aria-label={env.APP_NAME}
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
            <p className="text-subtle text-[0.9rem] mt-4 max-w-[30ch] leading-[1.6]">
              Онлайн-диагностика для старшеклассников: интересы, личность и мотивация, персональный
              отчёт и реальные университеты с программами под каждую профессию.
            </p>
            <div className="flex gap-[0.7rem] mt-6">
              {SOCIAL.map(item => (
                <span
                  key={item.label}
                  title={`${item.label} — адрес добавим позже`}
                  aria-label={item.label}
                  className="w-[38px] h-[38px] rounded-[var(--radius)] bg-page border border-default flex items-center justify-center text-secondary"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4">
                    {item.icon}
                  </svg>
                </span>
              ))}
            </div>
          </div>

          <div>
            <h5 className="font-display text-[0.78rem] font-semibold uppercase tracking-[0.04em] text-secondary mb-5">Продукт</h5>
            <ul className="flex flex-col gap-[0.8rem] list-none">
              <li><AnchorLink id="how">Как работает</AnchorLink></li>
              <li><AnchorLink id="features">Возможности</AnchorLink></li>
              <li><AnchorLink id="inside">Что внутри</AnchorLink></li>
            </ul>
          </div>

          <div>
            <h5 className="font-display text-[0.78rem] font-semibold uppercase tracking-[0.04em] text-secondary mb-5">Компания</h5>
            <ul className="flex flex-col gap-[0.8rem] list-none">
              <li><span className="text-[0.9rem] text-subtle">О нас</span></li>
              <li><AnchorLink id="faq">Вопросы</AnchorLink></li>
            </ul>
          </div>

          <div>
            <h5 className="font-display text-[0.78rem] font-semibold uppercase tracking-[0.04em] text-secondary mb-5">Контакты</h5>
            <ul className="flex flex-col gap-[0.8rem] list-none">
              <li>
                <a href="mailto:hello@profy.kz" className="text-[0.9rem] text-subtle hover:text-brand transition-colors no-underline">
                  hello@profy.kz
                </a>
              </li>
              <li><span className="text-[0.9rem] text-subtle">@profy_kz</span></li>
              <li><span className="text-[0.9rem] text-subtle">Алматы, Казахстан</span></li>
            </ul>
          </div>
        </div>

        <div className="flex flex-wrap justify-between items-center gap-4 pt-8">
          <p className="text-[0.85rem] text-subtle">© 2026 {env.APP_NAME}. Сделано в Казахстане</p>
          <div className="flex gap-6">
            <span className="text-[0.85rem] text-subtle">Конфиденциальность</span>
            <span className="text-[0.85rem] text-subtle">Условия использования</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
