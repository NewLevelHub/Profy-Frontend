import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Spinner } from '@/shared/ui';
import { cn } from '@/shared/lib/cn';
import { hasSpecializedBank } from './questionBanks';
import { useProfileStore } from '@/shared/store/profile';
import { useKnownProfessionTree } from './hooks/useKnownProfessionTree';
import { ProfessionSearchInput } from './components/ProfessionSearchInput';
import { filterSpecialties } from './utils/search';

export default function KnownProfessionListPage() {
  const navigate = useNavigate();
  const { sphereSlug } = useParams<{ sphereSlug: string }>();
  const ageGroup = useProfileStore(s => s.profile?.age_group ?? 'middle');
  const [query, setQuery] = useState('');

  const { data: tree, isLoading, error } = useKnownProfessionTree();

  const sphere = tree?.find(s => s.slug === sphereSlug);
  const filteredProfessions = useMemo(
    () => filterSpecialties(sphere?.professions ?? [], query),
    [sphere, query],
  );

  return (
    <div className="min-h-screen bg-page flex flex-col">
      <div className="flex-1 overflow-y-auto px-6 py-[70px] lg:py-12">
        <div className="max-w-[620px] lg:max-w-4xl mx-auto flex flex-col">
          <button
            type="button"
            onClick={() => navigate('/assessment/known-profession')}
            className="self-start text-secondary font-bold text-sm mb-6 hover:text-primary transition-colors"
          >
            ← Все сферы
          </button>

          {isLoading && (
            <div className="flex justify-center py-12">
              <Spinner size="lg" />
            </div>
          )}

          {error && (
            <p className="text-danger text-sm text-center py-8">
              Не удалось загрузить профессии
            </p>
          )}

          {!isLoading && !sphere && (
            <p className="text-secondary text-center py-8">Сфера не найдена</p>
          )}

          {sphere && (
            <>
              <div className="mb-[30px]">
                <div
                  className="inline-flex items-center gap-[7px] bg-brand-subtle text-brand-text font-extrabold rounded-pill px-[14px] py-[6px] mb-[18px]"
                  style={{ fontSize: 13 }}
                >
                  Уже знаешь · Шаг 2
                </div>
                <h1
                  className="font-black text-primary tracking-[-0.01em] mb-2"
                  style={{ fontSize: 34 }}
                >
                  {sphere.name}
                </h1>
                <p className="text-secondary font-semibold" style={{ fontSize: 17 }}>
                  Выбери профессию — проверим, насколько она тебе подходит
                </p>
              </div>

              <div className="mb-5">
                <ProfessionSearchInput
                  value={query}
                  onChange={setQuery}
                  placeholder="Найди профессию в этой сфере"
                />
              </div>

              {filteredProfessions.length === 0 ? (
                <p className="text-secondary text-center py-8">
                  Ничего не нашлось в этой сфере. Попробуй другое слово или{' '}
                  <button
                    type="button"
                    onClick={() => navigate('/assessment/known-profession')}
                    className="text-brand-text font-extrabold"
                  >
                    поищи по всем сферам
                  </button>
                  .
                </p>
              ) : (
                <div className="flex flex-col gap-[10px]">
                  {filteredProfessions.map(({ specialty: prof, matchedProfession }) => {
                    const label =
                      ageGroup === 'junior' && prof.label_junior
                        ? prof.label_junior
                        : prof.name;
                    // matched via a job title -> subtitle gives the specialty
                    // it belongs to (header already shows the job title);
                    // otherwise fall back to the original junior/full-name pairing.
                    const subtitle = matchedProfession
                      ? label
                      : label !== prof.name
                        ? prof.name
                        : null;
                    const specialized = hasSpecializedBank(prof.slug);

                    return (
                      <button
                        key={prof.slug}
                        type="button"
                        onClick={() =>
                          navigate(
                            `/assessment/known-profession/${sphere.slug}/${prof.slug}`,
                            {
                              state: {
                                professionName: matchedProfession ?? label,
                                sphereName: sphere.name,
                              },
                            },
                          )
                        }
                        className={cn(
                          'flex items-center gap-4 px-5 py-4 text-left border-[1.5px] transition-all duration-[180ms]',
                          'border-default bg-surface hover:border-[#C4B5FD] hover:bg-hover hover:-translate-y-0.5',
                        )}
                        style={{
                          borderRadius: 18,
                          boxShadow: '0 4px 14px rgba(30,27,75,.04)',
                        }}
                      >
                        <div className="flex-1 min-w-0">
                          <p
                            className="font-extrabold text-primary"
                            style={{ fontSize: 17 }}
                          >
                            {matchedProfession ?? label}
                          </p>
                          {subtitle && (
                            <p className="text-secondary text-xs font-semibold mt-0.5">
                              {subtitle}
                            </p>
                          )}
                        </div>
                        {specialized ? (
                          <span
                            className="shrink-0 text-[11px] font-extrabold text-brand-text bg-brand-subtle px-2.5 py-1 rounded-pill"
                          >
                            свой банк
                          </span>
                        ) : (
                          <span className="shrink-0 text-[11px] font-bold text-muted">
                            общий банк
                          </span>
                        )}
                        <span
                          className="text-[20px] text-[#A78BFA] font-black shrink-0"
                          aria-hidden
                        >
                          ›
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
