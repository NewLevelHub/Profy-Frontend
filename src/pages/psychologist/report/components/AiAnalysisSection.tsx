import { useTranslation } from 'react-i18next';
import { cn } from '@/shared/lib/cn';
import { AdminCard } from '@/shared/ui/admin/AdminSectionHeading';
import { AdminBadge } from '@/shared/ui/admin/AdminBadge';
import { AdminEmpty } from '@/shared/ui/admin/AdminStates';
import { ADMIN_TEXT } from '@/shared/ui/admin/density';
import type { PsychAiAnalysis } from '@/shared/types';

// Same block keys as app/services/psych_ai_analysis_context.py's BLOCK_LABELS
// (kept in sync by hand — small, fixed set of instruments); the wording lives
// in the catalog under `ai.block.*`.
const BLOCKS = new Set([
  'interests',
  'personality',
  'thinking_style',
  'motivation',
  'validity',
  'psychoemotional',
  'professional_types',
  'temperament',
  'aspiration_level',
  'empathy_confidence',
  'team_role',
  'intelligence',
]);

/**
 * Specialist-only AI synthesis: ~2 sentences per raw-data block, a final
 * 5-7 sentence summary, and one profession picked from the student's own
 * `report.careers` (never invented — enforced server-side). Lazily
 * generated on first report view; `analysis === null` covers three cases
 * the psychologist doesn't need to tell apart (LLM disabled, generation
 * failed, nothing to analyze yet) — same "not available" empty state
 * either way, with a manual retry via "Обновить анализ".
 */
export function AiAnalysisSection({
  analysis,
  onRegenerate,
  regenerating,
  regenerateError,
}: {
  analysis: PsychAiAnalysis | null;
  onRegenerate: () => void;
  regenerating: boolean;
  regenerateError: boolean;
}) {
  const { t } = useTranslation('psychologist');
  return (
    <AdminCard
      title={t('ai.title')}
      description={t('ai.description')}
      aside={
        <button
          type="button"
          onClick={onRegenerate}
          disabled={regenerating}
          className="text-caption font-semibold text-brand hover:opacity-70 disabled:opacity-50 transition-opacity bg-transparent border-none cursor-pointer p-0"
        >
          {regenerating ? t('ai.refreshing') : t('ai.refresh')}
        </button>
      }
    >
      {regenerateError && (
        <p className={cn(ADMIN_TEXT, 'text-danger m-0 mb-3')}>{t('ai.refreshFailed')}</p>
      )}

      {!analysis && !regenerating && (
        <AdminEmpty
          title={t('ai.unavailableTitle')}
          hint={t('ai.unavailableHint')}
        />
      )}

      {analysis && (
        <div className="flex flex-col gap-4">
          <ul className="m-0 p-0 list-none flex flex-col gap-3">
            {analysis.block_analyses.map((item) => (
              <li key={item.block}>
                <p className={cn(ADMIN_TEXT, 'font-semibold text-primary m-0')}>
                  {BLOCKS.has(item.block) ? t(`ai.block.${item.block}`) : item.block}
                </p>
                <p className={cn(ADMIN_TEXT, 'text-muted m-0 mt-0.5')}>{item.text}</p>
              </li>
            ))}
          </ul>

          <div className="pt-3 border-t border-default">
            <p className={cn(ADMIN_TEXT, 'font-semibold text-primary m-0 mb-1')}>{t('ai.summary')}</p>
            <p className={cn(ADMIN_TEXT, 'text-primary m-0 whitespace-pre-wrap')}>{analysis.final_summary}</p>
          </div>

          {analysis.recommended_profession && (
            <div className="pt-3 border-t border-default">
              <div className="flex items-center gap-2 mb-1">
                <p className={cn(ADMIN_TEXT, 'font-semibold text-primary m-0')}>{t('ai.profession')}</p>
                <AdminBadge tone="brand">{analysis.recommended_profession.name}</AdminBadge>
              </div>
              <p className={cn(ADMIN_TEXT, 'text-muted m-0')}>{analysis.recommended_profession.reasoning}</p>
            </div>
          )}
        </div>
      )}
    </AdminCard>
  );
}
