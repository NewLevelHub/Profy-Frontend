import { useNavigate } from 'react-router';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { PageContainer } from '@/shared/ui/PageContainer';
import { PageHeader } from '@/shared/ui/PageHeader';
import { useUniversityList } from '@/pages/results/hooks/useUniversityList';
import { ProgramListSection } from '@/pages/results/components/ProgramListSection';

export default function UniversityListPage() {
  const navigate = useNavigate();
  const {
    programs,
    isLoading,
    error,
    activeCountry,
    setActiveCountry,
    countryFilters,
    sortDirection,
    toggleSortDirection,
    isAllowed,
    handleProgramClick,
    refetch,
  } = useUniversityList();

  if (!isAllowed) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 gap-4 text-center">
        <span className="text-5xl select-none" aria-hidden="true">🔒</span>
        <h2 className="text-h1 font-extrabold text-primary">Раздел недоступен</h2>
        <p className="text-body text-secondary max-w-md">
          Этот раздел открыт для учеников старшей школы, планирующих поступление в вуз.
        </p>
        <Button onClick={() => navigate('/results')}>Назад к результатам</Button>
      </div>
    );
  }

  return (
    <PageContainer className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-brand text-label font-extrabold hover:opacity-70 transition-opacity shrink-0"
        >
          <ArrowLeft className="w-4 h-4" />
          Назад
        </button>
        <PageHeader title="Университеты" className="flex-1 min-w-0" />
      </div>

      <ProgramListSection
        programs={programs}
        isLoading={isLoading}
        error={error}
        activeCountry={activeCountry}
        onCountryChange={setActiveCountry}
        countryFilters={countryFilters}
        refetch={refetch}
        onViewDetail={handleProgramClick}
        sortDirection={sortDirection}
        onToggleSort={toggleSortDirection}
      />
    </PageContainer>
  );
}
