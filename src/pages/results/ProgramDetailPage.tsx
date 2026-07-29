import { useNavigate } from 'react-router';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { Skeleton } from '@/shared/ui/Skeleton';
import { PageContainer } from '@/shared/ui/PageContainer';
import { PageHeader } from '@/shared/ui/PageHeader';
import { toDisplayString, localizeKey } from '@/pages/results/utils/programUtils';
import { useProgramDetail } from '@/pages/results/hooks/useProgramDetail';

function ProgramDetailSkeleton() {
  return (
    <div className="flex flex-col gap-5">
      <Skeleton className="h-9 w-2/3" />
      <Skeleton className="h-5 w-1/3" />
      <div className="flex gap-2">
        <Skeleton className="h-8 w-28 rounded-full" />
        <Skeleton className="h-8 w-32 rounded-full" />
        <Skeleton className="h-8 w-28 rounded-full" />
      </div>
      {[1, 2, 3].map(i => (
        <div key={i} className="rounded-[20px] border border-[#EDE9FE] p-6 flex flex-col gap-2">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      ))}
    </div>
  );
}

function SectionHeadingLocal({ children }: { children: string }) {
  return (
    <h3 className="text-[18px] font-black text-primary mb-2.5">{children}</h3>
  );
}

function RequirementsTable({ data }: { data: Record<string, unknown> }) {
  const entries = Object.entries(data);
  if (entries.length === 0) return null;
  return (
    <div className="bg-surface border border-[#EDE9FE] rounded-[20px] overflow-hidden shadow-card">
      {entries.map(([key, value], i) => (
        <div
          key={key}
          className={`flex items-center justify-between flex-wrap gap-x-4 gap-y-1 px-5 py-3.5 ${i > 0 ? 'border-t border-[#EDE9FE]' : ''}`}
        >
          <span className="text-[15px] font-semibold text-secondary">{localizeKey(key)}</span>
          <span className="text-[15px] font-extrabold text-primary text-right">{toDisplayString(value)}</span>
        </div>
      ))}
    </div>
  );
}

export default function ProgramDetailPage() {
  const navigate = useNavigate();
  const { program, isLoading, error } = useProgramDetail();

  return (
    <PageContainer className="space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-brand text-[15px] font-extrabold hover:opacity-70 transition-opacity"
      >
        <ArrowLeft className="w-4 h-4" />
        Назад
      </button>

      {isLoading ? (
        <ProgramDetailSkeleton />
      ) : error !== null || !program ? (
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <p className="text-body text-danger">{error ?? 'Программа не найдена'}</p>
          <Button variant="ghost" onClick={() => navigate(-1)}>Назад</Button>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          <PageHeader title={program.name} subtitle={program.university.name} />

          <div className="flex gap-2.5 flex-wrap">
            <span className="inline-flex items-center gap-1.5 bg-[#EDE9FE] text-[#5B21B6] text-sm font-extrabold px-3.5 py-1.5 rounded-pill">
              🌐 {program.language}
            </span>
            {program.university.ranking !== null && (
              <span className="inline-flex items-center gap-1.5 bg-[#ECFDF5] text-[#047857] text-sm font-extrabold px-3.5 py-1.5 rounded-pill">
                🏆 QS #{program.university.ranking}
              </span>
            )}
          </div>

          {program.university.description && (
            <div className="bg-surface border border-[#EDE9FE] rounded-[20px] p-6 shadow-card">
              <SectionHeadingLocal>🏛️ Об университете</SectionHeadingLocal>
              <p className="text-[15px] text-secondary font-semibold leading-relaxed m-0 mb-3">
                {program.university.description}
              </p>
              <div className="flex flex-col gap-1 text-[14px] font-semibold text-muted">
                <span>📍 {program.university.city}, {program.university.country}</span>
                {program.university.website && (
                  <a
                    href={program.university.website}
                    target="_blank"
                    rel="noreferrer"
                    className="text-brand hover:underline"
                  >
                    {program.university.website}
                  </a>
                )}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {program.description && program.description.length > 0 && (
              <div className="bg-surface border border-[#EDE9FE] rounded-[20px] p-6 shadow-card">
                <SectionHeadingLocal>📋 Описание</SectionHeadingLocal>
                <p className="text-[15px] text-secondary font-semibold leading-relaxed m-0">{program.description}</p>
              </div>
            )}

            {program.who_its_for && program.who_its_for.length > 0 && (
              <div className="bg-[#EDE9FE] rounded-[20px] p-6">
                <SectionHeadingLocal>🎯 Для кого</SectionHeadingLocal>
                <p className="text-[15px] text-secondary font-semibold leading-relaxed m-0">{program.who_its_for}</p>
              </div>
            )}
          </div>

          {(program.career_options ?? []).length > 0 && (
            <div>
              <SectionHeadingLocal>💼 Карьерные пути</SectionHeadingLocal>
              <div className="flex gap-2 flex-wrap">
                {program.career_options.map((career, i) => (
                  <span
                    key={i}
                    className="bg-[#EDE9FE] text-[#5B21B6] text-sm font-extrabold px-4 py-2 rounded-pill"
                  >
                    {toDisplayString(career)}
                  </span>
                ))}
              </div>
            </div>
          )}

          {Object.keys(program.requirements ?? {}).length > 0 && (
            <div>
              <SectionHeadingLocal>📝 Требования</SectionHeadingLocal>
              {Array.isArray(program.requirements.admission_requirements) && (
                <ul className="mb-4 pl-5 text-[15px] text-secondary font-semibold leading-relaxed space-y-2">
                  {(program.requirements.admission_requirements as string[]).map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              )}
              <RequirementsTable
                data={Object.fromEntries(
                  Object.entries(program.requirements ?? {}).filter(([key]) => key !== 'admission_requirements'),
                )}
              />
            </div>
          )}


          {(program.grants ?? []).length > 0 && (
            <div className="bg-[#FFF7ED] border border-[#FED7AA] rounded-[20px] px-6 py-5 flex items-center gap-3.5">
              <span className="text-3xl">🎓</span>
              <div>
                <div className="text-base font-black text-[#C2410C] mb-0.5">Гранты и стипендии</div>
                <div className="text-sm font-semibold text-[#9A3412]">
                  {program.grants.map(g => toDisplayString(g)).join(' · ')}
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={() => navigate(-1)}
              className="flex-1 min-w-[200px] h-[58px] border-none rounded-pill bg-gradient-to-br from-brand to-[#6D28D9] text-on-brand text-[17px] font-extrabold cursor-pointer shadow-[0_10px_22px_rgba(124,58,237,.3)] hover:opacity-95 transition-opacity"
            >
              🎓 Посмотреть университеты
            </button>
            <button
              onClick={() => navigate('/results')}
              className="flex-1 min-w-[200px] h-[58px] border-[1.5px] border-[#DDD6FE] rounded-pill bg-surface text-[#5B21B6] text-[17px] font-extrabold cursor-pointer hover:bg-brand-subtle transition-colors"
            >
              Назад к результатам
            </button>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
