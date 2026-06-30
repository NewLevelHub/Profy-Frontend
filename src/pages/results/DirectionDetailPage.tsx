import { useNavigate, useParams } from 'react-router';
import { ArrowLeft, GraduationCap } from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { Badge } from '@/shared/ui/Badge';
import { Button } from '@/shared/ui/Button';
import { useResultStore } from '@/shared/store/result';
import { useAssessmentStore } from '@/shared/store/assessment';
import { useProfileStore } from '@/shared/store/profile';

export default function DirectionDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const report = useResultStore(s => s.report);
  const goal = useAssessmentStore(s => s.goal);
  const ageGroup = useProfileStore(s => s.profile?.age_group);

  const direction = report?.directions.find(d => d.slug === slug);
  const showUniversityBtn = goal === 'university' && ageGroup === 'senior';

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
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      {/* Nav */}
      <div className="flex items-center justify-between mb-6">
        <button
          className="flex items-center gap-1.5 text-brand font-semibold text-label hover:opacity-70 transition-opacity"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="w-4 h-4" />
          Назад
        </button>
        <Badge variant="brand">{`${direction.match_score}% совпадение`}</Badge>
      </div>

      <h1 className="text-h1 font-extrabold text-primary mb-8">{direction.name}</h1>

      <div className="flex flex-col gap-6">
        {direction.description && direction.description.length > 0 && (
          <p className="text-body text-secondary leading-relaxed">{direction.description}</p>
        )}

        {/* Why it fits */}
        <Card className="bg-brand-subtle flex flex-col gap-2">
          <p className="text-label font-bold text-primary flex items-center gap-2">
            <span aria-hidden="true">✨</span>
            Почему тебе подходит
          </p>
          <p className="text-body text-primary leading-relaxed">{direction.why_it_fits}</p>
        </Card>

        {/* Professions */}
        {(direction.professions ?? []).length > 0 && (
          <div>
            <h2 className="text-label font-bold text-primary flex items-center gap-2 mb-3">
              <span aria-hidden="true">👔</span>
              Профессии
            </h2>
            <div className="flex flex-wrap gap-2">
              {direction.professions.map((prof, i) => (
                <span
                  key={i}
                  className="px-3 py-1 rounded-pill text-caption font-semibold bg-brand-subtle text-brand border border-default"
                >
                  {prof}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Skills needed */}
        {(direction.skills_needed ?? []).length > 0 && (
          <div>
            <h2 className="text-label font-bold text-primary flex items-center gap-2 mb-3">
              <span aria-hidden="true">🛠️</span>
              Навыки для развития
            </h2>
            <ul className="flex flex-col gap-2">
              {direction.skills_needed.map((skill, i) => (
                <li key={i} className="flex items-start gap-2 text-body text-secondary">
                  <span className="text-brand font-bold mt-0.5 flex-shrink-0">•</span>
                  {skill}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Subjects to develop */}
        {(direction.subjects_to_develop ?? []).length > 0 && (
          <div>
            <h2 className="text-label font-bold text-primary flex items-center gap-2 mb-3">
              <span aria-hidden="true">📚</span>
              Предметы для изучения
            </h2>
            <div className="flex flex-wrap gap-2">
              {direction.subjects_to_develop.map((subj, i) => (
                <span
                  key={i}
                  className="px-3 py-1 rounded-pill text-caption text-secondary bg-surface border border-default"
                >
                  {subj}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* First steps */}
        {(direction.first_steps ?? []).length > 0 && (
          <div>
            <h2 className="text-label font-bold text-primary flex items-center gap-2 mb-3">
              <span aria-hidden="true">🎯</span>
              Первые шаги
            </h2>
            <div className="flex flex-col gap-2">
              {direction.first_steps.map((step, i) => (
                <Card key={i} className="flex items-start gap-3 !p-4">
                  <div className="w-7 h-7 rounded-full bg-brand flex items-center justify-center flex-shrink-0">
                    <span className="text-small font-bold text-on-brand">{i + 1}</span>
                  </div>
                  <p className="text-body text-primary">{step}</p>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          {showUniversityBtn && (
            <Button
              variant="ghost"
              size="lg"
              className="flex-1 gap-2"
              onClick={() => navigate(`/results/directions/${encodeURIComponent(slug!)}/universities`)}
            >
              <GraduationCap className="w-5 h-5" />
              Найти университеты
            </Button>
          )}
          <Button
            variant="primary"
            size="lg"
            className="flex-1"
            onClick={() => navigate('/results')}
          >
            Назад к результатам
          </Button>
        </div>
      </div>
    </div>
  );
}
