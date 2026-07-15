import { useNavigate, useParams } from 'react-router';
import { ArrowLeft, GraduationCap, Map, Sparkles } from 'lucide-react';
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

  const direction = report?.directions.find(d => d.slug === slug);
  const showUniversityBtn = goal === 'university' && ageGroup === 'senior';
  const showInquiryBtn = ageGroup === 'middle' || ageGroup === 'senior';
  const hasRoadmap = selectedDirectionSlug === slug;

  const professions = direction?.professions ?? [];
  const skills = direction?.skills_needed ?? [];
  const subjects = direction?.subjects_to_develop ?? [];
  const firstSteps = direction?.first_steps ?? [];

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
          <p className="text-body text-primary leading-relaxed">{direction.why_it_fits}</p>
        </Card>
      </div>

      {/* 3-column info grid */}
      {(professions.length > 0 || skills.length > 0 || subjects.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {professions.length > 0 && (
            <Card className="flex flex-col h-full">
              <SectionTitle icon="👔">Профессии</SectionTitle>
              <div className="flex flex-wrap gap-2">
                {professions.map((prof, i) => (
                  <span
                    key={i}
                    className="px-3 py-1.5 rounded-pill text-caption font-semibold bg-brand-subtle text-brand"
                  >
                    {prof}
                  </span>
                ))}
              </div>
            </Card>
          )}

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

      {/* First steps — full-width card with horizontal sub-blocks */}
      {firstSteps.length > 0 && (
        <Card>
          <SectionTitle icon="🎯">Первые шаги</SectionTitle>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {firstSteps.map((step, i) => (
              <div
                key={i}
                className="flex items-start gap-3 rounded-[var(--radius)] border border-default bg-page p-4"
              >
                <div className="w-8 h-8 rounded-full bg-brand flex items-center justify-center flex-shrink-0">
                  <span className="text-small font-bold text-on-brand">{i + 1}</span>
                </div>
                <p className="text-body text-primary leading-snug">{step}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Action buttons */}
      {(hasRoadmap || showInquiryBtn || showUniversityBtn) && (
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
          {showInquiryBtn && (
            <Button
              variant={hasRoadmap ? 'ghost' : 'primary'}
              size="lg"
              className="gap-2 sm:flex-1 lg:flex-none lg:min-w-[240px]"
              onClick={() => navigate(`/results/directions/${encodeURIComponent(slug!)}/inquiry`)}
            >
              <Sparkles className="w-5 h-5" />
              Подходит ли мне это направление?
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
