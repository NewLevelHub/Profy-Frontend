import { Pencil } from 'lucide-react';
import type { ArtifactItem, ArtifactType } from '@/shared/types';
import { Card } from '@/shared/ui/Card';
import { ChipList } from '../components/ChipList';

export interface ArtifactsSectionProps {
  artifacts: ArtifactItem[];
  onEdit: () => void;
}

function valuesOf(items: ArtifactItem[], type: ArtifactType): string[] {
  return items.filter(i => i.type === type).map(i => i.value);
}

// Mirrors the onboarding "Твои увлечения и цели" step's own groups
// (see ArtifactsSetupPage) so this reads as the same data, not a re-sorted
// view of it.
export function ArtifactsSection({ artifacts, onEdit }: ArtifactsSectionProps) {
  const hasAny = artifacts.length > 0;
  const dream = artifacts.find(i => i.type === 'goal')?.value;

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-black text-primary text-subtitle">Увлечения и цели</h2>
        <button
          type="button"
          onClick={onEdit}
          className="flex items-center gap-[6px] text-brand font-extrabold hover:opacity-75 transition-opacity text-sm"
          aria-label={hasAny ? 'Редактировать увлечения и цели' : 'Добавить увлечения и цели'}
        >
          <Pencil size={13} />
          {hasAny ? 'Изменить' : 'Добавить'}
        </button>
      </div>

      {hasAny ? (
        <>
          <ChipList label="Хобби и занятия" items={valuesOf(artifacts, 'hobby')} />
          <ChipList label="Кружки и секции" items={valuesOf(artifacts, 'club')} />
          <ChipList label="Достижения" items={valuesOf(artifacts, 'achievement')} />
          <ChipList label="Интересные профессии" items={valuesOf(artifacts, 'profession')} />
          <ChipList label="Страны и университеты" items={valuesOf(artifacts, 'university')} />
          {dream && (
            <div className="mb-4 last:mb-0">
              <p className="font-extrabold text-primary text-sm mb-2.5">Мечта</p>
              <p className="text-secondary text-sm">{dream}</p>
            </div>
          )}
        </>
      ) : (
        <p className="text-secondary text-sm">Пока пусто — можно рассказать о своих увлечениях и целях</p>
      )}
    </Card>
  );
}
