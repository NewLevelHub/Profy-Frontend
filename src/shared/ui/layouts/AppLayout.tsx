import { useEffect, useLayoutEffect, useRef } from 'react';
import { Outlet, useLocation, useNavigationType } from 'react-router';
import { TopRail } from '@/shared/ui/navigation/TopRail';
import { Spinner } from '@/shared/ui';
import { useAssessmentSync } from '@/shared/hooks/useAssessmentSync';
import { useAssessmentStore } from '@/shared/store/assessment';

// Keyed by location.key so each history entry keeps its own scroll position.
const scrollPositions = new Map<string, number>();

/**
 * Remount key for `.page-enter`. Top-rail tabs (Результаты / Университеты /
 * Профиль / Админка) should fade in; nested screens under a tab should not.
 *
 * `/admin/*` shares one key so the glass shell + side rail stay mounted and
 * sidebar clicks swap content instantly. Other top-level areas still key by
 * full path (university detail, results deep links, etc.).
 */
function pageEnterKey(pathname: string): string {
  if (pathname === '/admin' || pathname.startsWith('/admin/')) return '/admin';
  return pathname;
}

export function AppLayout() {
  useAssessmentSync();
  const syncDone = useAssessmentStore(s => s.syncDone);
  const mainRef = useRef<HTMLElement>(null);
  const location = useLocation();
  const navigationType = useNavigationType();
  const enterKey = pageEnterKey(location.pathname);

  // Restore scroll on back/forward navigation, scroll to top on new pushes.
  // Pages below fetch data async (e.g. university lists) and swap a short
  // skeleton for tall real content, images load late, etc. — `main` itself
  // never resizes (it's a fixed flex-1 box), but its rendered child does, so
  // watch that child's box and reapply the target scrollTop on every change
  // until it settles, instead of guessing with a fixed timer.
  useLayoutEffect(() => {
    const el = mainRef.current;
    if (!el) return;

    if (navigationType !== 'POP') {
      el.scrollTop = 0;
      return;
    }

    const target = scrollPositions.get(location.key) ?? 0;
    el.scrollTop = target;
    if (target === 0) return;

    const content = el.firstElementChild;
    if (!content) return;

    let settleTimer: ReturnType<typeof setTimeout>;
    const stop = () => observer.disconnect();
    const observer = new ResizeObserver(() => {
      el.scrollTop = target;
      clearTimeout(settleTimer);
      settleTimer = setTimeout(stop, 400);
    });
    observer.observe(content);
    const hardStop = setTimeout(stop, 4000);

    return () => {
      observer.disconnect();
      clearTimeout(settleTimer);
      clearTimeout(hardStop);
    };
  }, [location.key, navigationType]);

  useEffect(() => {
    const el = mainRef.current;
    if (!el) return;
    const handleScroll = () => {
      // On unmount, React tears down the outgoing page's content before
      // this listener is removed — the container collapses to empty and
      // the browser fires one last native scroll event with scrollTop
      // reset to 0. scrollHeight <= clientHeight (nothing left to scroll)
      // is the signal that a scroll event is this teardown artifact, not
      // a real user scroll, so it must not clobber the saved position.
      if (el.scrollHeight <= el.clientHeight) return;
      scrollPositions.set(location.key, el.scrollTop);
    };
    el.addEventListener('scroll', handleScroll, { passive: true });
    return () => el.removeEventListener('scroll', handleScroll);
  }, [location.key]);

  return (
    <div className="journey-page h-screen text-primary flex flex-col overflow-hidden">
      <TopRail />
      <main ref={mainRef} className="relative z-[1] flex-1 min-w-0 overflow-y-auto px-4 sm:px-6 lg:px-8 py-[var(--main-pad-y)]">
        {syncDone ? (
          // key=pageEnterKey: анимация только при смене вкладки шапки.
          // Внутри /admin/* ключ стабилен — сайдбар без fade, контент сразу.
          <div key={enterKey} className="page-enter">
            <Outlet />
          </div>
        ) : (
          <div className="flex items-center justify-center h-full min-h-[60vh]">
            <Spinner size="lg" />
          </div>
        )}
      </main>
    </div>
  );
}
