import type { ArtifactItem, ArtifactType } from '@/shared/types';
import { LedgerSection } from '../components/LedgerSection';

export interface ArtifactsSectionProps {
  artifacts: ArtifactItem[];
  onEdit: () => void;
}

const GROUPS: { type: ArtifactType; label: string }[] = [
  { type: 'hobby', label: 'Хобби' },
  { type: 'club', label: 'Клубы' },
  { type: 'achievement', label: 'Достижения' },
  { type: 'profession', label: 'Интересные профессии' },
  { type: 'university', label: 'Страны и университеты' },
];

function joinValues(items: ArtifactItem[], type: ArtifactType): string | null {
  const values = items.filter((i) => i.type === type).map((i) => i.value);
  return values.length ? values.join(', ') : null;
}

// Mirrors the onboarding "Твои увлечения и цели" step's own groups (see
// ArtifactsSetupPage) so this reads as the same data, laid out as the
// ledger reference's label/value rows instead of a chip list.
export function ArtifactsSection({ artifacts, onEdit }: ArtifactsSectionProps) {
  const hasAny = artifacts.length > 0;
  const dream = joinValues(artifacts, 'goal');
  const rows = GROUPS.map((g) => ({ ...g, value: joinValues(artifacts, g.type) })).filter((r) => r.value);

  return (
    <LedgerSection
      id="artifacts"
      number="03"
      title="УВЛЕЧЕНИЯ"
      editLabel={hasAny ? 'Изменить' : 'Добавить'}
      editAriaLabel={hasAny ? 'Редактировать увлечения и цели' : 'Добавить увлечения и цели'}
      onEdit={onEdit}
    >
      {hasAny ? (
        <div className="grid sm:grid-cols-2 gap-x-8 gap-y-5">
          {rows.map((r) => (
            <div key={r.type} className="flex flex-col gap-1">
              <p className="text-caption text-secondary">{r.label}</p>
              <p className="text-body-md text-primary">{r.value}</p>
            </div>
          ))}
          <div className="flex flex-col gap-1">
            <p className="text-caption text-secondary">Мечта</p>
            {dream ? (
              <p className="text-body-md text-primary">{dream}</p>
            ) : (
              <p className="text-body-sm text-secondary flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-accent flex-none" aria-hidden="true" />
                Пока пусто —{' '}
                <button
                  type="button"
                  onClick={onEdit}
                  className="text-brand font-bold hover:opacity-75 transition-opacity"
                >
                  рассказать
                </button>
              </p>
            )}
          </div>
        </div>
      ) : (
        <p className="text-body-sm text-secondary">Пока пусто — можно рассказать о своих увлечениях и целях</p>
      )}
    </LedgerSection>
  );
}
