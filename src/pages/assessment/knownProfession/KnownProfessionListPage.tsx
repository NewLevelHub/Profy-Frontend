import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Spinner, Button } from '@/shared/ui';
import { useProfileStore } from '@/shared/store/profile';
import { useKnownProfessionTree } from './hooks/useKnownProfessionTree';
import { useProfessionSelection } from './hooks/useProfessionSelection';
import { ProfessionSearchInput } from './components/ProfessionSearchInput';
import { ProfessionListItem } from './components/ProfessionListItem';
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

  const { selectedSlug, toggle, ready, hint, confirm } = useProfessionSelection(
    sphere?.slug,
    sphere?.name,
    filteredProfessions,
    ageGroup,
  );

  return (
    <div className="min-h-screen bg-page flex flex-col">
      <div className="flex-1 overflow-y-auto px-6 py-[70px] lg:py-12">
        <div className="max-w-[620px] lg:max-w-4xl mx-auto flex flex-col gap-[18px]">
          <button
            type="button"
            onClick={() => navigate('/assessment/known-profession')}
            className="self-start text-secondary font-bold text-sm hover:text-primary transition-colors"
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
              <div
                className="self-start inline-flex items-center gap-[7px] bg-brand-subtle text-brand-text font-extrabold rounded-pill px-[14px] py-[6px]"
                style={{ fontSize: 13 }}
              >
                Уже знаешь · Шаг 2
              </div>

              <div>
                <h1
                  className="font-black text-primary tracking-[-0.02em] leading-[1.1]"
                  style={{ fontSize: 34 }}
                >
                  {sphere.name}
                </h1>
                <p className="text-secondary font-semibold mt-2 text-pretty" style={{ fontSize: 17 }}>
                  Выбери профессию — проверим, насколько она тебе подходит
                </p>
              </div>

              <ProfessionSearchInput
                value={query}
                onChange={setQuery}
                placeholder="Найди профессию в этой сфере"
              />

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
                <div className="flex flex-col gap-3">
                  {filteredProfessions.map(({ specialty: prof, matchedProfession }) => {
                    const label =
                      ageGroup === 'junior' && prof.label_junior ? prof.label_junior : prof.name;
                    const subtitle = matchedProfession
                      ? label
                      : label !== prof.name
                        ? prof.name
                        : null;
                    return (
                      <ProfessionListItem
                        key={prof.slug}
                        name={matchedProfession ?? label}
                        subtitle={subtitle}
                        selected={selectedSlug === prof.slug}
                        onSelect={() => toggle(prof.slug)}
                      />
                    );
                  })}
                </div>
              )}

              <div className="flex flex-wrap items-center gap-3.5 bg-surface border-[1.5px] border-default rounded-[20px] px-[22px] py-[18px] mt-1.5">
                <p className="flex-1 text-secondary font-semibold text-[15px] text-pretty">{hint}</p>
                <Button
                  type="button"
                  size="lg"
                  disabled={!ready}
                  onClick={confirm}
                  className="rounded-pill whitespace-nowrap"
                >
                  Проверить гипотезу
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
