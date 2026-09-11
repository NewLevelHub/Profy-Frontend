import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { cn } from '@/shared/lib/cn';
import { formatNumber } from '@/shared/i18n/format';
import { buttonClasses, type ButtonSize } from '@/shared/ui/Button';
import { useCountUp, useInView, scrollToAnchor } from '../hooks';

/* ─── Появление по скроллу ─────────────────────────────────────────────────
   Раньше это был класс .reveal, который дописывал общий наблюдатель,
   обходивший весь документ. Теперь блок сам решает, когда он появился. */
export function Reveal({
  children,
  delay = 0,
  as: Tag = 'div',
  className,
  style,
}: {
  children: ReactNode;
  /** Ступень задержки: 1 ≈ 0.07s, как в исходной сетке .reveal-d1…d6. */
  delay?: number;
  as?: 'div' | 'section' | 'aside';
  className?: string;
  style?: React.CSSProperties;
}) {
  const [ref, inView] = useInView<HTMLDivElement>();

  return (
    <Tag
      ref={ref}
      className={cn('reveal', inView && 'is-visible', className)}
      style={
        delay
          ? ({ ...style, '--reveal-delay': `${(delay * 0.07).toFixed(2)}s` } as React.CSSProperties)
          : style
      }
    >
      {children}
    </Tag>
  );
}

/* ─── Надзаголовок секции ──────────────────────────────────────────────────
   Штрих цвета dawn ставится псевдоэлементом (landing.css); по центру он
   зеркалится, за это отвечает data-center. */
export function Eyebrow({ children, center = false }: { children: ReactNode; center?: boolean }) {
  return (
    <span
      className="eyebrow inline-flex items-center gap-[0.72rem] font-mono text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-muted max-[560px]:text-[0.67rem] max-[560px]:gap-[0.55rem] max-[560px]:tracking-[0.16em]"
      data-center={center ? 'true' : undefined}
    >
      {children}
    </span>
  );
}

/** Акцентная часть заголовка — углублённый dawn, читаемый на Fog. */
export function Accent({ children }: { children: ReactNode }) {
  return <span style={{ color: 'var(--dawn-deep)' }}>{children}</span>;
}

export function SectionHead({
  eyebrow,
  title,
  sub,
  center = false,
  className,
}: {
  eyebrow: string;
  title: ReactNode;
  sub?: ReactNode;
  center?: boolean;
  className?: string;
}) {
  return (
    <div className={cn('max-w-[680px] mb-[clamp(2.5rem,5vw,4rem)]', center && 'mx-auto text-center', className)}>
      <Eyebrow center={center}>{eyebrow}</Eyebrow>
      <h2 className="font-display font-bold text-[clamp(1.6rem,3.2vw,2.25rem)] leading-[1.2] tracking-[-0.03em] mt-4 text-balance" style={{ color: 'var(--text-heading)' }}>
        {title}
      </h2>
      {sub && (
        <p className={cn('text-secondary text-[clamp(1rem,1.4vw,1.1rem)] mt-4 max-w-[56ch]', center && 'mx-auto')}>
          {sub}
        </p>
      )}
    </div>
  );
}

/* ─── Число, набирающееся при появлении в кадре ────────────────────────── */
export function Counter({ target, className }: { target: number; className?: string }) {
  const [ref, inView] = useInView<HTMLSpanElement>({ threshold: 0.5 });
  const value = useCountUp(target, inView);
  return (
    <span ref={ref} className={className}>
      {formatNumber(value)}
    </span>
  );
}

/* ─── Призывы к действию ───────────────────────────────────────────────────
   Вид у них кнопочный, но ведут они на маршруты, поэтому это <Link>, а не
   <button>. Классы берутся из того же buttonClasses(), что и у продуктовой
   кнопки — разъехаться при следующей правке кнопки они не могут. */
export function CtaLink({
  to,
  children,
  variant = 'primary',
  size = 'md',
  className,
}: {
  to: string;
  children: ReactNode;
  variant?: 'primary' | 'ghost';
  size?: ButtonSize;
  className?: string;
}) {
  return (
    <Link
      to={to}
      className={cn(
        buttonClasses({ variant, size }),
        // .btn-ghost на лендинге был светлее продуктового: заливка surface и
        // волосяная рамка, а не обводка цветом бренда на прозрачном фоне.
        variant === 'ghost' && 'bg-surface border-strong text-primary hover:bg-hover hover:border-brand',
        'group no-underline',
        className,
      )}
    >
      {children}
    </Link>
  );
}

/** Переход к якорю внутри страницы — не маршрут, поэтому обычная кнопка. */
export function AnchorButton({
  target,
  children,
  variant = 'ghost',
  size = 'md',
  className,
}: {
  target: string;
  children: ReactNode;
  variant?: 'primary' | 'ghost';
  size?: ButtonSize;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => scrollToAnchor(target)}
      className={cn(
        buttonClasses({ variant, size }),
        variant === 'ghost' && 'bg-surface border-strong text-primary hover:bg-hover hover:border-brand',
        'group',
        className,
      )}
    >
      {children}
    </button>
  );
}

/** Стрелка, уезжающая вправо при наведении на призыв. */
export function ArrowIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      className="w-4 h-4 shrink-0 transition-transform group-hover:translate-x-[3px]"
      aria-hidden="true"
    >
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

/** Галочка в строках доверия под призывом. */
export function CheckIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      className={cn('w-[15px] h-[15px] shrink-0', className)}
      style={style}
      aria-hidden="true"
    >
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}

/** Строка «прогресс сохраняется · можно прерваться · без оценок». */
const TRUST_KEYS = ['trust.saveProgress', 'trust.pauseResume', 'trust.noGrades'] as const;

export function TrustRow({
  inverted = false,
  center = false,
  className,
}: { inverted?: boolean; center?: boolean; className?: string }) {
  const { t } = useTranslation('landing');
  return (
    <div className={cn('flex flex-wrap gap-y-[0.7rem] gap-x-[1.4rem] mt-[1.8rem]', center ? 'justify-center' : 'max-w-[52ch]', className)}>
      {TRUST_KEYS.map(key => (
        <span
          key={key}
          className="flex items-center gap-[0.45rem] text-[0.86rem] font-medium"
          style={{
            // На инвертированном блоке призыва текст идёт по заливке --pine,
            // поэтому и подпись, и галочка светлеют.
            color: inverted ? 'color-mix(in srgb, var(--on-brand-solid) 70%, transparent)' : 'var(--text-subtle)',
          }}
        >
          <CheckIcon style={{ color: inverted ? 'var(--dawn-light)' : 'var(--pine-light)' }} />
          {t(key)}
        </span>
      ))}
    </div>
  );
}
