import { ExternalLink } from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import type { UniversityRequirement } from '@/shared/types';

interface UniversityRequirementsCardProps {
  requirements: UniversityRequirement[];
}

const DASH = '—';

function Field({ label, value }: { label: string; value?: string | null }) {
  if (!value || value === DASH) return null;
  return (
    <div>
      <p className="text-caption font-semibold text-muted uppercase tracking-wide mb-1">{label}</p>
      <p className="text-body text-secondary">{value}</p>
    </div>
  );
}

function ListField({ label, items, caveat }: { label: string; items?: string[] | null; caveat?: string }) {
  if (!items || items.length === 0) return null;
  return (
    <div>
      <p className="text-caption font-semibold text-muted uppercase tracking-wide mb-1">{label}</p>
      {caveat && <p className="text-caption text-muted mb-1.5">{caveat}</p>}
      <ul className="flex flex-col gap-1">
        {items.map((item, i) => (
          <li key={i} className="text-body text-secondary">{item}</li>
        ))}
      </ul>
    </div>
  );
}

/** Real, backend-verified facts for the exact program this plan was built for
 * (сценарий C, generate-by-program). Empty for every other goal/entry point —
 * the card simply doesn't render then.
 *
 * Every field always renders, with a "—" fallback for missing data — programs
 * come from two different seed batches with very different completeness, and
 * conditionally hiding rows made cards for sparser programs look broken next
 * to cards for richer ones. Consistency comes from the shape, not from only
 * showing what happens to be filled in. The exception: fields that are
 * conceptually Kazakhstan-only (ЕНТ threshold, 2026-2027 grant scores) are
 * hidden outright for foreign universities — those aren't "missing data",
 * the question just doesn't apply there. */
export function UniversityRequirementsCard({ requirements }: UniversityRequirementsCardProps) {
  if (requirements.length === 0) return null;
  const req = requirements[0];
  const isKazakhstan = req.country === 'Казахстан';

  const portfolio =
    req.portfolio_needed === null ? DASH : req.portfolio_needed ? 'Нужно' : 'Не требуется';

  // exam_hint_from_notes is an inferred guess (keyword match against general
  // university notes), never a confirmed per-program fact — label it as such
  // rather than presenting it identically to real `exams` data.
  const examsValue = req.exams.length > 0
    ? req.exams.join(', ')
    : req.exam_hint_from_notes
      ? `${req.exam_hint_from_notes} (по общим данным вуза)`
      : DASH;

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
        {req.website && (
          <a
            href={req.website}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-caption font-semibold text-brand hover:underline mt-1"
          >
            <ExternalLink className="w-3 h-3" />
            Сайт вуза
          </a>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field label="Экзамены" value={examsValue} />
        <Field label="Язык обучения" value={req.program_language} />
        <Field label="Срок обучения" value={req.duration_years ? `${req.duration_years} года` : null} />
        <Field label="Требуемый уровень английского" value={req.language_level} />
        <Field label="Двойной диплом" value={req.has_dual_degree === true ? 'Есть' : req.has_dual_degree === false ? 'Нет' : null} />
        <Field label="Дедлайн подачи" value={req.application_deadline} />
        <Field label="Портфолио" value={portfolio} />
        {isKazakhstan && (
          <>
            <Field label="Мин. балл ЕНТ (Платное)" value={req.min_ent_paid?.toString()} />
            <Field label="Допуск к конкурсу на грант (ЕНТ)" value={req.min_ent_threshold?.toString()} />
            <Field label="Количество грантов" value={req.grants_allocated_count?.toString()} />
          </>
        )}
        <Field label="Минимальный GPA" value={req.min_gpa?.toString()} />
        <Field label="Минимальный балл SAT" value={req.min_sat?.toString()} />
        <Field
          label="Документы"
          value={req.required_documents && req.required_documents.length > 0
            ? req.required_documents.join(', ')
            : null}
        />
      </div>

      <ListField label="Внеклассная деятельность" items={req.extracurriculars} />

      {isKazakhstan && (
        <ListField
          label="Проходные баллы на грант 2026–2027"
          items={req.grant_scores ? Object.entries(req.grant_scores).map(([k, v]) => `${k}: ${v}`) : req.admission_scores_2026}
        />
      )}

      {req.admissions_contacts && Object.keys(req.admissions_contacts).length > 0 && (
        <ListField
          label="Контакты приемной комиссии"
          items={Object.entries(req.admissions_contacts).map(([k, v]) => `${k === 'phone' ? '📞' : k === 'email' ? '✉️' : k === 'instagram' ? '📷' : ''} ${v}`.trim())}
        />
      )}

      <ListField
        label="Общие заметки вуза по разным направлениям"
        items={req.notes}
        caveat="Не все строки обязательно относятся к этой программе — сверь со своим направлением."
      />

      <ListField
        label="Гранты и стипендии"
        items={req.grants.map(g => (g.amount ? `${g.name} — ${g.amount}` : g.name))}
      />

      <p className="text-caption text-muted">
        Данные могли измениться — уточняй на сайте вуза перед подачей.
      </p>
    </Card>
  );
}
