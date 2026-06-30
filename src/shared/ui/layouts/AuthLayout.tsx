import { Outlet } from 'react-router';
import { env } from '@/shared/config/env';

const FEATURES = [
  { emoji: '🧠', text: 'Анализ мышления и интересов' },
  { emoji: '🚀', text: 'Персональная карта профессий' },
  { emoji: '🎓', text: 'Подбор университетов и программ' },
];

export function AuthLayout() {
  return (
    <div className="min-h-screen bg-page text-primary flex">
      {/* ── Left brand panel (desktop only) ───────────────── */}
      <div className="hidden lg:flex flex-col flex-1 bg-brand p-12 relative overflow-hidden select-none">
        {/* Decorative blobs */}
        <div className="absolute top-[-80px] left-[-60px] w-80 h-80 rounded-full bg-white/10 pointer-events-none" />
        <div className="absolute bottom-[-40px] right-[-80px] w-96 h-96 rounded-full bg-white/8 pointer-events-none" />

        <div className="relative z-10 flex flex-col h-full">
          {/* Logo */}
          <span className="font-black text-xl tracking-tight text-on-brand">
            {env.APP_NAME}
          </span>

          {/* Hero */}
          <div className="flex-1 flex flex-col justify-center max-w-sm">
            <h1 className="text-display font-black text-on-brand leading-tight mb-4">
              Найди свой путь<br />в профессию
            </h1>
            <p className="text-body text-on-brand/80 leading-relaxed">
              Пройди диагностику и получи персональную карту профессий, подходящих именно тебе.
            </p>

            <div className="mt-10 flex flex-col gap-4">
              {FEATURES.map(({ emoji, text }) => (
                <div key={text} className="flex items-center gap-3">
                  <span className="text-xl" aria-hidden="true">{emoji}</span>
                  <p className="text-caption font-semibold text-on-brand/90">{text}</p>
                </div>
              ))}
            </div>
          </div>

          <p className="text-small text-on-brand/40">
            © {new Date().getFullYear()} {env.APP_NAME}
          </p>
        </div>
      </div>

      {/* ── Right form panel ───────────────────────────────── */}
      <div className="flex-1 lg:max-w-[480px] lg:flex-none flex flex-col items-center justify-center px-6 py-12">
        {/* Mobile logo */}
        <div className="lg:hidden mb-8 text-center">
          <span className="font-black text-2xl tracking-tight text-primary">
            {env.APP_NAME}
          </span>
          <p className="text-secondary text-sm mt-1">Платформа карьерной ориентации</p>
        </div>

        <div className="w-full max-w-md">
          <div className="rounded-2xl border border-default bg-surface p-6 sm:p-8 shadow-sm">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}
