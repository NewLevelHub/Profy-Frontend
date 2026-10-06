import { useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { ArrowUpRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { StudentNavigation } from '@/shared/ui/redesign/StudentNavigation';
import { StudentPageHeading } from '@/shared/ui/redesign/StudentPageHeading';
import { PageContainer } from '@/shared/ui/PageContainer';
import { BackLink } from '@/shared/ui/BackLink';
import { UniversitiesView } from '../UniversitiesPage';
import { UniversityDetailView } from '../UniversityDetailPage';
import { UNIVERSITY_PAGE_SIZE } from '../hooks/useUniversities';
import { DirectionDetailView } from '@/pages/results/DirectionDetailPage';
import { ProgramDetailView } from '@/pages/results/ProgramDetailPage';
import { ProgramListSection } from '@/pages/results/components/ProgramListSection';
import { catalogFixtures } from './catalogFixtures';
import '@/shared/ui/redesign/redesign.css';
import '@/shared/ui/redesign/student.css';
import '@/shared/ui/redesign/catalog.css';

const VIEWS = ['catalog', 'university', 'direction', 'programs', 'program', 'international', 'loading', 'error'] as const;
type View = typeof VIEWS[number];

export default function CatalogDesignPreview() {
  const { t } = useTranslation('results');
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const requested = params.get('view');
  const view: View = VIEWS.find(item => item === requested) ?? 'catalog';
  const [favorites, setFavorites] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [country, setCountry] = useState<string | undefined>();
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [page, setPage] = useState(1);
  const [selectedUniversity, setSelectedUniversity] = useState(0);
  const [selectedProgram, setSelectedProgram] = useState('preview-program-0');
  const [programCountry, setProgramCountry] = useState<string | undefined>();
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [notice, setNotice] = useState(false);
  const mainRef = useRef<HTMLElement>(null);
  const { universities, universityDetails, programs, direction } = catalogFixtures(t, favorites);
  const select = (value: View) => { setParams({ view: value }); setNotice(false); mainRef.current?.scrollTo({ top: 0 }); };
  const toggleFavorite = (id: string, wasFavorite: boolean) => {
    setFavorites(previous => wasFavorite ? previous.filter(item => item !== id) : [...previous, id]);
    setPage(1);
  };
  const countries = Array.from(new Set(universities.map(item => item.country))).map(value => ({ country: value, count: universities.filter(item => item.country === value).length }));
  const filtered = universities.filter(item => (!country || item.country === country) && (!onlyFavorites || item.is_favorite)
    && `${item.name} ${item.city}`.toLocaleLowerCase().includes(search.toLocaleLowerCase())).sort((a, b) => Number(b.is_favorite) - Number(a.is_favorite));
  const countryFilters = [{ label: t('programList.allCountries'), value: undefined }, ...countries.map(item => ({ label: item.country, value: item.country }))];
  const visiblePrograms = programs.filter(item => !programCountry || item.university.country === programCountry);
  if (sortDirection === 'desc') visiblePrograms.reverse();
  const programList = <ProgramListSection programs={visiblePrograms} isLoading={false} error={null} activeCountry={programCountry}
    onCountryChange={setProgramCountry} countryFilters={countryFilters} refetch={() => {}}
    detailPathFor={id => `/results/directions/design/universities/${id}`} onToggleFavorite={toggleFavorite}
    sortDirection={sortDirection} onToggleSort={() => setSortDirection(value => value === 'asc' ? 'desc' : 'asc')} />;
  return <div className="redesign rd-student flex flex-col overflow-hidden">
    <aside className="rd-student-preview">
      <div className="rd-catalog-preview-heading">
        <p>{t('catalogDesign.preview.title')}</p>
        <Link to="/universities">{t('catalogDesign.preview.liveCatalog')}<ArrowUpRight size={15} aria-hidden="true" /></Link>
      </div>
      <nav aria-label={t('catalogDesign.preview.viewsLabel')}>{VIEWS.map(value => <button type="button" key={value} aria-pressed={view === value} onClick={() => { if (value === 'program') setSelectedProgram('preview-program-0'); select(value); }}>{t(`catalogDesign.preview.views.${value}`)}</button>)}</nav>
      {notice && <p role="status">{t('redesign.preview.notice')}</p>}
    </aside>
    <StudentNavigation persistLocale={false} activePath={view === 'direction' || view === 'programs' || view === 'program' || view === 'international' ? '/results' : '/universities'} identity={null}
      onLogout={() => setNotice(true)} onNavigate={path => path === '/universities' ? select('catalog') : navigate(path === '/profile' ? '/design/student?view=profile' : '/design/student')} />
    <main id="student-content" ref={mainRef} className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-6 lg:px-8 py-[var(--main-pad-y)]" onClickCapture={event => {
      const href = (event.target as Element).closest('a')?.getAttribute('href');
      if (href?.startsWith('/universities/')) {
        event.preventDefault(); setSelectedUniversity(Math.max(0, universities.findIndex(item => href.endsWith(item.id)))); select('university');
      } else if (href?.startsWith('/results/directions/')) {
        event.preventDefault(); setSelectedProgram(href.split('/').pop() ?? 'preview-program-0'); select('program');
      }
    }}>
      {(view === 'catalog' || view === 'loading' || view === 'error') && <UniversitiesView model={{ universities: filtered.slice((page - 1) * UNIVERSITY_PAGE_SIZE, page * UNIVERSITY_PAGE_SIZE), total: filtered.length,
        page, totalPages: Math.max(1, Math.ceil(filtered.length / UNIVERSITY_PAGE_SIZE)), setPage: value => { setPage(value); mainRef.current?.scrollTo({ top: 0 }); },
        isLoading: view === 'loading', isFetching: view === 'loading', error: view === 'error' ? true : null, refetch: () => select('catalog'),
        searchInput: search, setSearchInput: value => { setSearch(value); setPage(1); }, countries, activeCountry: country,
        setActiveCountry: value => { setCountry(value); setPage(1); }, onlyFavorites, toggleOnlyFavorites: () => { setOnlyFavorites(value => !value); setPage(1); }, toggleFavorite,
      }} />}
      {view === 'university' && <UniversityDetailView model={{ university: universityDetails[selectedUniversity], isLoading: false, error: null, refetch: () => {}, toggleFavorite }} goBack={() => select('catalog')} />}
      {view === 'direction' && <DirectionDetailView direction={direction} goBack={() => navigate('/design/student')}>
        <div className="rd-section-heading"><h2>{t('direction.universitiesKicker')}</h2></div>{programList}
      </DirectionDetailView>}
      {view === 'programs' && <PageContainer className="rd-catalog rd-detail"><BackLink className="rd-detail-back" onClick={() => select('direction')}>{t('common:back')}</BackLink>
        <StudentPageHeading kicker={t('direction.universitiesKicker')} title={t('universityList.title')} />{programList}
      </PageContainer>}
      {(view === 'program' || view === 'international') && <ProgramDetailView model={{ program: view === 'international' ? programs[1] : (selectedProgram.startsWith('preview-secondary-') ? { ...programs[Number(selectedProgram.split('-').pop())], name: t('catalogDesign.preview.data.programName2') } : programs.find(item => item.id === selectedProgram)), isLoading: false, error: null, assessmentId: null }} goBack={() => select('programs')} />}
    </main>
  </div>;
}
