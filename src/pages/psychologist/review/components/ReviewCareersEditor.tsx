import { Trash2 } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { AdminBadge } from '@/shared/ui/admin/AdminBadge';
import { ADMIN_BUTTON, ADMIN_META, ADMIN_NUM, ADMIN_TEXT, ADMIN_TEXTAREA } from '@/shared/ui/admin/density';
import type { PsychologistReviewCareer } from '@/shared/types';

interface ReviewCareersEditorProps {
  careers: PsychologistReviewCareer[];
  onChange: (careers: PsychologistReviewCareer[]) => void;
  disabled?: boolean;
}

/**
 * Matched directions, in the order the student will see them. The score and
 * Holland code are computed — only the description can be rewritten, and a
 * direction that doesn't fit can be removed.
 */
export function ReviewCareersEditor({ careers, onChange, disabled }: ReviewCareersEditorProps) {
  if (careers.length === 0) {
    return <p className={cn(ADMIN_META, 'm-0')}>Направления не подбирались</p>;
  }

  return (
    <ol className="divide-y divide-[var(--border)] m-0 p-0 list-none">
      {careers.map((career, index) => (
        <li key={career.slug} className="py-3 flex flex-col gap-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2 min-w-0">
              <span className={cn(ADMIN_NUM, 'text-muted')}>{index + 1}.</span>
              <span className={cn(ADMIN_TEXT, 'font-semibold text-primary')}>{career.name}</span>
              <AdminBadge tone="quiet">{career.holland_code}</AdminBadge>
              <span className={cn(ADMIN_NUM, 'text-muted')}>{career.match_score}%</span>
            </div>
            {!disabled && (
              <button
                type="button"
                className={cn(ADMIN_BUTTON, 'px-2 hover:text-danger hover:border-danger')}
                aria-label={`Убрать направление «${career.name}»`}
                onClick={() => onChange(careers.filter((_, i) => i !== index))}
              >
                <Trash2 size={13} />
              </button>
            )}
          </div>
          <textarea
            value={career.description}
            onChange={(e) =>
              onChange(careers.map((c, i) => (i === index ? { ...c, description: e.target.value } : c)))
            }
            disabled={disabled}
            rows={2}
            aria-label={`Описание направления «${career.name}»`}
            className={ADMIN_TEXTAREA}
          />
        </li>
      ))}
    </ol>
  );
}
