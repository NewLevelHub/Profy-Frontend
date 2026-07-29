import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Spinner } from '@/shared/ui';
import { useProfileStore } from '@/shared/store/profile';
import { SPHERE_MASCOT } from '@/shared/config/sphereMascot';
import { useKnownProfessionTree } from './hooks/useKnownProfessionTree';
import { useProfessionSearch } from './hooks/useProfessionSearch';
import { ProfessionSearchInput } from './components/ProfessionSearchInput';
import { ProfessionSearchResults } from './components/ProfessionSearchResults';
import { SphereCard } from './components/SphereCard';
import type { SpecialtySearchMatch } from './utils/search';

export default function KnownProfessionSpheresPage() {
  const navigate = useNavigate();
  const ageGroup = useProfileStore(s => s.profile?.age_group ?? 'middle');
  const [query, setQuery] = useState('');

  const { data: tree, isLoading, error, refetch } = useKnownProfessionTree();
  const searchResults = useProfessionSearch(tree, query);
  const isSearching = query.trim().length > 0;

  function handleSelectMatch(match: SpecialtySearchMatch) {
    const label =
      ageGroup === 'junior' && match.specialty.label_junior
        ? match.specialty.label_junior
        : match.specialty.name;

    navigate(`/assessment/known-profession/${match.sphereSlug}/${match.specialty.slug}`, {
      state: {
        professionName: match.matchedProfession ?? label,
        sphereName: match.sphereName,
      },
    });
  }

  return (
    <div className="max-w-[620px] lg:max-w-5xl mx-auto flex flex-col">
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
          className="font-black text-primary tracking-[-0.02em] mb-2"
          style={{ fontSize: 34 }}
        >
          Выбери сферу
        </h1>
        <p className="text-secondary font-semibold text-pretty" style={{ fontSize: 17 }}>
          {isSearching
            ? 'Результаты поиска по всем сферам'
            : 'В какой области твоя профессия? Открой сферу, чтобы посмотреть профессии.'}
        </p>
      </div>

      {tree && tree.length > 0 && (
        <div className="mb-5">
          <ProfessionSearchInput
            value={query}
            onChange={setQuery}
            placeholder="Найди профессию или специальность"
          />
        </div>
      )}

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

      {tree && isSearching && (
        <ProfessionSearchResults
          results={searchResults}
          ageGroup={ageGroup}
          onSelect={handleSelectMatch}
        />
      )}

      {tree && tree.length > 0 && !isSearching && (
        <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-4 sm:gap-5">
          {tree.map(sphere => (
            <SphereCard
              key={sphere.slug}
              sphere={sphere}
              ageGroup={ageGroup}
              mascotKind={SPHERE_MASCOT[sphere.slug] ?? 'pm'}
              onClick={() => navigate(`/assessment/known-profession/${sphere.slug}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
