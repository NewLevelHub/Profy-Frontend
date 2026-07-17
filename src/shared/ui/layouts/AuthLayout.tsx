import { Outlet } from 'react-router';
import { env } from '@/shared/config/env';
import { MascotVideo } from '@/shared/ui/MascotVideo';

const FEATURES = [
  { emoji: '🧠', text: 'Анализ мышления и интересов' },
  { emoji: '🚀', text: 'Персональная карта профессий' },
  { emoji: '🎓', text: 'Подбор университетов и программ' },
];

export function AuthLayout() {
  return (
    <div className="min-h-screen text-primary lg:grid" style={{ gridTemplateColumns: '1.15fr .85fr' }}>
      {/* ── Left brand panel (desktop only) ───────────────── */}
      <div
        className="hidden lg:flex flex-col relative overflow-hidden select-none p-[46px_60px] text-white"
        style={{ background: 'linear-gradient(155deg,#7C3AED 0%,#6D28D9 55%,#5B21B6 100%)', color: '#FFFFFF' }}
      >
        {/* Decorative blobs */}
        <div className="absolute top-[-120px] left-[-90px] w-[420px] h-[420px] rounded-full pointer-events-none" style={{ background: 'rgba(255,255,255,0.12)' }} />
        <div className="absolute bottom-[-160px] right-[-60px] w-[420px] h-[420px] rounded-full pointer-events-none" style={{ background: 'rgba(255,255,255,0.08)' }} />
        <div className="absolute rounded-full pointer-events-none" style={{ top: '42%', left: '30%', width: 130, height: 130, background: 'rgba(234,88,12,0.30)', filter: 'blur(8px)' }} />

        {/* Mascot — near-white bg keyed out on canvas so subject colors stay intact */}
        <div
          className="absolute inset-y-0 right-[-14%] w-[58%] pointer-events-none flex items-end justify-center pb-0 translate-y-30"
          aria-hidden="true"
        >
          <MascotVideo
            src="/video/IMG_1050.MOV"
            className="w-full h-auto max-h-[85%] object-contain object-bottom"
          />
        </div>

        <div className="relative z-10 flex flex-col h-full">
          {/* Logo */}
          <span className="font-black text-[26px] tracking-tight">
            {env.APP_NAME}
          </span>

          {/* Hero */}
          <div className="flex-1 flex flex-col justify-center max-w-[460px]">
            <h1 className="font-black mb-[18px] tracking-[-0.02em]" style={{ fontSize: 54, lineHeight: 1.05 }}>
              Найди свой путь<br />в профессию
            </h1>
            <p className="mb-8 font-medium" style={{ fontSize: 18, lineHeight: 1.5, color: 'rgba(255,255,255,0.9)' }}>
              Пройди диагностику и получи персональную карту профессий, подходящих именно тебе.
            </p>

            <div className="flex flex-col gap-[14px]">
              {FEATURES.map(({ emoji, text }) => (
                <div
                  key={text}
                  className="flex items-center gap-[13px] rounded-[16px] px-[17px] py-[13px] border"
                  style={{ background: 'rgba(255,255,255,0.12)', borderColor: 'rgba(255,255,255,0.16)', backdropFilter: 'blur(4px)' }}
                >
                  <span className="text-[22px]" aria-hidden="true">{emoji}</span>
                  <span className="font-bold" style={{ fontSize: 16 }}>{text}</span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-[13px] font-semibold" style={{ color: 'rgba(255,255,255,0.6)' }}>
            © {new Date().getFullYear()} {env.APP_NAME}
          </p>
        </div>
      </div>

      {/* ── Right form panel ───────────────────────────────── */}
      <div className="flex flex-col items-center justify-center px-10 py-12 min-h-screen lg:min-h-0" style={{ background: '#FFFFFF' }}>
        {/* Mobile logo */}
        <div className="lg:hidden mb-8 text-center">
          <span className="font-black text-2xl tracking-tight text-primary">
            {env.APP_NAME}
          </span>
          <p className="text-secondary text-sm mt-1">Платформа карьерной ориентации</p>
        </div>

        <div className="w-full max-w-[380px]">
          <div className="bg-surface border border-default p-[38px_34px]" style={{ borderRadius: 24, boxShadow: '0 18px 50px rgba(30,27,75,0.10)' }}>
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}
