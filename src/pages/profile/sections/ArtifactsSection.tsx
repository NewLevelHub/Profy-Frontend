import { useTranslation } from 'react-i18next';
import type { ArtifactItem, ArtifactType } from '@/shared/types';
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

function joinValues(items: ArtifactItem[], type: ArtifactType): string | null {
  const values = items.filter((i) => i.type === type).map((i) => i.value);
  return values.length ? values.join(', ') : null;
}

// Mirrors the onboarding "Твои увлечения и цели" step's own groups (see
// ArtifactsSetupPage) so this reads as the same data, laid out as the
// ledger reference's label/value rows instead of a chip list.
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
        <div className="grid sm:grid-cols-2 gap-x-8 gap-y-5">
          {rows.map((r) => (
            <div key={r.type} className="flex flex-col gap-1">
              <p className="text-caption text-secondary">{t(r.labelKey)}</p>
              <p className="text-body-md text-primary">{r.value}</p>
            </div>
          ))}
          <div className="flex flex-col gap-1">
            <p className="text-caption text-secondary">{t('artifacts.dream')}</p>
            {dream ? (
              <p className="text-body-md text-primary">{dream}</p>
            ) : (
              <p className="text-body-sm text-secondary flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-accent flex-none" aria-hidden="true" />
                {t('artifacts.dreamEmptyPrefix')}{' '}
                <button
                  type="button"
                  onClick={onEdit}
                  className="text-brand font-bold hover:opacity-75 transition-opacity"
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
