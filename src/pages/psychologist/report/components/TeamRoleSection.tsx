import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { AdminCard } from '@/shared/ui/admin/AdminSectionHeading';
import { AdminBadge } from '@/shared/ui/admin/AdminBadge';
import { ADMIN_META, ADMIN_TEXT } from '@/shared/ui/admin/density';
import type { TeamRoleSection as TeamRoleSectionData } from '@/shared/types';
import { BarChart, type BarChartItem } from './BarChart';
import { PsychTestHeaderInfo } from './PsychTestHeaderInfo';
import { PsychDetailCard } from './PsychDetailCard';
import { RoleEvidenceView } from './AnswerEvidence';
import {
  getBelbinMethodology,
  getBelbinRoles,
} from '../model/psychTestExplanations';

const DOMINANT_COLOR = 'var(--brand)';
const SUPPORTING_COLOR = 'var(--accent)';
const AVOIDANCE_COLOR = 'var(--mute)';
const NEUTRAL_COLOR = 'var(--brand-subtle)';

/**
 * Belbin BTRSPI "Who are you in an organization" — Bar Chart + interactive
 * role breakdown, strengths, allowable weaknesses, and avoidance zone.
 */
export function TeamRoleSection({ section }: { section: TeamRoleSectionData | null }) {
  const { t } = useTranslation('psychReport');
  if (!section) return null;

  const methodology = getBelbinMethodology(t);
  const belbinRoles = getBelbinRoles(t);

  const roleLabels = (t('psychReport:belbin.roleLabels', {
    returnObjects: true,
  }) || {}) as Record<string, string>;

  const hasChart = !!section.scores && !!section.ranked_roles && section.ranked_roles.length > 0;
  const maxScore = hasChart ? Math.max(...Object.values(section.scores!)) : 0;

  // Selected role to inspect in the detail card
  const [selectedRoleKey, setSelectedRoleKey] = useState<string | null>(section.dominant_role ?? null);

  const activeRoleInfo = selectedRoleKey && selectedRoleKey in belbinRoles ? belbinRoles[selectedRoleKey] : null;

  const isDominant = selectedRoleKey === section.dominant_role;
  const isSupporting = section.supporting_roles?.includes(selectedRoleKey ?? '');
  const isAvoidance = section.avoidance_roles?.includes(selectedRoleKey ?? '');

  const items: BarChartItem[] = hasChart
    ? section.ranked_roles!.map((role) => {
        const color = role === section.dominant_role
          ? DOMINANT_COLOR
          : section.supporting_roles?.includes(role)
            ? SUPPORTING_COLOR
            : section.avoidance_roles?.includes(role)
              ? AVOIDANCE_COLOR
              : NEUTRAL_COLOR;
        return {
          key: role,
          label: roleLabels[role] ?? role,
          value: section.scores![role] ?? 0,
          color,
        };
      })
    : [];

  return (
    <AdminCard
      title={t('psychReport:belbin.cardTitle')}
      description={t('psychReport:belbin.cardDescription')}
    >
      <PsychTestHeaderInfo methodology={methodology} />

      {section.dominant_role && (
        <div className="flex flex-wrap items-center gap-1.5 mb-3">
          <span className={cn(ADMIN_META, 'w-full mb-0.5')}>{t('psychReport:belbin.chooseRolePrompt')}</span>
          <button
            type="button"
            onClick={() => setSelectedRoleKey(selectedRoleKey === section.dominant_role ? null : section.dominant_role)}
            className="focus:outline-none"
          >
            <AdminBadge tone="brand" dot className={selectedRoleKey === section.dominant_role ? 'ring-2 ring-brand' : ''}>
              {t('psychReport:belbin.dominantBadge', { role: roleLabels[section.dominant_role] ?? section.dominant_role })}
            </AdminBadge>
          </button>

          {section.supporting_roles?.map((role) => (
            <button
              key={role}
              type="button"
              onClick={() => setSelectedRoleKey(selectedRoleKey === role ? null : role)}
              className="focus:outline-none"
            >
              <AdminBadge tone="accent" className={selectedRoleKey === role ? 'ring-2 ring-accent' : ''}>
                {roleLabels[role] ?? role}
              </AdminBadge>
            </button>
          ))}

          {section.avoidance_roles?.map((role) => (
            <button
              key={role}
              type="button"
              onClick={() => setSelectedRoleKey(selectedRoleKey === role ? null : role)}
              className="focus:outline-none"
            >
              <AdminBadge tone="quiet" className={selectedRoleKey === role ? 'ring-2 ring-default' : ''}>
                {t('psychReport:belbin.avoidanceBadge', { role: roleLabels[role] ?? role })}
              </AdminBadge>
            </button>
          ))}
        </div>
      )}

      {hasChart && (
        <div className="mb-2">
          <BarChart items={items} max={maxScore} />
        </div>
      )}

      {/* Interactive role selector list below chart */}
      {hasChart && (
        <div className="flex flex-wrap items-center gap-2 pt-2.5 border-t border-default/60">
          <span className={cn(ADMIN_META, 'self-center mr-1')}>{t('psychReport:belbin.chooseRolePrompt')}</span>
          {section.ranked_roles?.map((role) => {
            const score = section.scores?.[role] ?? 0;
            const isSelected = selectedRoleKey === role;
            return (
              <button
                key={role}
                type="button"
                onClick={() => setSelectedRoleKey(isSelected ? null : role)}
                className={cn(
                  'px-2.5 py-1.5 rounded-[10px] font-sans text-body-sm transition-colors flex items-center gap-1.5 border focus:outline-none focus:ring-1 focus:ring-brand',
                  isSelected
                    ? 'bg-brand text-on-brand border-brand font-semibold shadow-sm'
                    : 'bg-raised text-secondary border-default/70 hover:border-strong hover:text-primary',
                )}
              >
                <span>{roleLabels[role] ?? role}</span>
                <span className="font-mono text-mono-sm tabular-nums opacity-80">({score})</span>
                <ChevronDown size={13} className={cn('transition-transform', isSelected && 'rotate-180')} />
              </button>
            );
          })}
        </div>
      )}

      {/* Expanded RIASEC-style Detail Card */}
      {activeRoleInfo && (
        <PsychDetailCard
          title={activeRoleInfo.name}
          badge={
            <AdminBadge tone={isDominant ? 'brand' : isSupporting ? 'accent' : isAvoidance ? 'quiet' : 'neutral'}>
              {isDominant
                ? t('psychReport:belbin.dominant')
                : isSupporting
                  ? t('psychReport:belbin.supporting')
                  : isAvoidance
                    ? t('psychReport:belbin.avoidance')
                    : t('psychReport:belbin.neutral')}
            </AdminBadge>
          }
          meaning={activeRoleInfo.meaning}
          means={activeRoleInfo.behavioralManifestation}
          follows={activeRoleInfo.psychologistFocus}
          why={t('psychReport:belbin.roleWhy', {
            score: section.scores?.[selectedRoleKey!] ?? 0,
          })}
          riskWarning={
            isAvoidance
              ? t('psychReport:belbin.avoidanceRisk', {
                  weaknesses: activeRoleInfo.riskWarning ?? '',
                })
              : t('psychReport:belbin.allowableWeaknesses', {
                  weaknesses: activeRoleInfo.riskWarning ?? '',
                })
          }
          onClose={() => setSelectedRoleKey(null)}
        >
          {section.role_evidence?.[selectedRoleKey!] && (
            <RoleEvidenceView evidence={section.role_evidence[selectedRoleKey!]} />
          )}
        </PsychDetailCard>
      )}

      {section.methodological_note && (
        <p className={cn(ADMIN_TEXT, 'text-muted mt-3')}>{section.methodological_note}</p>
      )}
    </AdminCard>
  );
}
