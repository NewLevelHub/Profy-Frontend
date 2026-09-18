import { cn } from '@/shared/lib/cn';
import { AdminCard } from '@/shared/ui/admin/AdminSectionHeading';
import { AdminBadge } from '@/shared/ui/admin/AdminBadge';
import { AdminEmpty } from '@/shared/ui/admin/AdminStates';
import { ADMIN_TEXT } from '@/shared/ui/admin/density';
import type { PsychAiAnalysis } from '@/shared/types';

// Mirrors app/services/psych_ai_analysis_context.py's BLOCK_LABELS exactly —
// same block keys, same Russian labels, kept in sync by hand (small, fixed
// set of instruments, not worth round-tripping through the API just for a
// label string).
const BLOCK_LABELS: Record<string, string> = {
  interests: 'Карта интересов',
  personality: 'Личность (Big Five)',
  thinking_style: 'Стиль мышления',
  motivation: 'Мотивация',
  validity: 'Достоверность протокола',
  psychoemotional: 'Психоэмоциональное состояние (МЦВ)',
  professional_types: 'ДДО (интересы и способности)',
  temperament: 'Темперамент (Айзенк)',
  aspiration_level: 'Мотивация к успеху (Элерс)',
  empathy_confidence: 'Эмпатия и соц. уверенность',
  team_role: 'Командная роль (Белбин)',
  intelligence: 'Интеллект (АСТУР)',
};

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
  return (
    <AdminCard
      title="ИИ-анализ"
      description="Черновая интерпретация для специалиста — не заменяет клиническое заключение"
      aside={
        <button
          type="button"
          onClick={onRegenerate}
          disabled={regenerating}
          className="text-caption font-semibold text-brand hover:opacity-70 disabled:opacity-50 transition-opacity bg-transparent border-none cursor-pointer p-0"
        >
          {regenerating ? 'Обновление…' : '🔄 Обновить анализ'}
        </button>
      }
    >
      {regenerateError && (
        <p className={cn(ADMIN_TEXT, 'text-danger m-0 mb-3')}>Не удалось обновить анализ — попробуйте ещё раз.</p>
      )}

      {!analysis && !regenerating && (
        <AdminEmpty
          title="Анализ пока недоступен"
          hint="ИИ-анализ мог быть отключён или ещё не сформирован — попробуйте «Обновить анализ»."
        />
      )}

      {analysis && (
        <div className="flex flex-col gap-4">
          <ul className="m-0 p-0 list-none flex flex-col gap-3">
            {analysis.block_analyses.map((item) => (
              <li key={item.block}>
                <p className={cn(ADMIN_TEXT, 'font-semibold text-primary m-0')}>
                  {BLOCK_LABELS[item.block] ?? item.block}
                </p>
                <p className={cn(ADMIN_TEXT, 'text-muted m-0 mt-0.5')}>{item.text}</p>
              </li>
            ))}
          </ul>

          <div className="pt-3 border-t border-default">
            <p className={cn(ADMIN_TEXT, 'font-semibold text-primary m-0 mb-1')}>Итог</p>
            <p className={cn(ADMIN_TEXT, 'text-primary m-0 whitespace-pre-wrap')}>{analysis.final_summary}</p>
          </div>

          {analysis.recommended_profession && (
            <div className="pt-3 border-t border-default">
              <div className="flex items-center gap-2 mb-1">
                <p className={cn(ADMIN_TEXT, 'font-semibold text-primary m-0')}>Рекомендуемая профессия</p>
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
