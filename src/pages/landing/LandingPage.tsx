import { LandingHeader } from './components/LandingHeader';
import { HeroSection } from './components/HeroSection';
import { StatsSection } from './components/StatsSection';
import { HowSection } from './components/HowSection';
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
  useCursorTrail();

  // Заголовок вкладки, описание и OG-теги задаются в index.html, а не отсюда:
  // поисковые роботы и парсеры ссылок читают отданный сервером HTML и React не
  // выполняют, поэтому проставленное из useEffect до них просто не доехало бы.

  return (
    <div className="landing bg-page">
      <LandingHeader />
      <main>
        <HeroSection />
        <StatsSection />
        <HowSection />
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
