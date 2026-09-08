import { useTranslation } from 'react-i18next';
import {
  RIASEC_LABELS,
  RIASEC_DESCRIPTIONS,
  MI_LABELS,
  MI_DESCRIPTIONS,
} from '@/shared/config/constants';
import type { AgeGroup, AssessmentGoal, ProfileResponse, ResultResponse } from '@/shared/types';
import { buildHeadline, buildSecondaryNote } from '../../utils/interestHeadline';
import { LEVEL_STATUS_LABEL } from '../../components/DomainCardParts';
import { PERSONALITY_STATUS_LABEL } from '../../components/PersonalityDomainSection';
import { pickSpheres } from '../../components/scenarios/sphereContent';
import { PrintCover } from './PrintCover';
import { PrintSection } from './PrintSection';
import { PrintNoteList } from './PrintNoteList';
import { PrintLevelRows } from './PrintLevelRows';
import { PrintCareers, PrintSpheres } from './PrintNextSteps';

interface PrintDocumentProps {
  report: ResultResponse;
  profile: ProfileResponse | null;
  ageGroup: AgeGroup | undefined;
  /** The goal chosen before the assessment started — same input GoalBranchSection uses. */
  goal: AssessmentGoal | null;
  /** Instrument branch (mi vs riasec), NOT age — contract §3. */
  isJunior: boolean;
}

/**
 * The printable report, section for section in the same order as
 * ResultsPage: резюме → интересы → сильные стороны → личностный профиль →
 * стиль мышления/мотивация → что попробовать → итог → что делать дальше.
 * A student who exports this should be able to lay it next to the screen
 * and find the same things in the same order.
 *
 * Not carried over: the mascot, the entrance animations, the feedback form,
 * and the direction/university links — screen affordances with nothing to
 * do on paper.
 */
export function PrintDocument({ report, profile, ageGroup, goal, isJunior }: PrintDocumentProps) {
  const { t } = useTranslation('results');
  const labels = isJunior ? MI_LABELS : RIASEC_LABELS;
  const descriptions = isJunior ? MI_DESCRIPTIONS : RIASEC_DESCRIPTIONS;
  const headline = buildHeadline(report.interest_map, labels);
  const secondaryNote = buildSecondaryNote(report.interest_map, labels);

  // Same branch as GoalBranchSection — and note it keys on AGE GROUP, not on
  // `isJunior` above: the interest section branches on the instrument
  // (contract §3), the "что дальше" scenario branches on age + goal. The two
  // agree in practice but are different questions, so they read different fields.
  const isJuniorAge = ageGroup === 'junior';
  const showSpheres = isJuniorAge || (goal ?? 'explore') === 'explore';

  return (
    <article className="print-sheet space-y-6">
      <PrintCover
        profile={profile}
        subtitle={isJunior ? t('page.subtitleJunior') : t('page.subtitleAdult')}
        createdAt={report.created_at}
      />

      <PrintSection kicker={t('print.kicker.summary')}>
        <p className="text-body-sm leading-relaxed" style={{ color: 'var(--ink)' }}>
          {report.summary}
        </p>
        <p className="text-caption text-secondary border-t border-[var(--hairline)] pt-2 mt-1">
          {report.disclaimer}
        </p>
      </PrintSection>

      <PrintSection
        kicker={isJunior ? t('print.kicker.abilitiesJunior') : t('print.kicker.careerInterests')}
        title={headline || undefined}
      >
        {secondaryNote && (
          <p className="text-caption" style={{ color: 'var(--ink)' }}>
            {t('print.alsoNotable', { note: secondaryNote })}
          </p>
        )}
        <PrintLevelRows
          rows={report.interest_map.map((item) => ({
            id: item.code,
            title: item.sphere,
            status: t(LEVEL_STATUS_LABEL[item.level]),
            description: descriptions[item.code],
            level: item.level,
          }))}
        />
        {report.interest_map_note && (
          <p className="text-caption leading-snug" style={{ color: 'var(--ink)' }}>
            {report.interest_map_note}
          </p>
        )}
      </PrintSection>

      <PrintSection kicker={t('print.kicker.strengths')}>
        <PrintNoteList items={report.strength_cards} emptyText={t('print.emptyMore')} />
      </PrintSection>

      <PrintSection kicker={t('print.kicker.personality')}>
        {report.personality_note && (
          <p className="text-body-sm leading-relaxed" style={{ color: 'var(--ink)' }}>
            {report.personality_note}
          </p>
        )}
        <PrintLevelRows
          rows={report.personality_notes.map((note) => ({
            id: note.trait,
            title: note.label,
            status: t(PERSONALITY_STATUS_LABEL[note.level]),
            description: note.description,
            level: note.level,
          }))}
        />
      </PrintSection>

      <PrintSection kicker={t('print.kicker.thinkingStyle')}>
        <PrintNoteList
          items={report.thinking_style_notes}
          emptyText={t('print.emptyMore')}
        />
      </PrintSection>

      <PrintSection kicker={t('print.kicker.motivation')}>
        {report.motivation_highlights.length === 0 ? (
          <p className="text-caption text-muted">{t('print.emptyMore')}</p>
        ) : (
          <ul className="space-y-1">
            {report.motivation_highlights.map((text, i) => (
              <li
                key={i}
                className="text-body-sm font-semibold text-[color:var(--midnight)] leading-snug"
              >
                {text}
              </li>
            ))}
          </ul>
        )}
      </PrintSection>

      {report.exploration_activities.length > 0 && (
        <PrintSection kicker={t('print.kicker.tryThis')}>
          <ul className="space-y-1">
            {report.exploration_activities.map((activity, i) => (
              <li
                key={i}
                className="text-body-sm font-semibold text-[color:var(--midnight)] leading-snug"
              >
                {activity}
              </li>
            ))}
          </ul>
          {report.exploration_note && (
            <p className="text-caption text-secondary leading-snug mt-1">{report.exploration_note}</p>
          )}
        </PrintSection>
      )}

      {report.final_analysis && (
        <PrintSection kicker={t('print.kicker.conclusion')}>
          <p className="text-body-sm leading-relaxed" style={{ color: 'var(--ink)' }}>
            {report.final_analysis}
          </p>
        </PrintSection>
      )}

      {/* No trailing footer block here on purpose — a short one-line block
          this close to the end of the document has nowhere to shrink into:
          if it doesn't fit what's left of the last page it drags a whole
          near-empty extra page behind it. The "not a diagnosis" message
          this used to repeat is already said once, up top, as
          `report.disclaimer` — repeating it isn't worth a wasted page. */}
      {showSpheres ? (
        <PrintSpheres spheres={pickSpheres(report.interest_map, t)} />
      ) : (
        <PrintCareers careers={report.careers} />
      )}
    </article>
  );
}
