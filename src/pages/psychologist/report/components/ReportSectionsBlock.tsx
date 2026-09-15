import { cn } from '@/shared/lib/cn';
import { AdminCard } from '@/shared/ui/admin/AdminSectionHeading';
import { AdminBadge } from '@/shared/ui/admin/AdminBadge';
import { AdminEmpty } from '@/shared/ui/admin/AdminStates';
import { ADMIN_TEXT } from '@/shared/ui/admin/density';
import type { NewTestsSections, ResultResponse } from '@/shared/types';
import { ProfessionalTypesSection } from './ProfessionalTypesSection';
import { TeamRoleSection } from './TeamRoleSection';
import { TemperamentSection } from './TemperamentSection';
import { IntelligenceSection } from './IntelligenceSection';
import { AspirationLevelSection } from './AspirationLevelSection';
import { EmpathyConfidenceSection } from './EmpathyConfidenceSection';

/**
 * PRO-338 Ф0.4 — assembles the FULL specialist report: the existing
 * student-shape report (`report`, same contract /result uses) plus the 6
 * new-tests sections (`newTests`). By analogy with PRO-282's
 * SpecialistSectionsBlock, but scoped to the whole report rather than just
 * an add-on block — reused here since PRO-282's own component isn't merged
 * into this branch yet (see profi-pro-338-fase0-fundament memory).
 *
 * Each of the 6 leaf components already no-ops (`return null`) when its own
 * section is `null` — this assembler never needs its own per-section
 * null-check, only the "all 6 are empty" empty-state below.
 */
export function ReportSectionsBlock({
  report,
  newTests,
}: {
  report: ResultResponse;
  newTests: NewTestsSections;
}) {
  const hasAnyNewTest = Object.values(newTests).some((section) => section !== null);

  return (
    <div className="flex flex-col gap-5">
      <AdminCard title="Итоговое саммари">
        <p className={cn(ADMIN_TEXT, 'text-primary m-0 whitespace-pre-wrap')}>{report.summary}</p>
        {report.final_analysis && (
          <p className={cn(ADMIN_TEXT, 'text-muted m-0 mt-3 whitespace-pre-wrap')}>{report.final_analysis}</p>
        )}
      </AdminCard>

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

      <div>
        <h2 className={cn(ADMIN_TEXT, 'font-semibold text-primary mb-3')}>Дополнительные тесты</h2>
        {hasAnyNewTest ? (
          <div className="flex flex-col gap-5">
            <ProfessionalTypesSection section={newTests.professional_types} />
            <TeamRoleSection section={newTests.team_role} />
            <TemperamentSection section={newTests.temperament} />
            <IntelligenceSection section={newTests.intelligence} />
            <AspirationLevelSection section={newTests.aspiration_level} />
            <EmpathyConfidenceSection section={newTests.empathy_confidence} />
          </div>
        ) : (
          <AdminEmpty
            title="Данных пока нет"
            hint="Появятся после прохождения дополнительных тестов (ДДО, Айзенк, Элерс, Бойко+Кондаш) и, отдельно, Belbin/АСТУР."
          />
        )}
      </div>
    </div>
  );
}
