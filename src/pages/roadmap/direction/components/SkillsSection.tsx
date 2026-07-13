interface SkillsSectionProps {
  skills: string[];
  subjects: string[];
}

export function SkillsSection({ skills, subjects }: SkillsSectionProps) {
  if (skills.length === 0 && subjects.length === 0) return null;

  return (
    <div className="flex flex-col gap-6">
      {skills.length > 0 && (
        <div>
          <h2 className="text-label font-bold text-primary flex items-center gap-2 mb-3">
            <span aria-hidden="true">🛠️</span>
            Навыки, которые построишь
          </h2>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill, i) => (
              <span
                key={i}
                className="px-3 py-1 rounded-pill text-caption font-semibold bg-brand-subtle text-brand border border-default"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {subjects.length > 0 && (
        <div>
          <h2 className="text-label font-bold text-primary flex items-center gap-2 mb-3">
            <span aria-hidden="true">📚</span>
            Предметы в фокусе
          </h2>
          <div className="flex flex-wrap gap-2">
            {subjects.map((subject, i) => (
              <span
                key={i}
                className="px-3 py-1 rounded-pill text-caption text-secondary bg-surface border border-default"
              >
                {subject}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
