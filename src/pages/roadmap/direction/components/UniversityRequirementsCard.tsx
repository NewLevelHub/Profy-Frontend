import { Card } from '@/shared/ui/Card';
import type { UniversityRequirement } from '@/shared/types';

interface UniversityRequirementsCardProps {
  requirements: UniversityRequirement[];
}

/** Real, backend-verified facts for the exact program this plan was built for
 * (сценарий C, generate-by-program). Empty for every other goal/entry point —
 * the card simply doesn't render then. */
export function UniversityRequirementsCard({ requirements }: UniversityRequirementsCardProps) {
  if (requirements.length === 0) return null;
  const req = requirements[0];

  return (
    <Card className="flex flex-col gap-4">
      <div>
        <h2 className="text-label font-bold text-primary flex items-center gap-2">
          <span aria-hidden="true">📋</span>
          Требования программы
        </h2>
        <p className="text-caption text-muted mt-0.5">
          {req.program_name} · {req.university_name}, {req.city}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {req.exams.length > 0 && (
          <div>
            <p className="text-caption font-semibold text-muted uppercase tracking-wide mb-1">Экзамены</p>
            <p className="text-body text-secondary">{req.exams.join(', ')}</p>
          </div>
        )}
        {req.language_level && (
          <div>
            <p className="text-caption font-semibold text-muted uppercase tracking-wide mb-1">Язык</p>
            <p className="text-body text-secondary">{req.language_level}</p>
          </div>
        )}
        {req.application_deadline && (
          <div>
            <p className="text-caption font-semibold text-muted uppercase tracking-wide mb-1">Дедлайн подачи</p>
            <p className="text-body text-secondary">{req.application_deadline}</p>
          </div>
        )}
        {req.portfolio_needed !== null && (
          <div>
            <p className="text-caption font-semibold text-muted uppercase tracking-wide mb-1">Портфолио</p>
            <p className="text-body text-secondary">{req.portfolio_needed ? 'Нужно' : 'Не требуется'}</p>
          </div>
        )}
        {req.min_ent_threshold !== null && (
          <div>
            <p className="text-caption font-semibold text-muted uppercase tracking-wide mb-1">Минимальный порог ЕНТ</p>
            <p className="text-body text-secondary">{req.min_ent_threshold}</p>
          </div>
        )}
      </div>

      {req.admission_scores_2026.length > 0 && (
        <div>
          <p className="text-caption font-semibold text-muted uppercase tracking-wide mb-1">
            Проходные баллы на грант 2026–2027
          </p>
          <ul className="flex flex-col gap-1">
            {req.admission_scores_2026.map((line, i) => (
              <li key={i} className="text-body text-secondary">{line}</li>
            ))}
          </ul>
        </div>
      )}

      {req.notes.length > 0 && (
        <div>
          <p className="text-caption font-semibold text-muted uppercase tracking-wide mb-1">На заметку</p>
          <ul className="flex flex-col gap-1">
            {req.notes.map((note, i) => (
              <li key={i} className="text-body text-secondary">{note}</li>
            ))}
          </ul>
        </div>
      )}

      {req.required_documents && req.required_documents.length > 0 && (
        <div>
          <p className="text-caption font-semibold text-muted uppercase tracking-wide mb-1">Документы</p>
          <p className="text-body text-secondary">{req.required_documents.join(', ')}</p>
        </div>
      )}

      {req.grants.length > 0 && (
        <div>
          <p className="text-caption font-semibold text-muted uppercase tracking-wide mb-1">Гранты и стипендии</p>
          <ul className="flex flex-col gap-1">
            {req.grants.map((grant, i) => (
              <li key={i} className="text-body text-secondary">
                {grant.name}
                {grant.amount ? ` — ${grant.amount}` : ''}
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="text-caption text-muted">
        Данные могли измениться — уточняй на сайте вуза перед подачей.
      </p>
    </Card>
  );
}
