import { cn } from '@/shared/lib/cn';
import { AdminCard } from '@/shared/ui/admin/AdminSectionHeading';
import { AdminBadge } from '@/shared/ui/admin/AdminBadge';
import { AdminEmpty } from '@/shared/ui/admin/AdminStates';
import { ADMIN_TEXT } from '@/shared/ui/admin/density';
import type { NewTestsSections, PsychAiAnalysis, ResultResponse } from '@/shared/types';
import { AiAnalysisSection } from './AiAnalysisSection';
import { ValiditySection } from './ValiditySection';
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
 * PRO-338 Ф4.1 — the full specialist screen: the existing student-shape
 * report (`report`, same contract /result uses — now including PRO-282's
 * `validity`/`psychoemotional`, attached server-side only for a
 * psychologist/admin viewer, see report_service.psych_sections_for) plus
 * the 6 new-tests sections (`newTests`).
 *
 * **Группировка секций (решение Ф4.1, см. PR).** Порядок был оставлен на
 * усмотрение исполнителя тикетом — выбрана последовательность от
 * "насколько вообще можно доверять этим данным" к содержательным блокам,
 * от компактного к развёрнутому:
 *   1. Итоговое саммари — как и раньше, отдельно, первым.
 *   2. **Надёжность протокола** (PRO-282) — определяет, с какой
 *      осторожностью читать всё, что идёт дальше; поэтому первая
 *      содержательная группа, не последняя.
 *   3. **Личность** — характер (Big Five, всегда есть), Айзенк
 *      (темперамент), МЦВ (психоэмоц. тест, PRO-282) — три инструмента,
 *      измеряющие устойчивые/актуальные черты личности.
 *   4. **Интересы и способности** — карта интересов, направления, сильные
 *      стороны (всегда есть), ДДО, Elers, Бойко+Кондаш — профориентационный
 *      блок в широком смысле.
 *   5. **Интеллект** — АСТУР, единственная секция в своей группе, но
 *      достаточно объёмная (линейный график + СПН + профиль обучения +
 *      лабильность), чтобы не смешивать с "Личностью".
 *   6. **Командная роль** — Belbin, тоже одна секция, поставлена последней:
 *      явно опциональный, "расширенный" блок (18+/корпоративный источник),
 *      не часть стандартной диагностики школьника.
 *
 * Каждый лист-компонент уже умеет `return null` при `section === null`
 * (кроме двух всегда присутствующих карточек — саммари и характер, которые
 * не приходят пустыми у завершённого отчёта) — сборщик не дублирует эту
 * проверку, кроме двух полностью опциональных групп (4 и 6 в списке
 * пунктов, "Интеллект"/"Командная роль"), где при отсутствии данных
 * показывается объясняющий empty-state, а не пустая группа без заголовка.
 *
 * 7. **ИИ-анализ** — добавлен последним, сознательно после всех разделов с
 *    сырыми данными: психолог сначала видит факты, потом — синтез и
 *    рекомендацию модели поверх них, а не наоборот (избегаем эффекта
 *    якорения на мнении ИИ раньше собственного просмотра данных).
 */
export function ReportSectionsBlock({
  report,
  newTests,
  aiAnalysis,
  onRegenerateAiAnalysis,
  regeneratingAiAnalysis,
  regenerateAiAnalysisError,
}: {
  report: ResultResponse;
  newTests: NewTestsSections;
  aiAnalysis: PsychAiAnalysis | null;
  onRegenerateAiAnalysis: () => void;
  regeneratingAiAnalysis: boolean;
  regenerateAiAnalysisError: boolean;
}) {
  return (
    <div className="flex flex-col gap-8">
      <AdminCard title="Итоговое саммари">
        <p className="font-sans text-body-md text-primary m-0 whitespace-pre-wrap leading-relaxed">{report.summary}</p>
        {report.final_analysis && (
          <p className="font-sans text-body-sm text-secondary m-0 mt-3 whitespace-pre-wrap leading-relaxed border-t border-default/50 pt-3">{report.final_analysis}</p>
        )}
      </AdminCard>

      {report.validity && (
        <div>
          <GroupHeading>Надёжность протокола</GroupHeading>
          <ValiditySection section={report.validity} />
        </div>
      )}

      <div>
        <GroupHeading>Личность</GroupHeading>
        <div className="flex flex-col gap-5">
          <AdminCard title="Характер">
            <ul className="m-0 p-0 list-none flex flex-col gap-3">
              {report.personality_notes.map((note) => (
                <li key={note.trait}>
                  <p className={cn(ADMIN_TEXT, 'font-semibold text-primary m-0')}>{note.label}</p>
                  <p className={cn(ADMIN_TEXT, 'text-muted m-0 mt-0.5')}>{note.description}</p>
                </li>
              ))}
            </ul>
          </AdminCard>
          <TemperamentSection section={newTests.temperament} />
          <PsychoEmotionalSection section={report.psychoemotional} />
        </div>
      </div>

      <div>
        <GroupHeading>Интересы и способности</GroupHeading>
        <div className="flex flex-col gap-5">
          <AdminCard title="Карта интересов" aside={<AdminBadge tone="quiet">{report.interest_instrument}</AdminBadge>}>
            <ul className="m-0 p-0 list-none flex flex-col gap-1.5">
              {report.interest_map.map((item) => (
                <li key={item.code} className="flex items-center justify-between gap-2">
                  <span className={ADMIN_TEXT}>{item.sphere}</span>
                  <AdminBadge tone={item.level === 'high' ? 'brand' : 'quiet'}>{item.level}</AdminBadge>
                </li>
              ))}
            </ul>
          </AdminCard>

          {report.interest_instrument === 'riasec' && report.careers.length > 0 && (
            <AdminCard title="Направления" aside={<span className={ADMIN_TEXT}>{report.careers.length}</span>}>
              <ul className="m-0 p-0 list-none flex flex-col gap-2">
                {report.careers.map((career) => (
                  <li key={career.slug} className="flex items-center justify-between gap-2">
                    <span className={ADMIN_TEXT}>{career.name}</span>
                    <AdminBadge tone={career.tier === 'strong' ? 'brand' : 'quiet'}>{career.tier}</AdminBadge>
                  </li>
                ))}
              </ul>
            </AdminCard>
          )}

          {report.strength_cards.length > 0 && (
            <AdminCard title="Сильные стороны">
              <ul className="m-0 p-0 list-none flex flex-col gap-3">
                {report.strength_cards.map((card) => (
                  <li key={card.title}>
                    <p className={cn(ADMIN_TEXT, 'font-semibold text-primary m-0')}>{card.title}</p>
                    <p className={cn(ADMIN_TEXT, 'text-muted m-0 mt-0.5')}>{card.description}</p>
                  </li>
                ))}
              </ul>
            </AdminCard>
          )}

          <ProfessionalTypesSection section={newTests.professional_types} />
          <AspirationLevelSection section={newTests.aspiration_level} />
          <EmpathyConfidenceSection section={newTests.empathy_confidence} />
        </div>
      </div>

      <div>
        <GroupHeading>Интеллект</GroupHeading>
        {newTests.intelligence ? (
          <IntelligenceSection section={newTests.intelligence} />
        ) : (
          <AdminEmpty title="Данных пока нет" hint="Появится после прохождения АСТУР — назначается из кабинета психолога." />
        )}
      </div>

      <div>
        <GroupHeading>Командная роль</GroupHeading>
        {newTests.team_role ? (
          <TeamRoleSection section={newTests.team_role} />
        ) : (
          <AdminEmpty title="Данных пока нет" hint="Появится после прохождения Belbin — назначается из кабинета психолога." />
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
