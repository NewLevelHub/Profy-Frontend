import { useNavigate } from 'react-router';
import { ArrowLeft, Map } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { Skeleton } from '@/shared/ui/Skeleton';
import { PageContainer } from '@/shared/ui/PageContainer';
import { PageHeader } from '@/shared/ui/PageHeader';
import { toDisplayString, formatCost, localizeKey } from '@/pages/results/utils/programUtils';
import { useProgramDetail } from '@/pages/results/hooks/useProgramDetail';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { directionRoadmapApi } from '@/shared/api/directionRoadmap';
import { useDirectionRoadmapStore } from '@/shared/store/directionRoadmap';
import { useAssessmentStore } from '@/shared/store/assessment';
import { GeneratingOverlay } from '@/shared/ui/roadmap/GeneratingOverlay';
import { AxiosError } from 'axios';

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
          className={`flex items-center justify-between gap-4 px-5 py-3.5 ${i > 0 ? 'border-t border-[#EDE9FE]' : ''}`}
        >
          <span className="text-[15px] font-semibold text-secondary">{localizeKey(key)}</span>
          <span className="text-[15px] font-extrabold text-primary text-right">{toDisplayString(value)}</span>
        </div>
      ))}
    </div>
  );
}

function DeadlinesGrid({ data }: { data: Record<string, unknown> }) {
  const entries = Object.entries(data);
  if (entries.length === 0) return null;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {entries.map(([key, value]) => (
        <div
          key={key}
          className="bg-surface border border-[#EDE9FE] rounded-2xl px-[18px] py-4 shadow-card"
        >
          <div className="text-[13px] font-bold text-muted mb-1">{localizeKey(key)}</div>
          <div className="text-[17px] font-black text-primary">{toDisplayString(value)}</div>
        </div>
      ))}
    </div>
  );
}

export default function ProgramDetailPage() {
  const navigate = useNavigate();
  const { program, isLoading, error } = useProgramDetail();
  const assessmentId = useAssessmentStore(s => s.assessmentId);
  const queryClient = useQueryClient();
  const setRoadmap = useDirectionRoadmapStore(s => s.setRoadmap);

  const buildPlanMutation = useMutation({
    mutationFn: (progId: string) => directionRoadmapApi.generateForProgram(assessmentId!, progId),
    onSuccess: (data) => {
      queryClient.setQueryData(['direction-roadmap', assessmentId, data.direction_slug], data);
      setRoadmap(data);
      navigate(`/results/directions/${encodeURIComponent(data.direction_slug)}/roadmap`);
    },
  });

  if (buildPlanMutation.isPending) {
    return <GeneratingOverlay />;
  }

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
            <span className="inline-flex items-center gap-1.5 bg-[#FFF7ED] text-[#C2410C] text-sm font-extrabold px-3.5 py-1.5 rounded-pill">
              💰 {formatCost(program.cost_per_year)}
            </span>
          </div>

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
              <RequirementsTable data={program.requirements ?? {}} />
            </div>
          )}

          {Object.keys(program.deadlines ?? {}).length > 0 && (
            <div>
              <SectionHeadingLocal>🗓️ Дедлайны</SectionHeadingLocal>
              <DeadlinesGrid data={program.deadlines ?? {}} />
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
              onClick={() => {
                if (program?.id) {
                  buildPlanMutation.mutate(program.id);
                }
              }}
              disabled={buildPlanMutation.isPending}
              className="flex-1 min-w-[200px] h-[58px] border-none rounded-pill bg-gradient-to-br from-brand to-[#6D28D9] text-on-brand text-[17px] font-extrabold cursor-pointer shadow-[0_10px_22px_rgba(124,58,237,.3)] hover:opacity-95 transition-opacity flex items-center justify-center gap-2"
            >
              <Map className="w-5 h-5" />
              {buildPlanMutation.isPending ? 'Составляем план...' : 'Построить мой план'}
            </button>
            <button
              onClick={() => navigate('/results')}
              className="flex-1 min-w-[200px] h-[58px] border-[1.5px] border-[#DDD6FE] rounded-pill bg-surface text-[#5B21B6] text-[17px] font-extrabold cursor-pointer hover:bg-brand-subtle transition-colors"
            >
              Назад к результатам
            </button>
          </div>
          {buildPlanMutation.isError && (
            <p className="text-red-500 text-caption font-semibold mt-1">
              {((buildPlanMutation.error as AxiosError<{ detail?: string }>).response?.data?.detail
                ?? 'Не удалось построить план. Попробуй ещё раз.')}
            </p>
          )}
        </div>
      )}
    </PageContainer>
  );
}
