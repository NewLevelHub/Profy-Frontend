import { memo } from 'react';
import { useNavigate } from 'react-router';
import { GraduationCap, Sparkles } from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { Skeleton } from '@/shared/ui/Skeleton';
import { PageContainer } from '@/shared/ui/PageContainer';
import { PageHeader } from '@/shared/ui/PageHeader';
import { SectionHeading } from '@/shared/ui/SectionHeading';
import { RIASEC_LABELS, RIASEC_ICONS, MI_LABELS, MI_ICONS, THINKING_STYLE_LABELS, THINKING_STYLE_ICONS, PERSONALITY_LABELS, PERSONALITY_ICONS } from '@/shared/config/constants';
import { describeCareerFit } from '@/shared/lib/riasecMatch';
import type { CareerMatch } from '@/shared/types';
import { useResults } from './hooks/useResults';

// ── Label maps ───────────────────────────────────────────────────────────────

// Направления генерируются из плоского каталога профессий, фиксированного enum
// названий нет — подбираем эмодзи по ключевым словам. Порядок важен: более
// специфичное выше общего.
const CAREER_ICON_PAIRS: [string, string][] = [
  ['engineer', '⚙️'], ['architect', '🏛️'], ['develop', '💻'], ['program', '💻'],
  ['analyst', '📊'], ['data', '📊'], ['statistic', '📊'],
  ['doctor', '🩺'], ['nurse', '🩺'], ['medic', '🩺'], ['physician', '🩺'], ['dent', '🩺'], ['pharma', '💊'],
  ['biolog', '🧬'], ['chem', '🧪'], ['physic', '⚛️'], ['math', '📐'],
  ['scien', '🔬'], ['research', '🔬'], ['geolog', '🔬'],
  ['teach', '📚'], ['professor', '📚'], ['faculty', '📚'], ['librarian', '📚'], ['instructor', '📚'],
  ['psycholog', '🧠'], ['counsel', '🧠'], ['therap', '🧠'],
  ['social', '🤝'], ['volunteer', '🤝'], ['communit', '🤝'],
  ['manager', '📈'], ['business', '📈'], ['entrepreneur', '📈'], ['executive', '📈'],
  ['financ', '💰'], ['account', '🧾'], ['bank', '🏦'], ['tax', '🧾'], ['broker', '💰'],
  ['market', '📣'], ['advertis', '📣'], ['sales', '🛒'], ['public relations', '📣'],
  ['law', '⚖️'], ['attorney', '⚖️'], ['paralegal', '⚖️'], ['judge', '⚖️'],
  ['journal', '📰'], ['report', '📰'], ['writer', '✍️'], ['editor', '✍️'], ['author', '✍️'],
  ['artist', '🎨'], ['design', '🎨'], ['illustrat', '🎨'], ['fashion', '👗'],
  ['music', '🎵'], ['danc', '💃'], ['drama', '🎭'], ['actor', '🎭'], ['entertain', '🎭'], ['photograph', '📷'],
  ['pilot', '✈️'], ['air traffic', '✈️'], ['aviation', '✈️'],
  ['farm', '🌾'], ['agri', '🌾'], ['forest', '🌲'], ['garden', '🌿'],
  ['veterinar', '🐾'], ['animal', '🐾'],
  ['polic', '👮'], ['safety', '🦺'], ['inspector', '🦺'], ['warden', '🦺'],
  ['sport', '🏅'], ['athlet', '🏅'], ['coach', '🏅'], ['recreation', '🏅'],
  ['travel', '✈️'], ['tour', '✈️'],
  ['comput', '💻'], ['technolog', '💻'], ['technic', '🔧'],
];

function getIconForCareer(name: string): string {
  const lower = name.toLowerCase();
  for (const [kw, icon] of CAREER_ICON_PAIRS) {
    if (lower.includes(kw)) return icon;
  }
  return '🧭';
}

// ── Sub-components ───────────────────────────────────────────────────────────

function AnimatedBlock({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ animation: 'fadeSlideUp 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) both' }}>
      {children}
    </div>
  );
}

function SectionHeader({ emoji, title }: { emoji: string; title: string }) {
  return <SectionHeading emoji={emoji} title={title} />;
}

interface CareerCardProps {
  career: CareerMatch;
  showUniversityBtn: boolean;
  showInquiryBtn: boolean;
  onDetail: (c: CareerMatch) => void;
  onUniversity: (c: CareerMatch) => void;
  onInquiry: (c: CareerMatch) => void;
}

const CareerCard = memo(function CareerCard({
  career,
  showUniversityBtn,
  showInquiryBtn,
  onDetail,
  onUniversity,
  onInquiry,
}: CareerCardProps) {
  return (
    <Card
      onClick={() => onDetail(career)}
      className="!p-[22px] flex flex-col gap-3 cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-pop"
    >
      <div className="flex items-center justify-between">
        <span className="text-[26px]" aria-hidden="true">{getIconForCareer(career.name)}</span>
        <span
          className="font-extrabold text-brand bg-brand-subtle rounded-pill"
          style={{ fontSize: 11.5, padding: '5px 12px' }}
        >
          Совпадение {career.match_score}/6
        </span>
      </div>
      <div>
        <p className="font-extrabold text-primary mb-[3px]" style={{ fontSize: 16 }}>{career.name}</p>
        {(career.professions ?? []).length > 0 && (
          <p className="text-muted font-medium leading-snug" style={{ fontSize: 13 }}>
            {career.professions.slice(0, 3).join(', ')}
          </p>
        )}
      </div>
      {showUniversityBtn && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onUniversity(career); }}
          className="flex items-center gap-1.5 text-brand font-semibold text-caption hover:opacity-75 transition-opacity"
        >
          <GraduationCap className="w-3.5 h-3.5" />
          Найти университеты
        </button>
      )}
      {showInquiryBtn && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onInquiry(career); }}
          className="mt-1 flex items-center justify-center gap-1.5 rounded-pill border-2 border-default bg-surface text-brand font-extrabold transition-colors hover:bg-brand-subtle"
          style={{ fontSize: 12.5, padding: 12 }}
        >
          <Sparkles className="w-3.5 h-3.5" />
          Подходит ли мне это направление?
        </button>
      )}
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onDetail(career); }}
        className="font-extrabold text-center hover:opacity-75 transition-opacity"
        style={{ fontSize: 12.5, color: 'var(--brand)', padding: 4 }}
      >
        Подробнее о направлении →
      </button>
    </Card>
  );
});

function ResultsSkeleton() {
  return (
    <PageContainer className="flex flex-col gap-6">
      {Array.from({ length: 4 }, (_, i) => (
        <div key={i} className="flex flex-col gap-4">
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-28 w-full" />
        </div>
      ))}
    </PageContainer>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function ResultsPage() {
  const navigate = useNavigate();

  const {
    report,
    isLoading,
    error,
    hasCompletedAssessment,
    showUniversityBtn,
    ageGroup,
    isJunior,
    profileEntries,
    thinkingStyleEntries,
    motivationHighlights,
    personalityEntries,
    personalityNotes,
    refetch,
  } = useResults();

  // Junior (6-9) answers MI categories instead of RIASEC letters — see
  // useResults.ts's isJunior/profileEntries and MI_LABELS/MI_ICONS.
  const profileLabels = isJunior ? MI_LABELS : RIASEC_LABELS;
  const profileIcons = isJunior ? MI_ICONS : RIASEC_ICONS;

  if (!hasCompletedAssessment) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 gap-4 text-center">
        <span className="text-5xl select-none" aria-hidden="true">📋</span>
        <h2 className="text-h1 font-extrabold text-primary">Результатов пока нет</h2>
        <p className="text-body text-secondary max-w-xs">
          Сначала пройди диагностику, чтобы увидеть свои результаты
        </p>
        <Button onClick={() => navigate('/home')}>Перейти на главную</Button>
      </div>
    );
  }

  if (isLoading) return <ResultsSkeleton />;

  if (error || !report) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 gap-4 text-center">
        <span className="text-5xl select-none" aria-hidden="true">⚠️</span>
        <h2 className="text-h1 font-extrabold text-primary">Что-то пошло не так</h2>
        <p className="text-body text-secondary">{error ?? 'Не удалось загрузить результаты.'}</p>
        <Button onClick={() => refetch()}>Повторить</Button>
      </div>
    );
  }

  function handleCareerDetail(career: CareerMatch) {
    navigate(`/results/directions/${encodeURIComponent(career.slug)}`);
  }

  function handleUniversity(career: CareerMatch) {
    navigate(`/results/directions/${encodeURIComponent(career.slug)}/universities`);
  }

  function handleInquiry(career: CareerMatch) {
    navigate(`/results/directions/${encodeURIComponent(career.slug)}/inquiry`);
  }

  const showInquiryBtn = ageGroup === 'middle' || ageGroup === 'senior';
  const topCareer = report.careers?.[0];
  const isFlatProfile = report.meta.differentiation < 20;

  return (
    <PageContainer className="flex flex-col gap-6">

      <PageHeader
        title="Что мы узнали о тебе"
        subtitle={isJunior ? 'Что тебе интересно и что стоит попробовать' : 'Твой RIASEC-профиль и рекомендованное направление'}
      />

      {/* ── Лучшее совпадение ────────────────────────────────────── */}
      {topCareer && (
        <AnimatedBlock>
          <div
            className="relative overflow-hidden rounded-[24px] p-[30px_32px] text-on-brand"
            style={{ background: 'linear-gradient(135deg,#7C3AED,#6D28D9)', boxShadow: '0 14px 32px rgba(124,58,237,.26)' }}
          >
            <div className="absolute bottom-[-60px] right-[-30px] w-[220px] h-[220px] rounded-full pointer-events-none" style={{ background: 'rgba(255,255,255,0.08)' }} />
            <div className="relative">
              <div className="font-extrabold tracking-[.06em] uppercase mb-2 opacity-85" style={{ fontSize: 13 }}>
                🎯 Твой код — {report.code.join('')}
              </div>
              <h2 className="font-black mb-2 tracking-[-0.01em] text-[32px] leading-tight">{topCareer.name}</h2>
              <p className="font-semibold opacity-90 mb-5 leading-relaxed text-base max-w-2xl">
                {describeCareerFit(report.code, topCareer)}
              </p>
              <div className="flex gap-3 flex-wrap">
                <button
                  type="button"
                  onClick={() => handleCareerDetail(topCareer)}
                  className="h-[50px] px-7 rounded-pill font-extrabold transition-transform hover:scale-[1.03] active:scale-[0.98]"
                  style={{ background: '#fff', color: '#5B21B6', fontSize: 15, border: 'none' }}
                >
                  Подробнее →
                </button>
                {showUniversityBtn && (
                  <button
                    type="button"
                    onClick={() => handleUniversity(topCareer)}
                    className="h-[50px] px-[26px] rounded-pill font-extrabold transition-colors"
                    style={{ border: '1.5px solid rgba(255,255,255,.55)', background: 'rgba(255,255,255,.12)', color: '#fff', fontSize: 15 }}
                  >
                    🎓 Посмотреть университеты
                  </button>
                )}
              </div>
            </div>
          </div>
        </AnimatedBlock>
      )}

      {/* ── Резюме ───────────────────────────────────────────────── */}
      {report.summary && (
        <AnimatedBlock>
          <section aria-label="Резюме">
            <SectionHeader emoji="📋" title="Резюме" />
            <Card className="bg-brand-subtle">
              <p className="text-body text-primary leading-relaxed">{report.summary}</p>
              {isFlatProfile && (
                <p className="text-caption text-secondary mt-3">
                  Твои результаты по разным типам близки друг к другу — это нормально,
                  если ты ещё не определился с направлением. Такой результат стоит
                  воспринимать как отправную точку, а не окончательный вывод.
                </p>
              )}
            </Card>
          </section>
        </AnimatedBlock>
      )}

      {/* ── Сильные стороны ──────────────────────────────────────── */}
      {(report.strengths.length > 0 || report.personality_highlights.length > 0) && (
        <AnimatedBlock>
          <section aria-label="Сильные стороны">
            <SectionHeader emoji="💪" title="Сильные стороны" />
            <div className="flex flex-wrap gap-2.5">
              {report.strengths.map((key) => (
                <div
                  key={key}
                  className="flex items-center gap-2.5 bg-surface rounded-pill pl-2 pr-4 py-1.5 shadow-card"
                >
                  <span
                    className="w-8 h-8 rounded-full flex items-center justify-center text-lg select-none flex-shrink-0 bg-brand-subtle"
                    aria-hidden="true"
                  >
                    {profileIcons[key]}
                  </span>
                  <p className="text-caption font-semibold text-primary">{profileLabels[key]}</p>
                </div>
              ))}
              {report.personality_highlights.map((phrase, i) => (
                <div
                  key={`ph-${i}`}
                  className="flex items-center gap-2.5 bg-surface rounded-pill pl-2 pr-4 py-1.5 shadow-card"
                >
                  <span
                    className="w-8 h-8 rounded-full flex items-center justify-center text-lg select-none flex-shrink-0 bg-brand-subtle"
                    aria-hidden="true"
                  >
                    🧠
                  </span>
                  <p className="text-caption font-semibold text-primary">{phrase}</p>
                </div>
              ))}
            </div>
          </section>
        </AnimatedBlock>
      )}

      {/* ── Подходящие профессии ─────────────────────────────────── */}
      {(report.careers ?? []).length > 0 && (
        <AnimatedBlock>
          <section aria-label="Подходящие направления">
            <SectionHeader emoji="👥" title="Подходящие профессии" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[18px]">
              {report.careers.map(career => (
                <CareerCard
                  key={career.slug}
                  career={career}
                  showUniversityBtn={showUniversityBtn}
                  showInquiryBtn={showInquiryBtn}
                  onDetail={handleCareerDetail}
                  onUniversity={handleUniversity}
                  onInquiry={handleInquiry}
                />
              ))}
            </div>
          </section>
        </AnimatedBlock>
      )}

      {/* ── Профиль RIASEC + план развития ─────────────────────────── */}
      <AnimatedBlock>
        <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-5">
          <section aria-label={isJunior ? 'Твой профиль интересов' : 'Твой профиль RIASEC'} className="min-w-0">
            <SectionHeader emoji="📊" title={isJunior ? 'Твой профиль интересов' : 'Твой профиль RIASEC'} />
            <Card className="flex flex-col gap-4">
              {profileEntries.map(([key, score]) => (
                <div key={key}>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="font-extrabold text-primary" style={{ fontSize: 15 }}>
                      {profileIcons[key]} {profileLabels[key]}
                    </span>
                    <span className="font-extrabold text-brand" style={{ fontSize: 14 }}>{Math.round(score)}%</span>
                  </div>
                  <div
                    role="progressbar"
                    aria-valuenow={Math.round(score)}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={profileLabels[key]}
                    className="h-3 w-full rounded-full bg-brand-subtle overflow-hidden"
                  >
                    <div
                      className="h-full rounded-full transition-[width] duration-300 ease-out"
                      style={{ width: `${Math.round(score)}%`, background: 'linear-gradient(90deg,#A78BFA,#7C3AED)' }}
                    />
                  </div>
                </div>
              ))}
            </Card>
          </section>

          <div className="flex flex-col gap-6 min-w-0">
            {report.development_plan.reinforce.length > 0 && (
              <section aria-label="Что усилить">
                <SectionHeader emoji="🚀" title="Что усилить" />
                <Card className="flex flex-col gap-2">
                  {report.development_plan.reinforce.map((item, i) => (
                    <p key={i} className="text-body font-semibold text-primary">• {item}</p>
                  ))}
                </Card>
              </section>
            )}

            {report.development_plan.compensate.length > 0 && (
              <section aria-label="Что подтянуть">
                <SectionHeader emoji="🌱" title="Что можно подтянуть" />
                <Card className="flex flex-col gap-2">
                  {report.development_plan.compensate.map((item, i) => (
                    <p key={i} className="text-body font-semibold text-primary">• {item}</p>
                  ))}
                </Card>
              </section>
            )}
          </div>
        </div>
      </AnimatedBlock>

      {/* ── Стиль мышления ───────────────────────────────────────── */}
      {thinkingStyleEntries.length > 0 && (
        <AnimatedBlock>
          <section aria-label="Стиль мышления">
            <SectionHeader emoji="🧭" title="Стиль мышления" />
            <Card className="flex flex-col gap-4">
              {thinkingStyleEntries.map(([key, score]) => (
                <div key={key}>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="font-extrabold text-primary" style={{ fontSize: 15 }}>
                      {THINKING_STYLE_ICONS[key]} {THINKING_STYLE_LABELS[key]}
                    </span>
                    <span className="font-extrabold text-brand" style={{ fontSize: 14 }}>{Math.round(score)}%</span>
                  </div>
                  <div
                    role="progressbar"
                    aria-valuenow={Math.round(score)}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={THINKING_STYLE_LABELS[key]}
                    className="h-3 w-full rounded-full bg-brand-subtle overflow-hidden"
                  >
                    <div
                      className="h-full rounded-full transition-[width] duration-300 ease-out"
                      style={{ width: `${Math.round(score)}%`, background: 'linear-gradient(90deg,#A78BFA,#7C3AED)' }}
                    />
                  </div>
                </div>
              ))}
            </Card>
          </section>
        </AnimatedBlock>
      )}

      {/* ── Твой характер ────────────────────────────────────────── */}
      {personalityEntries.length > 0 && (
        <AnimatedBlock>
          <section aria-label="Твой характер">
            <SectionHeader emoji="🧬" title="Твой характер" />
            <Card className="flex flex-col gap-5">
              {personalityEntries.map(([trait, score]) => (
                <div key={trait}>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="font-extrabold text-primary" style={{ fontSize: 15 }}>
                      {PERSONALITY_ICONS[trait]} {PERSONALITY_LABELS[trait]}
                    </span>
                    <span className="font-extrabold text-brand" style={{ fontSize: 14 }}>{Math.round(score)}%</span>
                  </div>
                  <div
                    role="progressbar"
                    aria-valuenow={Math.round(score)}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={PERSONALITY_LABELS[trait]}
                    className="h-3 w-full rounded-full bg-brand-subtle overflow-hidden"
                  >
                    <div
                      className="h-full rounded-full transition-[width] duration-300 ease-out"
                      style={{ width: `${Math.round(score)}%`, background: 'linear-gradient(90deg,#A78BFA,#7C3AED)' }}
                    />
                  </div>
                  {personalityNotes[trait] && (
                    <p className="text-caption text-secondary mt-1.5 leading-snug">{personalityNotes[trait]}</p>
                  )}
                </div>
              ))}
            </Card>
          </section>
        </AnimatedBlock>
      )}

      {/* ── Что тебя драйвит ─────────────────────────────────────── */}
      {motivationHighlights.length > 0 && (
        <AnimatedBlock>
          <section aria-label="Что тебя драйвит">
            <SectionHeader emoji="🔥" title="Что тебя драйвит" />
            <div className="flex flex-col gap-2.5">
              {motivationHighlights.map((phrase, i) => (
                <Card key={i} className="flex flex-row items-center gap-2.5">
                  <span className="text-lg select-none flex-shrink-0" aria-hidden="true">🔥</span>
                  <p className="text-body font-semibold text-primary">{phrase}</p>
                </Card>
              ))}
            </div>
          </section>
        </AnimatedBlock>
      )}

    </PageContainer>
  );
}
