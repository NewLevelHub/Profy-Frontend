import { useEffect, useRef } from 'react';

/** Enhance offscreen content only: the page remains readable without motion or IO. */
export function useLandingReveal() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const page = root.current;
    if (!page || typeof IntersectionObserver === 'undefined') return;
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const blocks = Array.from(page.querySelectorAll<HTMLElement>('[data-landing-reveal]'));
    let observer: IntersectionObserver | undefined;
    const reveal = (block: HTMLElement) => {
      block.classList.remove('rd-reveal-pending');
      observer?.unobserve(block);
    };
    const start = () => {
      observer?.disconnect();
      blocks.forEach(block => block.classList.remove('rd-reveal-pending'));
      if (motion.matches) return;
      observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) reveal(entry.target as HTMLElement);
        });
      }, { threshold: 0.06, rootMargin: '0px 0px -24px 0px' });
      blocks.forEach(block => {
        if (block.getBoundingClientRect().top >= window.innerHeight) {
          block.classList.add('rd-reveal-pending');
          observer?.observe(block);
        }
      });
    };
    // Keyboard navigation must never focus an invisible control.
    const onFocus = (event: FocusEvent) => {
      if (!(event.target instanceof Element)) return;
      const block = event.target.closest<HTMLElement>('[data-landing-reveal]');
      if (block) reveal(block);
    };
    start();
    motion.addEventListener('change', start);
    page.addEventListener('focusin', onFocus);
    return () => {
      observer?.disconnect();
      blocks.forEach(block => block.classList.remove('rd-reveal-pending'));
      motion.removeEventListener('change', start);
      page.removeEventListener('focusin', onFocus);
    };
  }, []);

  return root;
}
