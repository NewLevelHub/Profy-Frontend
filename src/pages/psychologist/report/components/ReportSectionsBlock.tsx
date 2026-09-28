import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { formatNumber } from '@/shared/i18n/format';
import { AdminCardEmbed } from '@/shared/ui/admin/AdminSectionHeading';
import { AdminEmpty } from '@/shared/ui/admin/AdminStates';
import { Mono, Text } from '@/shared/ui/typography';
import type { ArtifactItem, PsychAiAnalysis, PsychologistTestResultsResponse } from '@/shared/types';
import { StatusMark, type StatusTone } from '../../components/StatusMark';
import { AiAnalysisSection } from './AiAnalysisSection';
import { ArtifactsSection } from './ArtifactsSection';
import { AspirationLevelSection } from './AspirationLevelSection';
import { EmpathyConfidenceSection } from './EmpathyConfidenceSection';
import { IntelligenceSection } from './IntelligenceSection';
import { ProfessionalTypesSection } from './ProfessionalTypesSection';
import { PsychoEmotionalSection } from './PsychoEmotionalSection';
import { TeamRoleSection } from './TeamRoleSection';
import { TemperamentSection } from './TemperamentSection';

interface Chip {
  label: string;
  tone: StatusTone;
  hollow?: boolean;
}

interface SectionDef {
  id: string;
  title: string;
  method: string;
  chip: Chip;
  body: ReactNode;
}

/** Leading part of a role name — "Председатель (Координатор)" → "Председатель". */
function shortName(name: string): string {
  return name.split(' (')[0];
}

const ELERS_TONE: Record<string, StatusTone> = {
  low: 'dawn',
  medium: 'lake',
  moderately_high: 'pine',
  too_high: 'dawn',
};

function sectionDefs(
  t: TFunction,
  testResults: PsychologistTestResultsResponse,
  artifacts: ArtifactItem[],
  ai: { analysis: PsychAiAnalysis | null; body: ReactNode },
): SectionDef[] {
  const noData: Chip = { label: t('psychologist:tests.chip.noData'), tone: 'mute', hollow: true };
  const done: Chip = { label: t('psychologist:tests.chip.done'), tone: 'pine' };
  const { temperament, psychoemotional, professional_types, aspiration_level, empathy_confidence, intelligence, team_role } =
    testResults;

  const emptyBody = (hint: string) => <AdminEmpty title={t('psychologist:tests.noDataTitle')} hint={hint} />;

  return [
    {
      id: 'artifacts',
      title: t('psychologist:tests.artifacts.title'),
      method: t('psychologist:tests.artifacts.method'),
      chip: artifacts.length
        ? { label: t('psychologist:tests.chip.artifacts', { count: artifacts.length }), tone: 'lake' }
        : noData,
      body: <ArtifactsSection artifacts={artifacts} />,
    },
    {
      id: 'temperament',
      title: t('psychReport:eysenck.cardTitle'),
      method: t('psychReport:eysenck.cardDescription'),
      chip: !temperament
        ? noData
        : temperament.protocol_flagged
          ? { label: t('psychologist:tests.chip.lieFlagged'), tone: 'clay' }
          : temperament.quadrant
            ? { label: t(`psychReport:eysenck.quadrantLabels.${temperament.quadrant}`), tone: 'lake' }
            : done,
      body: <TemperamentSection section={temperament} />,
    },
    {
      id: 'psychoemotional',
      title: t('psychologist:tests.psychoemotional.title'),
      method: t('psychologist:tests.psychoemotional.method'),
      chip: !psychoemotional
        ? noData
        : psychoemotional.validity_flag === 'low'
          ? { label: t('psychologist:tests.chip.lowValidity'), tone: 'clay' }
          : psychoemotional.validity_flag === 'caution'
            ? { label: t('psychologist:tests.chip.caution'), tone: 'dawn' }
            : done,
      body: <PsychoEmotionalSection section={psychoemotional} />,
    },
    {
      id: 'professional_types',
      title: t('psychReport:ddo.cardTitle'),
      method: t('psychReport:ddo.cardDescription'),
      chip: professional_types?.hybrid_profile?.length
        ? {
            // The leading type only — a hybrid profile's full list doesn't fit a chip.
            label: shortName(t(`psychReport:ddo.types.${professional_types.hybrid_profile[0]}.name`)),
            tone: 'lake',
          }
        : professional_types
          ? done
          : noData,
      body: <ProfessionalTypesSection section={professional_types} />,
    },
    {
      id: 'aspiration_level',
      title: t('psychReport:elers.cardTitle'),
      method: t('psychReport:elers.cardDescription'),
      chip: aspiration_level?.level
        ? {
            label: t(`psychologist:tests.chip.elers.${aspiration_level.level}`),
            tone: ELERS_TONE[aspiration_level.level] ?? 'lake',
          }
        : aspiration_level
          ? done
          : noData,
      body: <AspirationLevelSection section={aspiration_level} />,
    },
    {
      id: 'empathy_confidence',
      title: t('psychReport:boykoKondash.cardTitle'),
      method: t('psychReport:boykoKondash.cardDescription'),
      chip: empathy_confidence ? done : noData,
      body: <EmpathyConfidenceSection section={empathy_confidence} />,
    },
    {
      id: 'intelligence',
      title: t('psychReport:astur.cardTitle'),
      method: t('psychReport:astur.cardDescription'),
      chip: !intelligence
        ? noData
        : !intelligence.protocol_quality.ok
          ? { label: t('psychologist:tests.chip.checkProtocol'), tone: 'dawn' }
          : intelligence.overall_percent !== null
            ? {
                label: t('psychologist:tests.chip.percent', {
                  value: formatNumber(intelligence.overall_percent, { maximumFractionDigits: 0 }),
                }),
                tone: 'lake',
              }
            : done,
      body: intelligence ? (
        <IntelligenceSection section={intelligence} />
      ) : (
        emptyBody(t('psychologist:tests.intelligence.empty'))
      ),
    },
    {
      id: 'team_role',
      title: t('psychologist:tests.teamRole.title'),
      method: t('psychologist:tests.teamRole.method'),
      chip: team_role?.dominant_role
        ? { label: shortName(t(`psychReport:belbin.roles.${team_role.dominant_role}.name`)), tone: 'lake' }
        : team_role
          ? done
          : noData,
      body: team_role ? <TeamRoleSection section={team_role} /> : emptyBody(t('psychologist:tests.teamRole.empty')),
    },
    {
      id: 'ai',
      title: t('psychologist:tests.ai.title'),
      method: t('psychologist:tests.ai.method'),
      chip: ai.analysis
        ? { label: t('psychologist:tests.chip.draft'), tone: 'mute' }
        : { label: t('psychologist:tests.chip.unavailable'), tone: 'mute', hollow: true },
      body: ai.body,
    },
  ];
}

/** Rows in the accordion — the publish dialog reports "opened N of these". */
export const TEST_SECTION_COUNT = 9;

/**
 * "Результаты тестов" — raw instrument results, specialist-only. Each
 * instrument is one row that folds open: number, name, method, and a chip
 * with the one-word takeaway, so the psychologist can scan all of them before
 * opening any. The order runs from context about the student, through the
 * tests, to the AI synthesis last — the psychologist sees the raw results
 * before the model's reading of them.
 *
 * Which rows are open is owned by the page: the publish dialog reports how
 * many of them the psychologist actually looked at.
 */
export function ReportSectionsBlock({
  testResults,
  artifacts,
  aiAnalysis,
  onRegenerateAiAnalysis,
  regeneratingAiAnalysis,
  regenerateAiAnalysisError,
  openIds,
  onToggle,
}: {
  testResults: PsychologistTestResultsResponse;
  artifacts: ArtifactItem[];
  aiAnalysis: PsychAiAnalysis | null;
  onRegenerateAiAnalysis: () => void;
  regeneratingAiAnalysis: boolean;
  regenerateAiAnalysisError: boolean;
  openIds: ReadonlySet<string>;
  onToggle: (id: string) => void;
}) {
  const { t } = useTranslation(['psychologist', 'psychReport']);
  const sections = sectionDefs(t, testResults, artifacts, {
    analysis: aiAnalysis,
    body: (
      <AiAnalysisSection
        analysis={aiAnalysis}
        onRegenerate={onRegenerateAiAnalysis}
        regenerating={regeneratingAiAnalysis}
        regenerateError={regenerateAiAnalysisError}
      />
    ),
  });

  return (
    <ol className="flex flex-col gap-2 m-0 p-0 list-none">
      {sections.map((section, index) => {
        const open = openIds.has(section.id);
        const panelId = `test-section-${section.id}`;
        return (
          <li key={section.id} className="bg-surface border border-strong rounded-[10px] overflow-hidden">
            <button
              type="button"
              aria-expanded={open}
              aria-controls={panelId}
              onClick={() => onToggle(section.id)}
              className="w-full flex flex-wrap items-center gap-x-5 gap-y-2 px-5 py-4 text-left bg-transparent border-0 cursor-pointer hover:bg-hover transition-colors"
            >
              <Mono variant="sm" className="text-[color:var(--dawn-deep)] flex-none">
                {String(index + 1).padStart(2, '0')}
              </Mono>
              <span className="flex-1 basis-64 min-w-0 flex flex-col gap-0.5">
                <Text as="span" variant="body-lg" className="font-semibold text-heading">
                  {section.title}
                </Text>
                <Mono variant="xs" className="text-muted">
                  {section.method}
                </Mono>
              </span>
              <StatusMark tone={section.chip.tone} hollow={section.chip.hollow} className="max-w-[260px]">
                {section.chip.label}
              </StatusMark>
              <ChevronDown
                size={18}
                aria-hidden="true"
                className={cn('flex-none text-brand transition-transform duration-150', open && 'rotate-180')}
              />
            </button>
            {open && (
              <div id={panelId} className="px-5 pb-5 pt-4 border-t border-default sm:pl-14">
                <AdminCardEmbed>{section.body}</AdminCardEmbed>
              </div>
            )}
          </li>
        );
      })}
    </ol>
  );
}
