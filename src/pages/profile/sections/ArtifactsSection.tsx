import { useTranslation } from 'react-i18next';
import type { ArtifactItem, ArtifactType } from '@/shared/types';
import { localizeArtifactList } from '@/shared/i18n/presets';
import { LedgerSection } from '../components/LedgerSection';

export interface ArtifactsSectionProps {
  artifacts: ArtifactItem[];
  onEdit: () => void;
}

// `labelKey` resolved via `t()` at render (profile/artifacts.group.*).
const GROUPS: { type: ArtifactType; labelKey: string }[] = [
  { type: 'hobby', labelKey: 'artifacts.group.hobby' },
  { type: 'club', labelKey: 'artifacts.group.club' },
  { type: 'achievement', labelKey: 'artifacts.group.achievement' },
  { type: 'profession', labelKey: 'artifacts.group.profession' },
  { type: 'university', labelKey: 'artifacts.group.university' },
];

// Preset values (hobby/club/achievement/profession/target) carry a `kk` copy
// in the onboarding catalog; custom entries and the free-text dream fall
// through untouched.
function joinValues(items: ArtifactItem[], type: ArtifactType): string | null {
  const values = items.filter((i) => i.type === type).map((i) => i.value);
  return values.length ? localizeArtifactList(type, values) : null;
}

// Mirrors the onboarding "Твои увлечения и цели" step's own groups (see
// ArtifactsSetupPage) so this reads as the same data, laid out as soft
// field tiles instead of bare label/value rows on beige.
export function ArtifactsSection({ artifacts, onEdit }: ArtifactsSectionProps) {
  const { t } = useTranslation('profile');
  const hasAny = artifacts.length > 0;
  const dream = joinValues(artifacts, 'goal');
  const rows = GROUPS.map((g) => ({ ...g, value: joinValues(artifacts, g.type) })).filter((r) => r.value);

  return (
    <LedgerSection
      id="artifacts"
      number="03"
      title={t('artifacts.title')}
      editLabel={hasAny ? t('common.edit') : t('common.add')}
      editAriaLabel={hasAny ? t('artifacts.editAria') : t('artifacts.addAria')}
      onEdit={onEdit}
    >
      {hasAny ? (
        <div className="grid sm:grid-cols-2 gap-2.5">
          {rows.map((r) => (
            <div key={r.type} className="field-tile flex flex-col gap-1 px-4 py-3.5">
              <p className="text-caption text-secondary">{t(r.labelKey)}</p>
              <p className="text-body-md font-semibold text-[color:var(--text-heading)]">{r.value}</p>
            </div>
          ))}
          <div className="field-tile flex flex-col gap-1 px-4 py-3.5 sm:col-span-2">
            <p className="text-caption text-secondary">{t('artifacts.dream')}</p>
            {dream ? (
              <p className="text-body-md font-semibold text-[color:var(--text-heading)]">{dream}</p>
            ) : (
              <p className="text-body-sm text-secondary flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-accent flex-none" aria-hidden="true" />
                {t('artifacts.dreamEmptyPrefix')}{' '}
                <button
                  type="button"
                  onClick={onEdit}
                  className="text-brand font-semibold hover:opacity-75 transition-opacity"
                >
                  {t('artifacts.dreamEmptyAction')}
                </button>
              </p>
            )}
          </div>
        </div>
      ) : (
        <p className="text-body-sm text-secondary">{t('artifacts.empty')}</p>
      )}
    </LedgerSection>
  );
}
