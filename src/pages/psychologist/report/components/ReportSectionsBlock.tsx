import { AdminEmpty } from '@/shared/ui/admin/AdminStates';
import type { ArtifactItem, PsychAiAnalysis, PsychologistTestResultsResponse } from '@/shared/types';
import { AiAnalysisSection } from './AiAnalysisSection';

import { ArtifactsSection } from './ArtifactsSection';
import { PsychoEmotionalSection } from './PsychoEmotionalSection';
import { ProfessionalTypesSection } from './ProfessionalTypesSection';
import { TeamRoleSection } from './TeamRoleSection';
import { TemperamentSection } from './TemperamentSection';
import { IntelligenceSection } from './IntelligenceSection';
import { AspirationLevelSection } from './AspirationLevelSection';
import { EmpathyConfidenceSection } from './EmpathyConfidenceSection';

function GroupHeading({ children }: { children: string }) {
  return <h2 className="font-sans text-display-sm font-bold text-primary mb-3.5 tracking-tight">{children}</h2>;
}

/**
 * PRO-338 Ф4.1, revised — pure psychodiagnostics: only the 7 test results
 * (`testResults`, GET .../test-results) plus the onboarding artifacts and
 * the AI synthesis over them. No narrative report content here anymore
 * (summary/characters/interest map/careers/strength cards) — that content
 * lives exclusively in the "Отчёт для ученика" tab
 * (`PsychologistStudentReportEditor`), where it's actually editable; having
 * it read-only here too just meant every field the psychologist cares about
 * editing showed up twice with no indication which copy was authoritative.
 *
 * **Группировка секций.** Порядок — от контекста об ученике к самим тестам,
 * далее к синтезу:
 *   1. **Артефакты онбординга** — что ученик сам о себе отметил, контекст
 *      для чтения тестов ниже.
 *   2. **Личность** — Айзенк (темперамент), МЦВ (психоэмоц. тест, PRO-282).
 *   3. **Интересы и способности** — ДДО, Elers, Бойко+Кондаш.
 *   4. **Интеллект** — АСТУР, отдельная группа (линейный график + СПН +
 *      профиль обучения + лабильность).
 *   5. **Командная роль** — Belbin, опциональный "расширенный" блок
 *      (18+/корпоративный источник), не часть стандартной диагностики.
 *   6. **ИИ-анализ** — последним: психолог сначала видит сырые результаты
 *      тестов, потом — синтез и рекомендацию модели поверх них.
 */
export function ReportSectionsBlock({
  testResults,
  artifacts,
  aiAnalysis,
  onRegenerateAiAnalysis,
  regeneratingAiAnalysis,
  regenerateAiAnalysisError,
}: {
  testResults: PsychologistTestResultsResponse;
  artifacts: ArtifactItem[];
  aiAnalysis: PsychAiAnalysis | null;
  onRegenerateAiAnalysis: () => void;
  regeneratingAiAnalysis: boolean;
  regenerateAiAnalysisError: boolean;
}) {
  return (
    <div className="flex flex-col gap-8">
      <ArtifactsSection artifacts={artifacts} />

      <div>
        <GroupHeading>Личность</GroupHeading>
        <div className="flex flex-col gap-5">
          <TemperamentSection section={testResults.temperament} />
          <PsychoEmotionalSection section={testResults.psychoemotional} />
        </div>
      </div>

      <div>
        <GroupHeading>Интересы и способности</GroupHeading>
        <div className="flex flex-col gap-5">
          <ProfessionalTypesSection section={testResults.professional_types} />
          <AspirationLevelSection section={testResults.aspiration_level} />
          <EmpathyConfidenceSection section={testResults.empathy_confidence} />
        </div>
      </div>

      <div>
        <GroupHeading>Интеллект</GroupHeading>
        {testResults.intelligence ? (
          <IntelligenceSection section={testResults.intelligence} />
        ) : (
          <AdminEmpty title="Данных пока нет" hint="Появится после завершения учеником теста характеристик интеллекта (АСТУР)." />
        )}
      </div>

      <div>
        <GroupHeading>Командная роль</GroupHeading>
        {testResults.team_role ? (
          <TeamRoleSection section={testResults.team_role} />
        ) : (
          <AdminEmpty title="Данных пока нет" hint="Появится после завершения учеником теста «Роли в команде» (Belbin)." />
        )}
      </div>

      <AiAnalysisSection
        analysis={aiAnalysis}
        onRegenerate={onRegenerateAiAnalysis}
        regenerating={regeneratingAiAnalysis}
        regenerateError={regenerateAiAnalysisError}
      />
    </div>
  );
}
