import type { ReactNode } from 'react';
import { Mascot } from '@/shared/ui/Mascot';
import { cn } from '@/shared/lib/cn';
import {
  Accent,
  AnchorButton,
  ArrowIcon,
  CtaLink,
  Eyebrow,
  Reveal,
  TrustRow,
} from './primitives';
import { useParallax } from '../hooks';

/** Общая оболочка парящей карточки: стекло, волосяная рамка, точка-метка. */
function FloatCard({
  position,
  label,
  dot,
  children,
}: {
  position: string;
  label: string;
  dot: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        'float-card absolute z-[4] rounded-[var(--radius)] border border-strong shadow-pop px-[1.05rem] py-[0.9rem]',
        'max-[680px]:w-[clamp(128px,42vw,150px)] max-[680px]:px-[0.8rem] max-[680px]:py-[0.7rem]',
        position,
      )}
    >
      <div
        className="fc-label flex items-center gap-[0.4rem] font-mono text-[0.6rem] font-medium uppercase tracking-[0.06em] text-subtle mb-2"
        style={{ '--fc-dot': dot } as React.CSSProperties}
      >
        {label}
      </div>
      {children}
    </div>
  );
}

export function HeroSection() {
  // База центрирования не передаётся в параллакс намеренно: в Tailwind 4
  // утилиты translate-* пишут в отдельное свойство `translate`, которое
  // применяется вместе с `transform`. Продублируй смещение здесь — и маскот
  // уехал бы на половину своей ширины влево. Параллакс двигает только по Y.
  const mascotRef = useParallax<HTMLDivElement>(0.08);

  return (
    <section
      id="hero"
      className="relative flex items-center overflow-hidden isolate min-h-[100svh] pt-[clamp(7rem,12vw,9rem)] pb-[clamp(5.5rem,10vw,8.5rem)] max-[1024px]:min-h-0 max-[1024px]:pt-[clamp(6.5rem,16vw,8rem)]"
    >
      <div className="hero-bg" />

      {/* Крупная органическая форма справа уводит взгляд вниз, к полосе цифр.
          На узких экранах она мешает тексту — остаётся только свечение. */}
      <div className="absolute inset-0 z-0 w-full h-full pointer-events-none max-[1024px]:hidden" aria-hidden="true">
        <svg viewBox="0 0 1440 900" preserveAspectRatio="none" className="w-full h-full block">
          <defs>
            {/* Верхний стоп — тот же хвойный, чуть подсветлённый: сплошной
                --pine-light дал бы мятную заливку вместо глубокой. */}
            <linearGradient id="hero-cave" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="color-mix(in srgb, var(--pine) 78%, var(--pine-light))" />
              <stop offset="1" stopColor="var(--pine)" />
            </linearGradient>
          </defs>
          <path
            fill="color-mix(in srgb, var(--pine) 10%, transparent)"
            d="M1440 48c-200 56-350 148-414 262-64 114-32 216-128 314-96 98-136 178-116 276h658z"
          />
          <path
            fill="url(#hero-cave)"
            d="M1440 148c-170 50-300 130-360 232-60 102-30 200-116 292-86 92-124 160-106 228h582z"
          />
        </svg>
      </div>

      <div className="relative z-[2] w-[min(1220px,92%)] mx-auto grid grid-cols-[1.05fr_.95fr] gap-12 items-center max-[1024px]:grid-cols-1">
        {/* min-w-0: без него колонка грид раздувается под самый широкий
            неразрывный элемент, и строка доверия уезжает под визуал. */}
        <Reveal className="min-w-0 max-[1024px]:text-center">
          <Eyebrow>Профориентация нового поколения</Eyebrow>
          <h1
            className="font-display font-bold text-[clamp(2rem,3.9vw,3rem)] leading-[1.14] tracking-[-0.035em] text-balance mt-[1.4rem]"
            style={{ color: 'var(--midnight)' }}
          >
            Найди профессию,
            <br />
            от которой <Accent>горят глаза</Accent>
          </h1>
          <p className="text-secondary text-[clamp(1.02rem,1.6vw,1.18rem)] mt-[1.3rem] max-w-[52ch] max-[1024px]:mx-auto">
            Profy — онлайн-диагностика для старшеклассников. Три теста за одно прохождение: интересы,
            личность и мотивация. На выходе — понятный портрет себя, подходящие профессии и реальные
            университеты с программами под каждую из них.
          </p>

          <div className="flex flex-wrap gap-4 mt-[2.1rem] max-[1024px]:justify-center">
            <CtaLink to="/register" size="lg">
              Пройти диагностику
              <ArrowIcon />
            </CtaLink>
            <AnchorButton target="how" size="lg">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 shrink-0" aria-hidden="true">
                <circle cx="12" cy="12" r="9" />
                <path d="M10 8.5l6 3.5-6 3.5z" fill="currentColor" stroke="none" />
              </svg>
              Как это работает
            </AnchorButton>
          </div>

          {/* Ниже 1024 первый экран складывается в колонку и текст встаёт по
              центру — строка доверия должна выравниваться вместе с ним. */}
          <TrustRow className="max-[1024px]:justify-center max-[1024px]:max-w-none" />
        </Reveal>

        <Reveal
          delay={2}
          className="relative w-full max-w-[600px] aspect-[1/1.02] mx-auto max-[1024px]:max-w-[440px] max-[1024px]:mt-8 max-[680px]:aspect-[1/1.25]"
        >
          {/* Два пунктирных кольца «тропы» вместо цветного пятна за персонажем. */}
          <svg viewBox="0 0 400 400" className="ring-outer absolute inset-0 w-full h-full" aria-hidden="true">
            <circle cx="200" cy="200" r="188" fill="none" stroke="var(--pine)" strokeOpacity=".32" strokeWidth="2" strokeDasharray="1 16" strokeLinecap="round" />
          </svg>
          <svg viewBox="0 0 400 400" className="ring-inner absolute inset-0 w-full h-full" aria-hidden="true">
            <circle cx="200" cy="200" r="150" fill="none" stroke="var(--dawn)" strokeOpacity=".3" strokeWidth="2" strokeDasharray="1 14" strokeLinecap="round" />
          </svg>

          <div ref={mascotRef} className="mascot-parallax absolute top-[52%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-[3]">
            <Mascot state="welcome" size="clamp(240px, 34vw, 410px)" className="mascot-hero" />
          </div>

          <FloatCard position="top-[2%] left-[-6%] card-a max-[680px]:left-[-3%]" label="Подходит тебе" dot="var(--pine)">
            <div className="flex items-center gap-[0.6rem]">
              <span
                className="w-8 h-8 rounded-[var(--radius)] flex items-center justify-center font-display font-bold text-[0.6rem] tracking-[-0.02em] shrink-0"
                style={{ background: 'var(--pine)', color: 'var(--paper)' }}
              >
                ДА
              </span>
              <div>
                <strong className="block text-[0.78rem] font-bold max-[680px]:text-[0.7rem]" style={{ color: 'var(--midnight)' }}>
                  Дата-аналитик
                </strong>
                <small className="text-[0.65rem] text-subtle">сильное совпадение</small>
              </div>
            </div>
          </FloatCard>

          <FloatCard position="top-[6%] right-[-8%] card-b max-[680px]:right-[-3%]" label="Программа в вузе" dot="var(--lake)">
            <strong className="block text-[0.85rem] font-bold mb-[0.4rem]" style={{ color: 'var(--midnight)' }}>
              Nazarbayev University
            </strong>
            <em className="not-italic text-[0.68rem] text-subtle">Computer Science · Астана</em>
          </FloatCard>

          <FloatCard position="bottom-[8%] left-[-9%] card-c max-[680px]:left-[-3%]" label="Карта интересов" dot="var(--dawn)">
            {[
              { label: 'Исследования', width: '92%', color: 'var(--pine-light)' },
              { label: 'Творчество', width: '81%', color: 'var(--lake)' },
              { label: 'Работа с людьми', width: '68%', color: 'var(--dawn)' },
            ].map(bar => (
              <div key={bar.label} className="mb-2 text-[0.66rem] text-secondary last:mb-0">
                <span className="block mb-[0.22rem]">{bar.label}</span>
                <div className="w-full h-[5px] rounded-pill overflow-hidden" style={{ background: 'var(--border-faint)' }}>
                  <div className="h-full rounded-pill" style={{ width: bar.width, background: bar.color }} />
                </div>
              </div>
            ))}
          </FloatCard>

          <FloatCard position="bottom-0 right-[-6%] card-d max-[680px]:right-[-3%]" label="Твой маршрут" dot="var(--pine-light)">
            <ul className="list-none">
              <li className="flex items-center gap-2 text-[0.72rem] mb-[0.4rem] text-secondary">
                <span className="w-4 h-4 rounded-full shrink-0 flex items-center justify-center" style={{ background: 'var(--pine-light)' }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="var(--paper)" strokeWidth="3" className="w-[9px] h-[9px]">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                </span>
                <span className="line-through text-subtle">Пройти тесты</span>
              </li>
              <li className="flex items-center gap-2 text-[0.72rem] mb-[0.4rem] text-secondary">
                <span
                  className="dot-pulse w-4 h-4 rounded-full shrink-0 flex items-center justify-center relative"
                  style={{ border: '1.5px solid var(--dawn)' }}
                />
                <span className="font-semibold" style={{ color: 'var(--midnight)' }}>
                  Изучить профессии
                </span>
              </li>
              <li className="flex items-center gap-2 text-[0.72rem] text-secondary">
                <span className="w-4 h-4 rounded-full shrink-0" style={{ border: '1.5px solid var(--border-strong)' }} />
                <span>Выбрать программу</span>
              </li>
            </ul>
          </FloatCard>
        </Reveal>
      </div>
    </section>
  );
}
