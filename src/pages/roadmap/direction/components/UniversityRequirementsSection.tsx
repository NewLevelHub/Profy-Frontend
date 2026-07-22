import { Card } from '@/shared/ui/Card';
import type { UniversityRequirement } from '@/shared/types';

interface UniversityRequirementsSectionProps {
  requirements: UniversityRequirement[];
}

/** Real admission facts per program — backend-populated, never touched by
 * the LLM (see roadmap_builder._university_requirements_for). Plain data
 * display, no personalization framing needed since it's purely factual. */
export function UniversityRequirementsSection({ requirements }: UniversityRequirementsSectionProps) {
  if (requirements.length === 0) return null;

  return (
    <Card className="flex flex-col gap-5">
      <h2 className="text-label font-bold text-primary flex items-center gap-2">
        <span aria-hidden="true">🎓</span>
        Что нужно для поступления
      </h2>

      <div className="flex flex-col gap-4">
        {requirements.map((req, i) => (
          <div
            key={i}
            className="flex flex-col gap-2 pb-4 border-b border-default last:border-0 last:pb-0"
          >
            <div className="flex flex-col gap-0.5">
              <p className="text-body font-bold text-primary">{req.program_name}</p>
              <p className="text-caption text-muted">
                {req.university_name} · {req.city}
              </p>
            </div>

            {req.exams.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {req.exams.map((exam, j) => (
                  <span
                    key={j}
                    className="px-2.5 py-0.5 rounded-pill text-caption font-semibold bg-brand-subtle text-brand border border-default"
                  >
                    {exam}
                  </span>
                ))}
              </div>
            )}

            {req.admission_summary && (
              <p className="text-body text-secondary leading-relaxed">{req.admission_summary}</p>
            )}

            {req.admission_requirements.length > 0 && (
              <ul className="flex flex-col gap-1.5 mt-1">
                {req.admission_requirements.map((item, j) => (
                  <li key={j} className="flex items-start gap-2 text-caption text-secondary">
                    <span className="text-brand font-bold mt-0.5 flex-shrink-0">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}
