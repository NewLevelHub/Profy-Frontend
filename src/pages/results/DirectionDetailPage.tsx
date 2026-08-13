import { useNavigate, useParams } from 'react-router';
import { ArrowLeft, GraduationCap, Map } from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { PageContainer } from '@/shared/ui/PageContainer';
import { PageHeader } from '@/shared/ui/PageHeader';
import { useResultStore } from '@/shared/store/result';
import { useAssessmentStore } from '@/shared/store/assessment';
import { useDirectionRoadmapStore } from '@/shared/store/directionRoadmap';
import { useProfileStore } from '@/shared/store/profile';

function SectionTitle({ icon, children }: { icon: string; children: string }) {
  return (
    <h3 className="text-[15px] font-bold text-primary flex items-center gap-2 mb-3">
      <span aria-hidden="true">{icon}</span>
      {children}
    </h3>
  );
}

export default function DirectionDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const report = useResultStore(s => s.report);
  const goal = useAssessmentStore(s => s.goal);
  const ageGroup = useProfileStore(s => s.profile?.age_group);

  const selectedDirectionSlug = useDirectionRoadmapStore(s => s.selectedDirectionSlug);

  const direction = report && report.interest_instrument === 'riasec'
    ? report.careers.find(d => d.slug === slug)
    : undefined;
  const showUniversityBtn = goal === 'university' && ageGroup === 'senior';
  const hasRoadmap = selectedDirectionSlug === slug;

  const skills = direction?.skills_needed ?? [];
  const subjects = direction?.subjects_to_develop ?? [];

  if (!direction) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 gap-4 text-center">
        <span className="text-5xl select-none" aria-hidden="true">🔍</span>
        <h2 className="text-h1 font-extrabold text-primary">Направление не найдено</h2>
        <Button onClick={() => navigate('/results')}>Назад к результатам</Button>
      </div>
    );
  }

  return (
    <PageContainer className="space-y-6">
      {/* Nav */}
      <div className="flex items-center justify-between gap-4">
        <button
          className="flex items-center gap-1.5 text-brand font-semibold text-label hover:opacity-70 transition-opacity"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="w-4 h-4" />
          Назад
        </button>
        <Button
          variant="ghost"
          size="lg"
          className="rounded-pill border border-default shrink-0"
          onClick={() => navigate('/results')}
        >
          Назад к результатам
        </Button>
      </div>

      {/* Hero: title + description | why it fits */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-5 lg:gap-6 items-start">
        <div className="flex flex-col gap-4 min-w-0">
          <PageHeader title={direction.name} />
          {direction.description && direction.description.length > 0 && (
            <p className="text-body text-secondary leading-relaxed">{direction.description}</p>
          )}
        </div>

        <Card className="bg-brand-subtle border-brand/20 flex flex-col gap-2 h-full">
          <p className="text-label font-bold text-primary flex items-center gap-2">
            <span aria-hidden="true">✨</span>
            Почему тебе подходит
          </p>
          <p className="text-body text-primary leading-relaxed">{direction.why}</p>
          {direction.matched_strengths.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-1">
              {direction.matched_strengths.map((strength, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded-pill text-caption font-semibold bg-surface text-brand"
                >
                  {strength}
                </span>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* 2-column info grid */}
      {(skills.length > 0 || subjects.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {skills.length > 0 && (
            <Card className="flex flex-col h-full">
              <SectionTitle icon="🛠️">Навыки для развития</SectionTitle>
              <ul className="flex flex-col gap-2.5">
                {skills.map((skill, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-body text-secondary">
                    <span
                      className="w-1.5 h-1.5 rounded-full bg-brand mt-2 flex-shrink-0"
                      aria-hidden="true"
                    />
                    {skill}
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {subjects.length > 0 && (
            <Card className="flex flex-col h-full">
              <SectionTitle icon="📚">Предметы для изучения</SectionTitle>
              <div className="flex flex-wrap gap-2">
                {subjects.map((subj, i) => (
                  <span
                    key={i}
                    className="px-3 py-1.5 rounded-pill text-caption font-semibold text-secondary bg-surface border border-default"
                  >
                    {subj}
                  </span>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Try now — always present (contract guarantees non-empty try_now) */}
      <Card className="bg-brand-subtle border-brand/20 flex flex-row items-start gap-3">
        <span className="text-2xl select-none flex-shrink-0" aria-hidden="true">⚡</span>
        <div>
          <p className="text-label font-bold text-primary mb-1">Попробуй прямо сейчас</p>
          <p className="text-body text-primary leading-relaxed">{direction.try_now}</p>
        </div>
      </Card>

      {/* Action buttons */}
      {(hasRoadmap || showUniversityBtn) && (
        <div className="flex flex-col sm:flex-row flex-wrap gap-3">
          {hasRoadmap && (
            <Button
              variant="primary"
              size="lg"
              className="gap-2 sm:flex-1 lg:flex-none lg:min-w-[240px]"
              onClick={() => navigate(`/results/directions/${encodeURIComponent(slug!)}/roadmap`)}
            >
              <Map className="w-5 h-5" />
              Мой план по направлению
            </Button>
          )}
          {showUniversityBtn && (
            <Button
              variant="ghost"
              size="lg"
              className="gap-2 sm:flex-1 lg:flex-none lg:min-w-[240px]"
              onClick={() => navigate(`/results/directions/${encodeURIComponent(slug!)}/universities`)}
            >
              <GraduationCap className="w-5 h-5" />
              Найти университеты
            </Button>
          )}
        </div>
      )}
    </PageContainer>
  );
}
