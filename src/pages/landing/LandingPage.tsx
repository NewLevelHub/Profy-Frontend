import { useMemo } from 'react';
import { LandingHeader } from './components/LandingHeader';
import { HeroSection } from './components/HeroSection';
import { StatsSection } from './components/StatsSection';
import { HowSection } from './components/HowSection';
import { DemoSection } from './components/DemoSection';
import { FeaturesSection } from './components/FeaturesSection';
import { InsideSection } from './components/InsideSection';
import { TrySection } from './components/TrySection';
import { ReportSection } from './components/ReportSection';
import { FaqSection } from './components/FaqSection';
import { FinalCtaSection } from './components/FinalCtaSection';
import { LandingFooter } from './components/LandingFooter';
import { useCursorTrail } from './hooks';
import './landing.css';

/**
 * Посадочная страница — маршрут «/» для незалогиненных.
 *
 * Раньше жила отдельным index.html в public/ со своей копией палитры, своими
 * кнопками и своим слоем перевода. Теперь это обычная страница приложения:
 * цвета берутся из токенов theme.css, кнопки — из общего рецепта Button,
 * маскоты — из того же компонента Mascot, что и во всём продукте. Правка в
 * дизайн-системе доезжает сюда сама.
 */
export default function LandingPage() {
  // Cursor trail only on fine pointers and md+ — skip touch / narrow viewports.
  const trailOn = useMemo(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
    return window.matchMedia('(pointer:fine) and (min-width: 768px)').matches;
  }, []);
  useCursorTrail(trailOn);

  return (
    <div className="landing bg-page">
      <LandingHeader />
      <main>
        <HeroSection />
        <StatsSection />
        <HowSection />
        <DemoSection />
        <FeaturesSection />
        <InsideSection />
        <TrySection />
        <ReportSection />
        <FaqSection />
        <FinalCtaSection />
      </main>
      <LandingFooter />
    </div>
  );
}
