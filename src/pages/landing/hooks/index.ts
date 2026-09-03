import { useEffect, useRef, useState, type RefObject } from 'react';

/** Учитывает системную настройку «меньше движения». */
function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

interface InViewOptions {
  threshold?: number;
  rootMargin?: string;
  /** По умолчанию элемент «загорается» один раз и больше не наблюдается. */
  once?: boolean;
}

/**
 * Попадание элемента в кадр. Заменяет ручной IntersectionObserver из старого
 * лендинга: там один общий наблюдатель обходил document.querySelectorAll и
 * дописывал класс в чужой DOM — здесь каждый блок отвечает за себя сам.
 *
 * Без IntersectionObserver (очень старые браузеры) сразу возвращает true,
 * иначе страница осталась бы пустой — та же подстраховка, что раньше давал
 * <noscript> с принудительным opacity:1.
 */
export function useInView<T extends HTMLElement>(
  options: InViewOptions = {},
): [RefObject<T | null>, boolean] {
  const { threshold = 0.12, rootMargin = '0px 0px -60px 0px', once = true } = options;
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined') {
      setInView(true);
      return;
    }

    const io = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setInView(true);
            if (once) io.unobserve(entry.target);
          } else if (!once) {
            setInView(false);
          }
        }
      },
      { threshold, rootMargin },
    );

    io.observe(el);
    return () => io.disconnect();
  }, [threshold, rootMargin, once]);

  return [ref, inView];
}

/**
 * Число, набирающееся от нуля до целевого значения, когда блок появился в
 * кадре. При включённой настройке «меньше движения» сразу отдаёт результат.
 */
export function useCountUp(target: number, active: boolean, duration = 1600): number {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!active) return;
    if (prefersReducedMotion()) {
      setValue(target);
      return;
    }

    let frame = 0;
    let startTs: number | null = null;

    const step = (ts: number) => {
      if (startTs === null) startTs = ts;
      const progress = Math.min((ts - startTs) / duration, 1);
      // ease-out cubic — быстрый старт, мягкая остановка
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.floor(eased * target));
      if (progress < 1) frame = requestAnimationFrame(step);
      else setValue(target);
    };

    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [target, active, duration]);

  return value;
}

/**
 * Доля прокрученной страницы (0..1) и признак «страница сдвинута с самого
 * верха» — по нему шапка собирается в плавающий остров.
 */
export function useScrollProgress(): { progress: number; scrolled: boolean } {
  const [state, setState] = useState({ progress: 0, scrolled: false });

  useEffect(() => {
    let ticking = false;

    const measure = () => {
      ticking = false;
      const y = window.scrollY || document.documentElement.scrollTop;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setState({
        progress: max > 0 ? Math.min(y / max, 1) : 0,
        scrolled: y > 10,
      });
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return state;
}

/**
 * Параллакс декоративного маскота: смещение считается от расстояния между
 * центром элемента и центром окна. Трансформация пишется прямо в style в
 * обход рендера — это кадровая анимация, гонять её через setState значило бы
 * перерисовывать секцию на каждый кадр прокрутки.
 */
export function useParallax<T extends HTMLElement>(speed: number, base = ''): RefObject<T | null> {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;

    let ticking = false;

    const update = () => {
      ticking = false;
      const rect = el.getBoundingClientRect();
      const center = rect.top + rect.height / 2;
      const offset = (center - window.innerHeight / 2) * speed;
      el.style.transform = `${base ? `${base} ` : ''}translateY(${offset.toFixed(1)}px)`;
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [speed, base]);

  return ref;
}

/**
 * След курсора — редкие следы двух цветов вдоль движения мыши. Только для
 * точных указателей: на тачскрине событий mousemove нет, а на слабых машинах
 * лишние узлы в DOM ни к чему.
 */
export function useCursorTrail(enabled = true): void {
  useEffect(() => {
    if (!enabled || prefersReducedMotion()) return;
    if (typeof window.matchMedia !== 'function' || !window.matchMedia('(pointer:fine)').matches) return;

    let lastX: number | null = null;
    let lastY: number | null = null;
    let alternate = false;
    // Точки живут дольше самого обработчика: при размонтировании их нужно
    // убрать вручную, иначе после ухода с лендинга останется мусор в body.
    const live = new Set<{ node: HTMLElement; timer: number }>();

    const onMove = (e: MouseEvent) => {
      if (lastX !== null && lastY !== null) {
        const dx = e.clientX - lastX;
        const dy = e.clientY - lastY;
        if (dx * dx + dy * dy < 900) return; // не чаще, чем раз в ~30px
      }
      lastX = e.clientX;
      lastY = e.clientY;
      alternate = !alternate;

      const dot = document.createElement('div');
      dot.className = 'landing-trail-dot';
      dot.style.left = `${e.clientX}px`;
      dot.style.top = `${e.clientY}px`;
      dot.style.background = alternate ? 'var(--pine)' : 'var(--dawn)';
      document.body.appendChild(dot);

      const entry = {
        node: dot,
        timer: window.setTimeout(() => {
          dot.remove();
          live.delete(entry);
        }, 900),
      };
      live.add(entry);
    };

    document.addEventListener('mousemove', onMove, { passive: true });
    return () => {
      document.removeEventListener('mousemove', onMove);
      for (const entry of live) {
        clearTimeout(entry.timer);
        entry.node.remove();
      }
      live.clear();
    };
  }, [enabled]);
}

/**
 * Плавная прокрутка к якорю внутри страницы. Живёт здесь, а не в
 * html{scroll-behavior:smooth}: глобальное правило подействовало бы на все
 * маршруты приложения, а нужно оно только лендингу.
 */
export function scrollToAnchor(id: string): void {
  const target = document.getElementById(id);
  if (!target) return;
  target.scrollIntoView({
    behavior: prefersReducedMotion() ? 'auto' : 'smooth',
    block: 'start',
  });
}
