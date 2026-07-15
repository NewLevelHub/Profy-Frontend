import { memo } from 'react';
import { useNavigate } from 'react-router';
import { GraduationCap, Sparkles } from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { Skeleton } from '@/shared/ui/Skeleton';
import { PageContainer } from '@/shared/ui/PageContainer';
import { PageHeader } from '@/shared/ui/PageHeader';
import { SectionHeading } from '@/shared/ui/SectionHeading';
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

// Пастельная палитра для иконок сильных сторон — чередуется по кругу,
// как в дизайн-референсе (rose/amber/blue/green).
const STRENGTH_ICON_BG = ['#FFE4E6', '#FEF3C7', '#DBEAFE', '#DCFCE7'];

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

// Направления генерируются ИИ, фиксированного enum нет — подбираем эмодзи
// по ключевым словам в названии. Порядок важен: более специфичное выше общего
// (напр. «искусственный интеллект» до «искусство»).
const DIRECTION_ICON_PAIRS: [string, string][] = [
  ['искусственн', '🤖'], ['машинн', '🤖'], ['нейросет', '🤖'], ['робот', '🤖'],
  ['data', '📊'], ['данн', '📊'], ['аналит', '📊'], ['статист', '📊'],
  ['кибербез', '🔒'], ['безопасн', '🔒'],
  ['айти', '💻'], ['разработ', '💻'], ['программир', '💻'], ['цифров', '💻'], ['веб', '💻'], ['софт', '💻'],
  ['медиц', '🩺'], ['здоров', '🩺'], ['врач', '🩺'], ['фарм', '💊'],
  ['биолог', '🧬'], ['генет', '🧬'],
  ['хими', '🧪'], ['физик', '⚛️'], ['матем', '📐'],
  ['наук', '🔬'], ['исследов', '🔬'],
  ['инженер', '⚙️'], ['механ', '⚙️'], ['производств', '🏭'], ['электрон', '🔌'], ['энерг', '⚡'],
  ['космос', '🚀'], ['авиа', '✈️'],
  ['архитект', '🏛️'], ['строит', '🏗️'],
  ['дизайн', '🎨'], ['художн', '🖼️'], ['искусств', '🎭'], ['творч', '🎭'],
  ['музык', '🎵'], ['театр', '🎭'], ['кино', '🎬'], ['видео', '🎬'], ['анимац', '🎞️'], ['фото', '📷'],
  ['мод', '👗'], ['стиль', '👗'],
  ['бизнес', '📈'], ['предприним', '📈'], ['менеджм', '📈'], ['управлен', '📈'],
  ['финанс', '💰'], ['эконом', '💰'], ['банк', '🏦'], ['бухгалт', '🧾'],
  ['маркетинг', '📣'], ['реклам', '📣'], ['продаж', '🛒'],
  ['прав', '⚖️'], ['юрис', '⚖️'], ['закон', '⚖️'],
  ['педагог', '📚'], ['образован', '📚'], ['преподав', '📚'], ['учит', '📚'],
  ['психолог', '🧠'],
  ['социальн', '🤝'], ['обществ', '🤝'],
  ['политик', '🏛️'], ['госуд', '🏛️'],
  ['журналист', '📰'], ['медиа', '📱'], ['контент', '📱'],
  ['язык', '🗣️'], ['лингвист', '🗣️'], ['перевод', '🗣️'],
  ['истор', '📜'],
  ['эколог', '🌿'], ['природ', '🌿'], ['окружающ', '🌿'],
  ['сельск', '🌾'], ['агро', '🌾'], ['ферм', '🌾'],
  ['спорт', '🏅'], ['фитнес', '🏅'], ['тренер', '🏅'],
  ['кулинар', '🍳'], ['повар', '🍳'], ['пищев', '🍳'], ['ресторан', '🍽️'],
  ['туризм', '✈️'], ['путешеств', '✈️'], ['гостеприим', '🏨'], ['гостинич', '🏨'],
  ['транспорт', '🚚'], ['логист', '🚚'], ['перевозк', '🚚'],
  ['гейм', '🎮'], ['игр', '🎮'],
];

// ── Helpers ──────────────────────────────────────────────────────────────────

function getIconForText(text: string, pairs: [string, string][], fallback = '⭐'): string {
  const lower = text.toLowerCase();
  for (const [kw, icon] of pairs) {
    if (lower.includes(kw)) return icon;
  }
  return fallback;
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

interface DirectionCardProps {
  direction: DirectionResult;
  showUniversityBtn: boolean;
  showInquiryBtn: boolean;
  onDetail: (d: DirectionResult) => void;
  onUniversity: (d: DirectionResult) => void;
  onInquiry: (d: DirectionResult) => void;
}

const DirectionCard = memo(function DirectionCard({
  direction,
  showUniversityBtn,
  showInquiryBtn,
  onDetail,
  onUniversity,
  onInquiry,
}: DirectionCardProps) {
  return (
    <Card
      onClick={() => onDetail(direction)}
      className="!p-[22px] flex flex-col gap-3 cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-pop"
    >
      <span className="text-[26px]" aria-hidden="true">
        {getIconForText(direction.name, DIRECTION_ICON_PAIRS, '🧭')}
      </span>
      <div>
        <p className="font-extrabold text-primary mb-[3px]" style={{ fontSize: 16 }}>{direction.name}</p>
        <p className="text-muted font-medium leading-snug" style={{ fontSize: 13 }}>{direction.why_it_fits}</p>
      </div>
      {(direction.professions ?? []).length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {direction.professions.slice(0, 3).map((prof, i) => (
            <span
              key={i}
              className="font-bold text-brand bg-brand-subtle rounded-pill"
              style={{ fontSize: 11.5, padding: '5px 12px' }}
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
          className="flex items-center gap-1.5 text-brand font-semibold text-caption hover:opacity-75 transition-opacity"
        >
          <GraduationCap className="w-3.5 h-3.5" />
          Найти университеты
        </button>
      )}
      {showInquiryBtn && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onInquiry(direction); }}
          className="mt-1 flex items-center justify-center gap-1.5 rounded-pill border-2 border-default bg-surface text-brand font-extrabold transition-colors hover:bg-brand-subtle"
          style={{ fontSize: 12.5, padding: 12 }}
        >
          <Sparkles className="w-3.5 h-3.5" />
          Подходит ли мне это направление?
        </button>
      )}
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onDetail(direction); }}
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
    topInterests,
    topThinking,
    refetch,
  } = useResults();

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

  function handleInquiry(direction: DirectionResult) {
    navigate(`/results/directions/${encodeURIComponent(direction.slug)}/inquiry`);
  }

  const showInquiryBtn = ageGroup === 'middle' || ageGroup === 'senior';
  const wellbeingZones = report.wellbeing_zones ?? [];
  const hasWellbeingZones = wellbeingZones.length > 0;

  const thinkingDesc = topThinking.length > 0
    ? `У тебя хорошо развиты: ${topThinking.slice(0, 2).map(([cat]) => (THINKING_LABELS[cat] ?? cat).toLowerCase()).join(' и ')}.`
    : null;

  const topDirection = report.directions?.[0];

  return (
    <PageContainer className="flex flex-col gap-6">

      <PageHeader
        title="Что мы узнали о тебе"
        subtitle="Твой профиль склонностей и рекомендованное направление"
      />

      {/* ── Лучшее совпадение ────────────────────────────────────── */}
      {topDirection && (
        <AnimatedBlock>
          <div
            className="relative overflow-hidden rounded-[24px] p-[30px_32px] text-on-brand"
            style={{ background: 'linear-gradient(135deg,#7C3AED,#6D28D9)', boxShadow: '0 14px 32px rgba(124,58,237,.26)' }}
          >
            <div className="absolute bottom-[-60px] right-[-30px] w-[220px] h-[220px] rounded-full pointer-events-none" style={{ background: 'rgba(255,255,255,0.08)' }} />
            <div className="relative">
              <div className="font-extrabold tracking-[.06em] uppercase mb-2 opacity-85" style={{ fontSize: 13 }}>
                🎯 Лучшее совпадение
              </div>
              <h2 className="font-black mb-2 tracking-[-0.01em] text-[32px] leading-tight">{topDirection.name}</h2>
              <p className="font-semibold opacity-90 mb-5 leading-relaxed text-base max-w-2xl">
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

      {/* ── Резюме ───────────────────────────────────────────────── */}
      {report.summary && (
        <AnimatedBlock>
          <section aria-label="Резюме">
            <SectionHeader emoji="📋" title="Резюме" />
            <Card className="bg-brand-subtle">
              <p className="text-body text-primary leading-relaxed">{report.summary}</p>
            </Card>
          </section>
        </AnimatedBlock>
      )}

      {/* ── Сильные стороны ──────────────────────────────────────── */}
      {(report.strengths ?? []).length > 0 && (
        <AnimatedBlock>
          <section aria-label="Сильные стороны">
            <SectionHeader emoji="💪" title="Сильные стороны" />
            <div className="flex flex-wrap gap-2.5">
              {report.strengths.map((s, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2.5 bg-surface rounded-pill pl-2 pr-4 py-1.5 shadow-card"
                >
                  <span
                    className="w-8 h-8 rounded-full flex items-center justify-center text-lg select-none flex-shrink-0"
                    style={{ background: STRENGTH_ICON_BG[i % STRENGTH_ICON_BG.length] }}
                    aria-hidden="true"
                  >
                    {getIconForText(s, STRENGTH_ICON_PAIRS)}
                  </span>
                  <p className="text-caption font-semibold text-primary">{s}</p>
                </div>
              ))}
            </div>
          </section>
        </AnimatedBlock>
      )}

      {/* ── Мотивация ────────────────────────────────────────────── */}
      {(report.motivation ?? []).length > 0 && (
        <AnimatedBlock>
          <section aria-label="Мотивация">
            <SectionHeader emoji="⚡" title="Что тебя мотивирует" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {report.motivation.map((text, i) => (
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

      {/* ── Подходящие профессии ─────────────────────────────────── */}
      {(report.directions ?? []).length > 0 && (
        <AnimatedBlock>
          <section aria-label="Подходящие направления">
            <SectionHeader emoji="👥" title="Подходящие профессии" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[18px]">
              {report.directions.map(direction => (
                <DirectionCard
                  key={direction.slug}
                  direction={direction}
                  showUniversityBtn={showUniversityBtn}
                  showInquiryBtn={showInquiryBtn}
                  onDetail={handleDirectionDetail}
                  onUniversity={handleUniversity}
                  onInquiry={handleInquiry}
                />
              ))}
            </div>
          </section>
        </AnimatedBlock>
      )}

      {/* ── Интересы + Стиль мышления/Зоны внимания ─────────────────── */}
      <AnimatedBlock>
        <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-5">
          <section aria-label="Твои интересы" className="min-w-0">
            <SectionHeader emoji="📊" title="Твои интересы" />
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
                          style={{ width: `${Math.round(score)}%`, background: 'linear-gradient(90deg,#A78BFA,#7C3AED)' }}
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

          <div className="flex flex-col gap-6 min-w-0">
            <section aria-label="Стиль мышления">
              <SectionHeader emoji="🧠" title="Стиль мышления" />
              {thinkingDesc && (
                <p className="text-body text-secondary mb-3">{thinkingDesc}</p>
              )}
              <div className="grid grid-cols-2 gap-3">
                {topThinking.map(([cat, score]) => (
                  <div
                    key={cat}
                    className="bg-surface rounded-[16px] p-4 text-center shadow-card"
                  >
                    <span className="block mb-1.5 text-xl select-none" aria-hidden="true">
                      {THINKING_EMOJIS[cat] ?? '🔷'}
                    </span>
                    <p className="font-semibold text-secondary mb-1" style={{ fontSize: 11.5 }}>
                      {THINKING_LABELS[cat] ?? cat}
                    </p>
                    <p className="font-extrabold text-primary" style={{ fontSize: 17 }}>{`${Math.round(score)}%`}</p>
                  </div>
                ))}
              </div>
            </section>

            {hasWellbeingZones && (
              <section aria-label="Зоны внимания">
                <SectionHeader emoji="🌿" title="Зоны внимания" />
                <div className="rounded-[16px] overflow-hidden bg-success-subtle">
                  {wellbeingZones.map((zone, i) => (
                    <div key={i} className="px-5 py-4">
                      <p className="font-semibold" style={{ fontSize: 13.5, color: 'var(--success-text)', lineHeight: 1.5 }}>{zone}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </AnimatedBlock>

    </PageContainer>
  );
}
