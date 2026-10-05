import { useEffect, useRef, useState } from 'react';
import { ArrowRight, ArrowUpRight, BookOpen, Check, ChevronDown, Compass, GraduationCap, Leaf, Menu, ShieldCheck, Sparkles, X } from 'lucide-react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Brand } from '@/shared/ui/redesign/Brand';
import { LanguageSwitcher } from '@/shared/ui/LanguageSwitcher';
import { ThemeToggle } from '@/shared/ui/ThemeToggle';
import '@/shared/ui/redesign/redesign.css';
import './redesign.css';

const NAV = ['how', 'outcome', 'parents'] as const;
const STEPS = ['discover', 'understand', 'explore'] as const;
const INTERESTS = ['creative', 'research', 'social'] as const;

function ReportExample({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation('landing');
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    const overflow = document.body.style.overflow;
    dialog.showModal();
    document.body.style.overflow = 'hidden';
    return () => { dialog.close(); document.body.style.overflow = overflow; };
  }, []);
  return (
    <dialog ref={ref} className="rd-report-dialog" aria-labelledby="report-example-title" onClose={e => { if (!e.currentTarget.open) onClose(); }} onClick={e => { if (e.target === e.currentTarget) ref.current?.close(); }}>
      <div className="rd-report-dialog-body">
        <button type="button" className="rd-icon-button rd-dialog-close" aria-label={t('redesign.close')} onClick={() => ref.current?.close()} autoFocus><X aria-hidden="true" /></button>
        <p className="rd-eyebrow">{t('redesign.example.eyebrow')}</p>
        <h2 id="report-example-title">{t('redesign.example.title')}</h2>
        <p className="rd-example-note">{t('redesign.example.note')}</p>
        <div className="rd-example-summary"><div><Sparkles aria-hidden="true" /><h3>{t('redesign.example.strengthTitle')}</h3><p>{t('redesign.example.strengthBody')}</p></div><img src="/mascot/redesign/celebrate.jpg" alt="" width="600" height="700" /></div>
        <div className="rd-example-sections">
          {['interests', 'directions', 'step'].map(key => <section key={key}><span className="rd-eyebrow">{t(`redesign.example.${key}Label`)}</span><h3>{t(`redesign.example.${key}Title`)}</h3><p>{t(`redesign.example.${key}Body`)}</p></section>)}
        </div>
        <Link to="/register" className="rd-button">{t('redesign.cta.start')}<ArrowRight size={19} aria-hidden="true" /></Link>
      </div>
    </dialog>
  );
}

function HeroArt() {
  const { t } = useTranslation('landing');
  return (
    <div className="rd-hero-art">
      <div className="rd-art-orbit rd-orbit-one" aria-hidden="true" /><div className="rd-art-orbit rd-orbit-two" aria-hidden="true" />
      <div className="rd-art-sun" aria-hidden="true" />
      <span className="rd-art-star rd-star-one" aria-hidden="true">✦</span><span className="rd-art-star rd-star-two" aria-hidden="true">✦</span>
      <div className="rd-mascot-scene"><img src="/mascot/redesign/greeting.jpg" alt={t('redesign.mascotAlt')} width="800" height="900" fetchPriority="high" /></div>
      <div className="rd-floating-card rd-card-interest"><span className="rd-icon-tile rd-lilac"><Sparkles aria-hidden="true" /></span><div><small>{t('redesign.hero.interestLabel')}</small><strong>{t('redesign.hero.interestTitle')}</strong><div className="rd-mini-bars" aria-hidden="true">{[1,2,3,4,5,6,7].map(i => <i key={i} />)}</div></div></div>
      <div className="rd-floating-card rd-card-path"><span className="rd-icon-tile rd-peach"><Compass aria-hidden="true" /></span><div><small>{t('redesign.hero.pathLabel')}</small><strong>{t('redesign.hero.pathTitle')}</strong><div className="rd-path-dots" aria-hidden="true"><b /><i /><b /><i /><b /></div></div></div>
      <p className="rd-art-note">{t('redesign.hero.note')}</p>
    </div>
  );
}

function JourneyArt({ step }: { step: typeof STEPS[number] }) {
  const { t } = useTranslation('landing');
  if (step === 'discover') return <div className="rd-journey-art rd-interest-art" aria-hidden="true"><span>{t('redesign.how.chipOne')}</span><span>{t('redesign.how.chipTwo')}<Check size={16} /></span><span>{t('redesign.how.chipThree')}</span></div>;
  if (step === 'understand') return <div className="rd-journey-art rd-portrait-art" aria-hidden="true"><span className="rd-portrait-orbit" /><Sparkles /><span>{t('redesign.how.curious')}</span><span>{t('redesign.how.creative')}</span></div>;
  return <div className="rd-journey-art rd-route-art" aria-hidden="true"><span><Compass size={17} />{t('redesign.how.direction')}</span><i /><span><GraduationCap size={18} />{t('redesign.how.opportunities')}</span></div>;
}

export default function LandingPage() {
  const { t } = useTranslation('landing');
  const [menuOpen, setMenuOpen] = useState(false);
  const [exampleOpen, setExampleOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const showExample = () => setExampleOpen(true);
  return (
    <div className="redesign rd-landing">
      <a className="rd-skip" href="#landing-content">{t('redesign.skip')}</a>
      <header className="rd-site-header rd-wrap">
        <Brand />
        <nav className="rd-desktop-nav" aria-label={t('redesign.navigation')}>{NAV.map(id => <a key={id} href={`#${id}`}>{t(`redesign.nav.${id}`)}</a>)}</nav>
        <div className="rd-header-actions"><LanguageSwitcher /><ThemeToggle className="rd-desktop-theme" /><Link to="/login" className="rd-button rd-button-outline rd-button-small">{t('cta.login')}<ArrowUpRight size={16} aria-hidden="true" /></Link><button ref={menuButton} type="button" className="rd-icon-button rd-menu-toggle" aria-expanded={menuOpen} aria-controls="landing-mobile-nav" aria-label={t(menuOpen ? 'cta.closeMenu' : 'cta.openMenu')} onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}</button></div>
        {menuOpen && <nav id="landing-mobile-nav" className="rd-mobile-nav" aria-label={t('redesign.navigation')} onKeyDown={e => { if (e.key === 'Escape') { setMenuOpen(false); menuButton.current?.focus(); } }}>{NAV.map(id => <a key={id} href={`#${id}`} onClick={() => setMenuOpen(false)}>{t(`redesign.nav.${id}`)}<ArrowUpRight size={17} aria-hidden="true" /></a>)}<div className="rd-mobile-preferences"><span>{t('cta.theme')}</span><ThemeToggle /></div></nav>}
      </header>
      <main id="landing-content" tabIndex={-1}>
        <section className="rd-hero rd-wrap">
          <div className="rd-hero-copy">
            <p className="rd-eyebrow"><span className="rd-green-dot" aria-hidden="true" />{t('redesign.hero.eyebrow')}</p>
            <h1>{t('redesign.hero.lineOne')}<br />{t('redesign.hero.lineTwo')}<br /><span>{t('redesign.hero.accent')}</span><span className="rd-heading-star" aria-hidden="true">✦</span></h1>
            <p className="rd-hero-description">{t('redesign.hero.description')}</p>
            <div className="rd-hero-cta"><Link to="/register" className="rd-button rd-button-large">{t('redesign.cta.start')}<ArrowRight aria-hidden="true" /></Link><button type="button" className="rd-text-link" onClick={showExample}>{t('redesign.cta.example')}<ArrowUpRight size={17} aria-hidden="true" /></button></div>
            <div className="rd-hero-reassurance"><span><Leaf size={16} aria-hidden="true" />{t('redesign.hero.pace')}</span><span><ShieldCheck size={16} aria-hidden="true" />{t('redesign.hero.review')}</span></div>
          </div>
          <HeroArt />
        </section>
        <section className="rd-value-strip rd-wrap" aria-label={t('redesign.value.label')}>
          {STEPS.map((step, i) => <div key={step}><span className="rd-strip-number">0{i+1}</span><p>{t(`redesign.value.${step}.label`)}<strong>{t(`redesign.value.${step}.text`)}</strong></p></div>)}<span className="rd-strip-flower" aria-hidden="true">✳</span>
        </section>
        <section className="rd-home-section rd-wrap" id="how">
          <div className="rd-section-heading"><div><p className="rd-eyebrow">{t('redesign.how.eyebrow')}</p><h2>{t('redesign.how.title')}</h2></div><p>{t('redesign.how.description')}</p></div>
          <div className="rd-journey-grid">{STEPS.map((step, i) => <article className="rd-journey-card" key={step}><span className="rd-step-chip">{t('redesign.how.step', { number: `0${i+1}` })}</span><JourneyArt step={step} /><h3>{t(`redesign.how.${step}.title`)}</h3><p>{t(`redesign.how.${step}.text`)}</p></article>)}</div>
        </section>
        <section className="rd-report-teaser rd-wrap" id="outcome">
          <div className="rd-teaser-copy"><p className="rd-eyebrow">{t('redesign.report.eyebrow')}</p><h2>{t('redesign.report.title')}</h2><p>{t('redesign.report.description')}</p><button type="button" className="rd-button" onClick={showExample}>{t('redesign.cta.openExample')}<ArrowRight size={20} aria-hidden="true" /></button></div>
          <div className="rd-teaser-preview"><div className="rd-teaser-window"><i /><i /><i /><span>{t('redesign.report.previewLabel')}</span></div><div className="rd-teaser-body"><span className="rd-pill rd-lilac"><Sparkles size={13} aria-hidden="true" />{t('redesign.report.personal')}</span><h3>{t('redesign.report.previewTitle')}</h3><div className="rd-teaser-bars">{INTERESTS.map((key, i) => <div key={key}><span>{t(`redesign.report.${key}`)}</span><div><i className={`rd-bar-${i}`} /></div></div>)}</div><div className="rd-teaser-tags"><span>{t('redesign.report.tagOne')}</span><span>{t('redesign.report.tagTwo')}</span></div><p className="rd-teaser-caption">{t('redesign.report.sample')}</p></div></div>
        </section>
        <section className="rd-parents rd-wrap" id="parents"><div className="rd-parent-art"><img src="/mascot/redesign/book.jpg" alt="" width="800" height="900" loading="lazy" /></div><div><p className="rd-eyebrow">{t('redesign.parents.eyebrow')}</p><h2>{t('redesign.parents.title')}</h2><p>{t('redesign.parents.description')}</p><span className="rd-parent-trust"><ShieldCheck size={21} aria-hidden="true" />{t('redesign.parents.review')}</span></div></section>
        <section className="rd-faq rd-wrap" id="faq"><div><p className="rd-eyebrow">{t('redesign.faq.eyebrow')}</p><h2>{t('redesign.faq.title')}</h2><BookOpen className="rd-faq-icon" size={38} aria-hidden="true" /></div><div>{[1,2,3,4].map(i => <details key={i}><summary>{t(`redesign.faq.q${i}`)}<ChevronDown size={18} aria-hidden="true" /></summary><p>{t(`redesign.faq.a${i}`)}</p></details>)}</div></section>
        <section className="rd-final-cta rd-wrap"><span className="rd-final-star" aria-hidden="true">✦</span><div><p className="rd-eyebrow">{t('redesign.final.eyebrow')}</p><h2>{t('redesign.final.title')}</h2><p>{t('redesign.final.description')}</p></div><Link to="/register" className="rd-button rd-button-light rd-button-large">{t('redesign.final.cta')}<ArrowRight aria-hidden="true" /></Link></section>
      </main>
      <footer className="rd-footer rd-wrap"><Brand /><p>{t('redesign.footer.path')}</p><span>{t('redesign.footer.care')}</span></footer>
      {exampleOpen && <ReportExample onClose={() => setExampleOpen(false)} />}
    </div>
  );
}
