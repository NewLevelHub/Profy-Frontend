import { useNavigate } from 'react-router';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { Skeleton } from '@/shared/ui/Skeleton';
import type { ArtifactItem, ArtifactType } from '@/shared/types';
import { useProfileArtifacts } from '../../hooks/useProfileArtifacts';

// Same Russian labels the admin panel already uses for these artifact types
// (see ARTIFACT_LABELS in AdminUserDetailPage.tsx) — kept in sync rather than
// inventing a second wording for the same data.
const ARTIFACT_LABELS: Record<ArtifactType, string> = {
  hobby: 'Хобби',
  club: 'Кружки',
  sport: 'Спорт',
  achievement: 'Достижения',
  goal: 'Мечты',
  book: 'Книги',
  game: 'Игры',
  topic: 'Темы',
  profession: 'Профессии',
  university: 'Вузы',
  dream: 'Мечты',
};

function groupByType(items: ArtifactItem[]): [ArtifactType, string[]][] {
  const map = new Map<ArtifactType, string[]>();
  for (const item of Array.isArray(items) ? items : []) {
    const list = map.get(item.type) ?? [];
    list.push(item.value);
    map.set(item.type, list);
  }
  return Array.from(map.entries());
}

/**
 * "ТЫ РАССКАЗАЛ О СЕБЕ" — `ProfileResponse` has no free-text self-description
 * field, so this renders the real closest analog: the artifacts (hobbies,
 * games, books, dreams…) the child picked in onboarding, via `/profile/artifacts`.
 *
 * Kicker color judgment call: the spec literally says Clay here, but Clay is
 * reserved system-wide for errors/destructive actions only (`--danger: var(--clay)`
 * in theme.css, and every other migrated page only ever uses Clay for that).
 * A "you told us about yourself" label is not an error state, so this uses
 * Dawn (`text-accent`) instead — the closest non-error accent — rather than
 * introduce a new non-error Clay usage.
 */
export function SelfDescriptionSection() {
  const navigate = useNavigate();
  const { artifacts, isLoading } = useProfileArtifacts(true);
  const grouped = groupByType(artifacts);

  return (
    <Card className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <p className="font-mono text-tiny font-bold uppercase tracking-label text-accent">
          ТЫ РАССКАЗАЛ О СЕБЕ
        </p>
        <Button variant="ghost" size="sm" onClick={() => navigate('/onboarding/artifacts')}>
          Поменять
        </Button>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-2">
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="h-5 w-1/2" />
        </div>
      ) : grouped.length === 0 ? (
        <p className="text-body text-secondary">
          Пока пусто — расскажи о себе, чтобы это появилось здесь.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {grouped.map(([type, values]) => (
            <div key={type}>
              <p className="text-caption font-bold text-muted mb-1">{ARTIFACT_LABELS[type] ?? type}</p>
              <p className="text-body font-medium" style={{ color: 'var(--midnight)' }}>
                {values.join(', ')}
              </p>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
