import { memo } from 'react';
import { useNavigate } from 'react-router';
import { ROUTES } from '@/app/routes';
import type { ProgramBrief } from '@/shared/types';

interface ResultProgramRecommendationsProps {
  programs: ProgramBrief[];
  directionSlug: string;
}

const ProgramCard = memo(function ProgramCard({
  program,
  onSelect,
}: {
  program: ProgramBrief;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="bg-surface border border-[#EDE9FE] rounded-[22px] p-6 shadow-card flex flex-col h-full">
      <div className="flex items-start justify-between gap-3 mb-1">
        <h3 className="text-[21px] font-black leading-snug text-primary m-0">{program.name}</h3>
        <span className="shrink-0 bg-[#EDE9FE] text-[#5B21B6] text-xs font-extrabold px-3 py-1 rounded-pill whitespace-nowrap">
          {program.university.city}
        </span>
      </div>

      <div className="text-base font-semibold text-muted mb-3">{program.university.name}</div>

      {program.description && program.description.length > 0 && (
        <p className="text-[15px] font-semibold text-secondary leading-relaxed mb-4 flex-1">
          {program.description.length > 120 ? program.description.slice(0, 120) + '...' : program.description}
        </p>
      )}

      <div className="flex gap-4 flex-wrap mb-4 text-[15px] font-bold text-secondary">
        <span className="inline-flex items-center gap-1.5 whitespace-nowrap">🌐 {program.language}</span>
      </div>

      <button
        onClick={() => onSelect(program.id)}
        className="w-full h-[52px] border-[1.5px] border-[#DDD6FE] rounded-2xl bg-surface text-brand text-base font-extrabold cursor-pointer hover:bg-brand-subtle transition-colors mt-auto"
      >
        Посмотреть требования
      </button>
    </div>
  );
});

export function ResultProgramRecommendations({ programs, directionSlug }: ResultProgramRecommendationsProps) {
  const navigate = useNavigate();

  if (programs.length === 0) return null;

  function handleProgramClick(programId: string) {
    navigate(ROUTES.programDetail(directionSlug, programId));
  }

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-h2 font-extrabold text-primary m-0">Подходящие университеты</h2>
        <p className="text-body text-secondary m-0">
          Программы в Астане и Казахстане, которые соответствуют твоему направлению
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {programs.map(program => (
          <ProgramCard key={program.id} program={program} onSelect={handleProgramClick} />
        ))}
      </div>

      <button
        onClick={() => navigate(ROUTES.universityList(directionSlug))}
        className="self-start text-brand text-base font-extrabold hover:underline"
      >
        Смотреть все программы
      </button>
    </section>
  );
}
