import { FileText, ExternalLink } from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import type { AdmissionFacts } from '@/shared/types';

function Row({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null;
  return (
    <div className="flex flex-col">
      <span className="text-body-xs text-muted">{label}</span>
      <span className="text-body-sm text-primary">{value}</span>
    </div>
  );
}

export function AdmissionFactsCard({ facts }: { facts: AdmissionFacts }) {
  return (
    <Card className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <FileText className="h-4 w-4 text-muted" />
        <h3 className="text-body-sm font-semibold text-primary">Что нужно для поступления</h3>
      </div>

      <Row label="Экзамены" value={facts.exams.join(', ') || facts.exam_hint_from_notes || null} />
      {facts.is_foreign && <Row label="Языковой экзамен" value={facts.language_exam} />}
      <Row label="Языковой уровень" value={facts.language_level} />
      <Row
        label="Порог на грант"
        value={facts.min_ent_threshold ? `${facts.min_ent_threshold} баллов` : null}
      />
      {facts.admission_scores_2026.length > 0 && (
        <Row label="Проходные баллы 2026" value={facts.admission_scores_2026.join('; ')} />
      )}
      <Row label="Дедлайн подачи" value={facts.application_deadline} />
      <Row label="Портфолио" value={facts.portfolio_needed === true ? 'нужно' : facts.portfolio_needed === false ? 'не требуется' : null} />
      {facts.required_documents && facts.required_documents.length > 0 && (
        <Row label="Документы" value={facts.required_documents.join(', ')} />
      )}
      {facts.grants.length > 0 && (
        <Row label="Гранты и стипендии" value={facts.grants.map(g => g.name).join(', ')} />
      )}

      <p className="text-body-xs text-muted border-t border-default pt-2">
        Данные вуза могут быть неактуальны — проверь на сайте.
        {facts.last_verified && ` Обновлено: ${facts.last_verified}.`}
      </p>
      {facts.source_url && (
        <a
          href={facts.source_url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 text-body-xs text-brand hover:underline"
        >
          Страница приёма <ExternalLink className="h-3 w-3" />
        </a>
      )}
    </Card>
  );
}
