import { useNavigate } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { directionsApi } from '@/shared/api/directions';
import { Spinner } from '@/shared/ui';
import { cn } from '@/shared/lib/cn';

const SPHERE_EMOJI: Record<string, string> = {
  'akinator-medicine': '🏥',
  'akinator-psychology-help': '💬',
  'akinator-animals-nature': '🐾',
  'akinator-it-data': '💻',
  'akinator-engineering-tech': '⚙️',
  'akinator-construction-manual': '🔧',
  'akinator-creative-design': '🎨',
  'akinator-stage-media': '🎬',
  'akinator-words-communication': '✍️',
  'akinator-education': '📚',
  'akinator-sports-body': '🏃',
  'akinator-food-hospitality': '🍳',
  'akinator-business-sales': '📈',
  'akinator-beauty-services': '✂️',
  'akinator-safety-rescue': '🚒',
  'akinator-logistics-service': '📦',
};

export default function KnownProfessionSpheresPage() {
  const navigate = useNavigate();

  const { data: tree, isLoading, error, refetch } = useQuery({
    queryKey: ['directions', 'tree'],
    queryFn: () => directionsApi.tree(),
  });

  return (
    <div className="min-h-screen bg-page flex flex-col">
      <div className="flex-1 overflow-y-auto px-6 py-[70px] lg:py-12">
        <div className="max-w-[620px] lg:max-w-4xl mx-auto flex flex-col">
          <button
            type="button"
            onClick={() => navigate('/assessment/goal')}
            className="self-start text-secondary font-bold text-sm mb-6 hover:text-primary transition-colors"
          >
            ← Назад к целям
          </button>

          <div className="mb-[30px]">
            <div
              className="inline-flex items-center gap-[7px] bg-brand-subtle text-brand-text font-extrabold rounded-pill px-[14px] py-[6px] mb-[18px]"
              style={{ fontSize: 13 }}
            >
              Уже знаешь · Шаг 1
            </div>
            <h1
              className="font-black text-primary tracking-[-0.01em] mb-2"
              style={{ fontSize: 34 }}
            >
              Выбери сферу
            </h1>
            <p className="text-secondary font-semibold" style={{ fontSize: 17 }}>
              В какой области твоя профессия?
            </p>
          </div>

          {isLoading && (
            <div className="flex justify-center py-12">
              <Spinner size="lg" />
            </div>
          )}

          {error && (
            <div className="flex flex-col items-center gap-3 py-8">
              <p className="text-danger text-sm text-center">
                Не удалось загрузить сферы. Проверь, что backend запущен и каталог засеян.
              </p>
              <button
                type="button"
                onClick={() => refetch()}
                className="text-brand-text font-extrabold text-sm"
              >
                Попробовать снова
              </button>
            </div>
          )}

          {tree && tree.length === 0 && (
            <p className="text-secondary text-center py-8">
              Каталог пуст. Запусти seed:{" "}
              <code className="text-xs bg-active px-2 py-1 rounded">
                python scripts/seed_akinator_content.py
              </code>
            </p>
          )}

          {tree && tree.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-[14px]">
              {tree.map((sphere, i) => (
                <button
                  key={sphere.slug}
                  type="button"
                  onClick={() =>
                    navigate(`/assessment/known-profession/${sphere.slug}`)
                  }
                  className={cn(
                    'flex items-center gap-[18px] px-[22px] py-5 text-left border-[1.5px] transition-all duration-[180ms]',
                    'border-default bg-surface hover:border-[#C4B5FD] hover:bg-hover hover:-translate-y-0.5',
                  )}
                  style={{
                    borderRadius: 20,
                    boxShadow: '0 4px 14px rgba(30,27,75,.05)',
                  }}
                >
                  <div
                    className="w-[54px] h-[54px] flex items-center justify-center shrink-0"
                    style={{
                      borderRadius: 15,
                      background: i % 3 === 0 ? 'var(--bg-brand-subtle, #F5F3FF)' : 'var(--bg-active)',
                    }}
                  >
                    <span className="text-[26px] leading-none" role="img">
                      {SPHERE_EMOJI[sphere.slug] ?? '🧭'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <p
                      className="font-extrabold text-primary mb-[3px]"
                      style={{ fontSize: 18 }}
                    >
                      {sphere.name}
                    </p>
                    <p
                      className="text-secondary font-semibold"
                      style={{ fontSize: 13 }}
                    >
                      {sphere.professions.length}{' '}
                      {sphere.professions.length === 1
                        ? 'профессия'
                        : sphere.professions.length < 5
                          ? 'профессии'
                          : 'профессий'}
                    </p>
                  </div>
                  <span
                    className="text-[22px] text-[#A78BFA] font-black shrink-0"
                    aria-hidden
                  >
                    ›
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
