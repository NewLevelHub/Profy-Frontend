import { memo } from 'react';
import { useNavigate } from 'react-router';
import { ChevronRight, GraduationCap } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { Card } from '@/shared/ui/Card';
import { Badge } from '@/shared/ui/Badge';
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

// ── Helpers ──────────────────────────────────────────────────────────────────

function getIconForText(text: string, pairs: [string, string][]): string {
  const lower = text.toLowerCase();
  for (const [kw, icon] of pairs) {
    if (lower.includes(kw)) return icon;
  }
  return '⭐';
}

function getInterestLevel(score: number) {
  if (score >= 70) return { label: 'Высокий', barClass: 'bg-brand', textClass: 'text-brand' };
  if (score >= 40) return { label: 'Средний', barClass: 'bg-accent', textClass: 'text-accent' };
  return { label: 'Низкий', barClass: 'bg-[var(--text-muted)]', textClass: 'text-muted' };
}

// ── Sub-components ───────────────────────────────────────────────────────────

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
    <Card className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-subtitle font-bold text-primary flex-1">{direction.name}</h3>
        <Badge variant="brand">{`${direction.match_score}%`}</Badge>
      </div>
      <p className="text-body text-secondary leading-relaxed">{direction.why_it_fits}</p>
      {(direction.professions ?? []).length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {direction.professions.slice(0, 4).map((prof, i) => (
            <span
              key={i}
              className="px-2.5 py-0.5 rounded-pill text-caption text-secondary bg-raised border border-default"
            >
              {prof}
            </span>
          ))}
        </div>
      )}
      <div className={cn('flex gap-2 mt-1', showUniversityBtn && 'flex-col sm:flex-row')}>
        <Button
          variant="primary"
          size="sm"
          className="flex-1 justify-between"
          onClick={() => onDetail(direction)}
        >
          Подробнее
          <ChevronRight className="w-4 h-4" />
        </Button>
        {showUniversityBtn && (
          <Button
            variant="ghost"
            size="sm"
            className="flex-1 gap-1.5"
            onClick={() => onUniversity(direction)}
          >
            <GraduationCap className="w-4 h-4" />
            Найти университеты
          </Button>
        )}
      </div>
    </Card>
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

  const thinkingDesc = topThinking.length > 0
    ? `У тебя хорошо развиты: ${topThinking.slice(0, 2).map(([cat]) => (THINKING_LABELS[cat] ?? cat).toLowerCase()).join(' и ')}.`
    : null;

  return (
    <div className="max-w-4xl mx-auto py-8 flex flex-col gap-10">
      <div>
        <h1 className="text-h1 font-extrabold text-primary mb-1">Твои результаты</h1>
        <p className="text-body text-secondary">Посмотри, что мы узнали о тебе</p>
      </div>

      {/* 1 — Резюме */}
      <section aria-label="Резюме">
        <SectionHeader emoji="📋" title="Резюме" />
        <Card className="bg-brand-subtle">
          <p className="text-body text-primary leading-relaxed">{report.summary}</p>
        </Card>
      </section>

      {/* 2 — Сильные стороны */}
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

      {/* 3 — Карта интересов */}
      <section aria-label="Карта интересов">
        <SectionHeader emoji="🗺️" title="Карта интересов" />
        <Card className="flex flex-col gap-4">
          {topInterests.length > 0 ? (
            topInterests.map(([cat, score]) => {
              const level = getInterestLevel(score);
              const label = INTEREST_LABELS[cat] ?? cat;
              return (
                <div key={cat} className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-caption font-semibold text-primary">{label}</span>
                    <span className={cn('text-small font-semibold', level.textClass)}>
                      {level.label}
                    </span>
                  </div>
                  <div
                    role="progressbar"
                    aria-valuenow={Math.round(score)}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={label}
                    className="h-2 w-full rounded-full bg-raised overflow-hidden"
                  >
                    <div
                      className={cn('h-full rounded-full transition-[width] duration-300 ease-out', level.barClass)}
                      style={{ width: `${Math.round(score)}%` }}
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

      {/* 4 — Стиль мышления */}
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

      {/* 5 — Мотивация */}
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

      {/* 6 — Подходящие направления */}
      <section aria-label="Подходящие направления">
        <SectionHeader emoji="🚀" title="Подходящие направления" />
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
    </div>
  );
}
