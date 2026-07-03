import { memo, useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { GraduationCap } from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { Skeleton } from '@/shared/ui/Skeleton';
import type { DirectionResult } from '@/shared/types';
import { useResults } from './hooks/useResults';

// ── Label maps ───────────────────────────────────────────────────────────────

const INTEREST_LABELS: Record<string, string> = {
  technology: 'Технологии',
  investigative: 'Исследование',
  artistic: 'Творчество',
  creative_think: 'Креативность',
  social: 'Общение',
  social_think: 'Понимание людей',
  science: 'Наука',
  nature: 'Природа',
  realistic: 'Практика',
  media: 'Медиа',
  conventional: 'Системность',
  numbers: 'Числа и данные',
};

const THINKING_LABELS: Record<string, string> = {
  logical: 'Логика',
  mathematical: 'Математика',
  verbal: 'Коммуникация',
  spatial: 'Пространство',
  systematic: 'Системность',
  creative_think: 'Творчество',
};

const THINKING_EMOJIS: Record<string, string> = {
  logical: '🧠',
  mathematical: '📐',
  verbal: '💬',
  spatial: '🗺️',
  systematic: '⚙️',
  creative_think: '💡',
};

const STRENGTH_ICON_PAIRS: [string, string][] = [
  ['технологии', '💻'], ['докапываться', '🔍'], ['нестандартные', '🎨'],
  ['понимает людей', '🤝'], ['структурно', '🧠'], ['числами', '📐'],
  ['словами', '📝'], ['пространство', '🗺️'], ['инициативу', '🏆'],
  ['начатое', '✅'], ['новому', '🌟'], ['помогать', '❤️'],
  ['целиком', '🎯'], ['воплощать', '🔧'], ['научному', '🔬'],
  ['природой', '🌿'], ['данными', '📊'], ['порядок', '📋'], ['системы', '⚙️'],
];

const MOTIVATION_ICON_PAIRS: [string, string][] = [
  ['помогать', '❤️'], ['вести за собой', '🏆'], ['создавать', '🚀'],
  ['высоком уровне', '✅'], ['новому', '🌟'], ['масштабно', '🎯'],
  ['результаты', '🔧'], ['исследовать', '🔍'], ['творческие', '🎨'], ['людей', '🤝'],
];

// ── Step reveal constants ────────────────────────────────────────────────────

const BASE_NEXT_LABELS: string[] = [
  'Посмотреть резюме →',
  'Сильные стороны →',
  'Интересы →',
  'Стиль мышления →',
  'Что мотивирует →',
  'Подходящие профессии →',
];

const WELLBEING_NEXT_LABEL = 'Что учесть →';

// ── Helpers ──────────────────────────────────────────────────────────────────

function getIconForText(text: string, pairs: [string, string][]): string {
  const lower = text.toLowerCase();
  for (const [kw, icon] of pairs) {
    if (lower.includes(kw)) return icon;
  }
  return '⭐';
}

// ── Sub-components ───────────────────────────────────────────────────────────

function AnimatedBlock({
  children,
  blockRef,
}: {
  children: React.ReactNode;
  blockRef?: (el: HTMLDivElement | null) => void;
}) {
  return (
    <div
      ref={blockRef}
      style={{ animation: 'fadeSlideUp 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) both' }}
    >
      {children}
    </div>
  );
}

function SectionHeader({ emoji, title }: { emoji: string; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <span className="text-xl select-none" aria-hidden="true">{emoji}</span>
      <h2 className="text-title font-bold text-primary">{title}</h2>
    </div>
  );
}

interface DirectionCardProps {
  direction: DirectionResult;
  showUniversityBtn: boolean;
  onDetail: (d: DirectionResult) => void;
  onUniversity: (d: DirectionResult) => void;
}

const DirectionCard = memo(function DirectionCard({
  direction,
  showUniversityBtn,
  onDetail,
  onUniversity,
}: DirectionCardProps) {
  return (
    <button
      type="button"
      onClick={() => onDetail(direction)}
      className="bg-surface border border-default rounded-[18px] p-[18px_20px] text-left shadow-card transition-all hover:-translate-y-0.5 hover:border-[#C4B5FD] flex flex-col gap-3"
    >
      <div className="flex items-center justify-between">
        <span className="text-[24px]">🚀</span>
        <span
          className="font-extrabold rounded-pill px-[10px] py-[3px]"
          style={{ fontSize: 13, background: 'var(--success-bg)', color: 'var(--success-text)' }}
        >
          {direction.match_score}%
        </span>
      </div>
      <div>
        <p className="font-extrabold text-primary mb-[3px]" style={{ fontSize: 17 }}>{direction.name}</p>
        <p className="text-muted font-semibold leading-snug" style={{ fontSize: 13 }}>{direction.why_it_fits}</p>
      </div>
      {(direction.professions ?? []).length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {direction.professions.slice(0, 3).map((prof, i) => (
            <span
              key={i}
              className="px-2.5 py-0.5 rounded-pill text-caption text-secondary bg-raised border border-default"
            >
              {prof}
            </span>
          ))}
        </div>
      )}
      {showUniversityBtn && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onUniversity(direction); }}
          className="mt-1 flex items-center gap-1.5 text-brand font-semibold text-caption hover:opacity-75 transition-opacity"
        >
          <GraduationCap className="w-3.5 h-3.5" />
          Найти университеты
        </button>
      )}
    </button>
  );
});

function ResultsSkeleton() {
  return (
    <div className="max-w-4xl mx-auto py-8 flex flex-col gap-10">
      {Array.from({ length: 4 }, (_, i) => (
        <div key={i} className="flex flex-col gap-4">
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-28 w-full" />
        </div>
      ))}
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function ResultsPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const blockRefs = useRef<(HTMLDivElement | null)[]>([]);

  const {
    report,
    isLoading,
    error,
    hasCompletedAssessment,
    showUniversityBtn,
    topInterests,
    topThinking,
    refetch,
  } = useResults();

  useEffect(() => {
    if (currentStep > 0) {
      blockRefs.current[currentStep]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [currentStep]);

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

  function handleDirectionDetail(direction: DirectionResult) {
    navigate(`/results/directions/${encodeURIComponent(direction.slug)}`);
  }

  function handleUniversity(direction: DirectionResult) {
    navigate(`/results/directions/${encodeURIComponent(direction.slug)}/universities`);
  }

  const wellbeingZones = report.wellbeing_zones ?? [];
  const hasWellbeingZones = wellbeingZones.length > 0;
  const nextLabels = hasWellbeingZones
    ? [...BASE_NEXT_LABELS, WELLBEING_NEXT_LABEL]
    : BASE_NEXT_LABELS;
  const totalBlocks = nextLabels.length + 1;

  function handleNext() {
    setCurrentStep(prev => Math.min(prev + 1, totalBlocks - 1));
  }

  const isAllVisible = currentStep >= totalBlocks - 1;

  const thinkingDesc = topThinking.length > 0
    ? `У тебя хорошо развиты: ${topThinking.slice(0, 2).map(([cat]) => (THINKING_LABELS[cat] ?? cat).toLowerCase()).join(' и ')}.`
    : null;

  const topDirection = report.directions?.[0];

  return (
    <div className="max-w-4xl mx-auto py-8 flex flex-col gap-10">

      {/* Always visible page header */}
      <div>
        <h1 className="font-black text-primary mb-1.5 tracking-[-0.01em]" style={{ fontSize: 34 }}>Что мы узнали о тебе</h1>
        <p className="text-secondary font-semibold" style={{ fontSize: 16 }}>Твой профиль склонностей и рекомендованное направление</p>
      </div>

      {/* ── Block 0: Top match card ───────────────────────────────── */}
      {topDirection && (
        <AnimatedBlock blockRef={el => { blockRefs.current[0] = el; }}>
          <div
            className="relative overflow-hidden rounded-[24px] p-[30px_32px] text-on-brand"
            style={{ background: 'linear-gradient(135deg,#7C3AED,#6D28D9)', boxShadow: '0 14px 32px rgba(124,58,237,.26)' }}
          >
            <div className="absolute bottom-[-60px] right-[-30px] w-[220px] h-[220px] rounded-full pointer-events-none" style={{ background: 'rgba(255,255,255,0.08)' }} />
            <div className="relative">
              <div className="font-extrabold tracking-[.06em] uppercase mb-2 opacity-85" style={{ fontSize: 13 }}>
                🎯 Лучшее совпадение · {topDirection.match_score}%
              </div>
              <h2 className="font-black mb-2 tracking-[-0.01em]" style={{ fontSize: 32 }}>{topDirection.name}</h2>
              <p className="font-semibold opacity-90 mb-5 leading-relaxed" style={{ fontSize: 16, maxWidth: 520 }}>
                {topDirection.why_it_fits}
              </p>
              <div className="flex gap-3 flex-wrap">
                <button
                  type="button"
                  onClick={() => handleDirectionDetail(topDirection)}
                  className="h-[50px] px-7 rounded-pill font-extrabold transition-transform hover:scale-[1.03] active:scale-[0.98]"
                  style={{ background: '#fff', color: '#5B21B6', fontSize: 15, border: 'none' }}
                >
                  Подробнее →
                </button>
                {showUniversityBtn && (
                  <button
                    type="button"
                    onClick={() => handleUniversity(topDirection)}
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

      {/* ── Block 1: Резюме ──────────────────────────────────────── */}
      {currentStep >= 1 && (
        <AnimatedBlock blockRef={el => { blockRefs.current[1] = el; }}>
          <section aria-label="Резюме">
            <SectionHeader emoji="📋" title="Резюме" />
            <Card className="bg-brand-subtle">
              <p className="text-body text-primary leading-relaxed">{report.summary}</p>
            </Card>
          </section>
        </AnimatedBlock>
      )}

      {/* ── Block 2: Сильные стороны ─────────────────────────────── */}
      {currentStep >= 2 && (
        <AnimatedBlock blockRef={el => { blockRefs.current[2] = el; }}>
          <section aria-label="Сильные стороны">
            <SectionHeader emoji="💪" title="Сильные стороны" />
            <div className="flex flex-wrap gap-3">
              {(report.strengths ?? []).map((s, i) => (
                <div
                  key={i}
                  className="w-[130px] flex-shrink-0 bg-surface border border-default rounded-[var(--radius)] p-4 flex flex-col items-center gap-2 shadow-card"
                >
                  <span className="text-2xl select-none" aria-hidden="true">
                    {getIconForText(s, STRENGTH_ICON_PAIRS)}
                  </span>
                  <p className="text-caption text-primary text-center">{s}</p>
                </div>
              ))}
            </div>
          </section>
        </AnimatedBlock>
      )}

      {/* ── Block 3: Карта интересов ─────────────────────────────── */}
      {currentStep >= 3 && (
        <AnimatedBlock blockRef={el => { blockRefs.current[3] = el; }}>
          <section aria-label="Карта интересов">
            <SectionHeader emoji="📊" title="Твои сильные стороны" />
            <Card className="flex flex-col gap-4">
              {topInterests.length > 0 ? (
                topInterests.map(([cat, score]) => {
                  const label = INTEREST_LABELS[cat] ?? cat;
                  return (
                    <div key={cat}>
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="font-extrabold text-primary" style={{ fontSize: 15 }}>{label}</span>
                        <span className="font-extrabold text-brand" style={{ fontSize: 14 }}>{Math.round(score)}%</span>
                      </div>
                      <div
                        role="progressbar"
                        aria-valuenow={Math.round(score)}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label={label}
                        className="h-3 w-full rounded-full bg-brand-subtle overflow-hidden"
                      >
                        <div
                          className="h-full rounded-full transition-[width] duration-300 ease-out"
                          style={{ width: `${Math.round(score)}%`, background: 'linear-gradient(90deg,#7C3AED,#A855F7)' }}
                        />
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-caption text-muted text-center">Данных пока нет</p>
              )}
            </Card>
          </section>
        </AnimatedBlock>
      )}

      {/* ── Block 4: Стиль мышления ──────────────────────────────── */}
      {currentStep >= 4 && (
        <AnimatedBlock blockRef={el => { blockRefs.current[4] = el; }}>
          <section aria-label="Стиль мышления">
            <SectionHeader emoji="🧠" title="Стиль мышления" />
            {thinkingDesc && (
              <p className="text-body text-secondary mb-3">{thinkingDesc}</p>
            )}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
              {topThinking.map(([cat, score]) => (
                <div
                  key={cat}
                  className="bg-surface border border-default rounded-[var(--radius)] p-3 flex flex-col items-center gap-1 shadow-card"
                >
                  <span className="text-xl select-none" aria-hidden="true">
                    {THINKING_EMOJIS[cat] ?? '🔷'}
                  </span>
                  <p className="text-small font-semibold text-primary text-center">
                    {THINKING_LABELS[cat] ?? cat}
                  </p>
                  <p className="text-small font-bold text-brand">{`${Math.round(score)}%`}</p>
                </div>
              ))}
            </div>
          </section>
        </AnimatedBlock>
      )}

      {/* ── Block 5: Мотивация ───────────────────────────────────── */}
      {currentStep >= 5 && (
        <AnimatedBlock blockRef={el => { blockRefs.current[5] = el; }}>
          <section aria-label="Мотивация">
            <SectionHeader emoji="⚡" title="Что тебя мотивирует" />
            <div className="flex flex-col gap-2">
              {(report.motivation ?? []).map((text, i) => (
                <Card key={i} className="flex items-center gap-3 !p-4">
                  <span className="text-xl select-none flex-shrink-0" aria-hidden="true">
                    {getIconForText(text, MOTIVATION_ICON_PAIRS)}
                  </span>
                  <p className="text-body font-semibold text-primary">{text}</p>
                </Card>
              ))}
            </div>
          </section>
        </AnimatedBlock>
      )}

      {/* ── Block 6: Подходящие направления ─────────────────────── */}
      {currentStep >= 6 && (
        <AnimatedBlock blockRef={el => { blockRefs.current[6] = el; }}>
          <section aria-label="Подходящие направления">
            <SectionHeader emoji="🧑‍💼" title="Подходящие профессии" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {(report.directions ?? []).map(direction => (
                <DirectionCard
                  key={direction.slug}
                  direction={direction}
                  showUniversityBtn={showUniversityBtn}
                  onDetail={handleDirectionDetail}
                  onUniversity={handleUniversity}
                />
              ))}
            </div>
          </section>
        </AnimatedBlock>
      )}

      {/* ── Block 7: Зоны внимания (мягкая поддерживающая секция) ── */}
      {currentStep >= 7 && hasWellbeingZones && (
        <AnimatedBlock blockRef={el => { blockRefs.current[7] = el; }}>
          <section aria-label="Зоны внимания">
            <SectionHeader emoji="🌿" title="Зоны внимания" />
            <p className="text-body text-secondary mb-3">
              Несколько бережных наблюдений о твоём самочувствии — без оценок, просто на заметку
            </p>
            <div className="flex flex-col gap-2">
              {wellbeingZones.map((zone, i) => (
                <Card key={i} className="!p-4">
                  <p className="text-body font-semibold text-primary">{zone}</p>
                </Card>
              ))}
            </div>
          </section>
        </AnimatedBlock>
      )}

      {/* ── Next button ──────────────────────────────────────────── */}
      {!isAllVisible && (
        <div className="flex justify-center pb-4">
          <Button
            size="lg"
            onClick={handleNext}
            className="shadow-pop px-8"
          >
            {nextLabels[currentStep]}
          </Button>
        </div>
      )}

    </div>
  );
}
