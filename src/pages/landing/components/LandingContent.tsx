import { useState } from 'react';
import { ArrowRight, Award, BookOpen, Brain, Building2, ClipboardList, Compass, Flame, GraduationCap, Layers, Map, MessageCircle, Route, ShieldCheck, Target, Timer, UserRound, Users } from 'lucide-react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { formatNumber } from '@/shared/i18n/format';
import { ASSESSMENT_PHASE_MINUTES } from '@/shared/config/constants';
import { CATALOG_MILESTONES } from '@/shared/config/catalogMilestones';
import { LikertScale } from '@/shared/ui/LikertScale';

export const LANDING_DURATION = Object.values(ASSESSMENT_PHASE_MINUTES).reduce((sum, minutes) => sum + minutes, 0);
const SCALE = [1, 2, 3, 4, 5].map(value => ({ value, label: `landing:try.dot${value}` }));
const TESTS = [
  { key: 'interests', icon: Compass, tone: 'sage' },
  { key: 'motivation', icon: Flame, tone: 'peach' },
  { key: 'team', icon: Users, tone: 'lilac' },
  { key: 'abilities', icon: Brain, tone: 'sage' },
] as const;
const FEATURE_ICONS = [Layers, Timer, MessageCircle, ClipboardList, Target, Building2];
// Те же иконки, что у разделов в самом отчёте.
const REPORT_ICONS = [UserRound, Compass, Award, Flame, Layers, GraduationCap];

export function LandingSectionHeading({ section }: { section: 'how' | 'features' | 'inside' | 'try' | 'report' }) {
  const { t } = useTranslation('landing');
  return <div className="rd-section-heading rd-information-heading" data-landing-reveal>
    <div><p className="rd-eyebrow">{t(`${section}.eyebrow`)}</p>
      <h2>{t(`${section}.titlePre`)}<span>{t(`${section}.titleAccent`)}</span></h2></div>
    <p>{t(`${section}.sub`)}</p>
  </div>;
}

export function LandingStats() {
  const { t } = useTranslation('landing');
  const stats = [
    { key: 'uni', icon: Building2, value: `${formatNumber(CATALOG_MILESTONES.universities)}+` },
    { key: 'programs', icon: BookOpen, value: `${formatNumber(CATALOG_MILESTONES.programs)}+` },
    { key: 'professions', icon: Target, value: `${formatNumber(CATALOG_MILESTONES.careers)}+` },
    { key: 'testsLabel', icon: Layers, value: t('stats.testsValue', { count: Object.keys(ASSESSMENT_PHASE_MINUTES).length }) },
  ];
  return <section className="rd-home-stats rd-wrap" id="stats" aria-label={t('redesign.catalogFacts')}>
    {stats.map(({ key, icon: Icon, value }, index) => <div key={key} data-landing-reveal data-reveal-order={index}>
      <Icon size={22} aria-hidden="true" /><strong>{value}</strong><p>{t(`stats.${key}`)}</p>
    </div>)}
  </section>;
}

export function LandingFeatures() {
  const { t } = useTranslation('landing');
  return <section className="rd-home-section rd-wrap" id="features">
    <LandingSectionHeading section="features" />
    <div className="rd-feature-grid">{FEATURE_ICONS.map((Icon, index) => <article key={index} className="rd-feature-card" data-landing-reveal data-reveal-order={index % 3}>
      <span className={`rd-icon-tile ${index % 3 === 1 ? 'rd-peach' : index % 3 === 2 ? 'rd-lilac' : 'rd-sage'}`}><Icon aria-hidden="true" /></span>
      <h3>{t(`features.f${index + 1}Title`)}</h3><p>{t(`features.f${index + 1}Desc`)}</p>
    </article>)}</div>
  </section>;
}

export function LandingInside() {
  const { t } = useTranslation('landing');
  return <section className="rd-home-section rd-wrap" id="inside">
    <LandingSectionHeading section="inside" />
    <div className="rd-test-grid">{TESTS.map(({ key, icon: Icon, tone }, index) => <article key={key} className={`rd-test-card rd-test-${tone}`} data-landing-reveal data-reveal-order={index}>
      <div className="rd-test-card-top"><Icon size={26} aria-hidden="true" /><span>0{index + 1}</span></div>
      <h3>{t(`inside.${key}Name`)}</h3><p>{t(`inside.${key}Desc`)}</p>
      <ul>{[1, 2, 3, 4, 5, 6].map(n => <li key={n}>{t(`inside.${key}Chip${n}`)}</li>)}</ul>
    </article>)}</div>
  </section>;
}

export function LandingTry() {
  const { t } = useTranslation('landing');
  const [selected, setSelected] = useState<number | null>(null);
  return <section className="rd-home-section rd-wrap" id="try">
    <LandingSectionHeading section="try" />
    <div className="rd-try-card" data-landing-reveal>
      <div className="rd-try-caption"><span className="rd-pill rd-sage">{t('try.exampleBadge')}</span><span>{t('redesign.tryNote')}</span></div>
      <h3>{t('try.statement')}</h3>
      <LikertScale selected={selected} onSelect={setSelected} scale={SCALE} poleLeft={t('try.dot1')} poleRight={t('try.dot5')} ariaLabel={t('try.scaleAria')} />
      {selected !== null && <div className="rd-try-result" aria-live="polite">
        <span className="rd-icon-tile rd-lilac"><Compass aria-hidden="true" /></span>
        <div><p className="rd-eyebrow">{t('try.resultKicker')}</p><h4>{t('try.resultDirection')}</h4><p>{t('try.resultDesc')}</p></div>
        <Link to="/register" className="rd-button rd-button-small">{t('cta.takeDiagnostic')}<ArrowRight size={18} aria-hidden="true" /></Link>
      </div>}
    </div>
  </section>;
}

export function LandingReportContents() {
  const { t } = useTranslation('landing');
  return <section className="rd-home-section rd-wrap" id="outcome">
    <LandingSectionHeading section="report" />
    <div className="rd-report-contents">
      <div className="rd-report-promises" data-landing-reveal>
        {[MessageCircle, ShieldCheck].map((Icon, index) => <div key={index}><Icon size={23} aria-hidden="true" /><h3>{t(`report.fact${index + 1}Title`)}</h3><p>{t(`report.fact${index + 1}Desc`)}</p></div>)}
        <img src="/mascot/redesign/notepad.png" alt="" width={1254} height={1254} loading="lazy" />
      </div>
      <div className="rd-report-content-grid">{REPORT_ICONS.map((Icon, index) => <article key={index} data-landing-reveal data-reveal-order={index % 2}>
        <div><span>0{index + 1}</span><Icon size={20} aria-hidden="true" /></div>
        <h3>{t(`report.block${index + 1}Title`)}</h3><p>{t(`report.block${index + 1}Desc`)}</p>
      </article>)}</div>
    </div>
  </section>;
}

export function LandingDemo({ onOpenExample }: { onOpenExample: () => void }) {
  const { t } = useTranslation('landing');
  const [frame, setFrame] = useState<'results' | 'universities' | 'plan'>('results');
  const frames = ['results', 'universities', 'plan'] as const;
  return <section className="rd-report-teaser rd-wrap" id="demo" data-landing-reveal>
    <div className="rd-teaser-copy"><p className="rd-eyebrow">{t('demo.eyebrow')}</p><h2>{t('demo.titlePre')}<br />{t('demo.titleAccent')}</h2><p>{t('demo.sub')}</p>
      <div className="rd-demo-tabs" aria-label={t('demo.dotsAria')}>{frames.map(id => <button type="button" key={id} aria-pressed={frame === id} onClick={() => setFrame(id)}>{t(`demo.frame.${id}.kicker`)}</button>)}</div>
      <button type="button" className="rd-button" onClick={onOpenExample}>{t('redesign.cta.openExample')}<ArrowRight size={20} aria-hidden="true" /></button>
    </div>
    <div className="rd-teaser-preview"><div className="rd-teaser-window" aria-hidden="true"><i /><i /><i /><span>profile.</span></div>
      <div className="rd-teaser-body rd-demo-body" aria-live="polite">
        <div className="rd-demo-title"><div><span className="rd-eyebrow">{t(`demo.frame.${frame}.kicker`)}</span><h3>{t(`demo.frame.${frame}.title`)}</h3></div><img src={`/mascot/redesign/${frame === 'results' ? 'celebrate' : frame === 'universities' ? 'graduate' : 'notepad'}.png`} alt="" width={1254} height={1254} loading="lazy" /></div>
        {frame === 'results' ? <div className="rd-teaser-bars">{['creative', 'research', 'social'].map((key, i) => <div key={key}><span>{t(`redesign.report.${key}`)}</span><div><i className={`rd-bar-${i}`} /></div></div>)}</div>
          : <div className="rd-demo-rows">{[1, 2, 3].map(n => <div key={n}>{frame === 'universities' ? <GraduationCap size={19} aria-hidden="true" /> : n === 1 ? <Compass size={19} aria-hidden="true" /> : n === 2 ? <Map size={19} aria-hidden="true" /> : <Route size={19} aria-hidden="true" />}<span>{t(`redesign.demo.${frame}${n}`)}</span></div>)}</div>}
        <p className="rd-teaser-caption">{t('redesign.report.sample')}</p>
      </div>
    </div>
  </section>;
}
