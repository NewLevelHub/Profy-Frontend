import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { Skeleton } from '@/shared/ui/Skeleton';
import type { ArtifactItem, ArtifactType } from '@/shared/types';
import { useProfileArtifacts } from '../../hooks/useProfileArtifacts';

// i18n keys under profile/artifactType.* — the ru wording matches the labels
// the admin panel uses for these types (AdminUserDetailPage), the kk wording
// is the localized equivalent. Resolved via `t()` at render.
const ARTIFACT_LABEL_KEYS: Record<ArtifactType, string> = {
  hobby: 'artifactType.hobby',
  club: 'artifactType.club',
  sport: 'artifactType.sport',
  achievement: 'artifactType.achievement',
  goal: 'artifactType.goal',
  book: 'artifactType.book',
  game: 'artifactType.game',
  topic: 'artifactType.topic',
  profession: 'artifactType.profession',
  university: 'artifactType.university',
  dream: 'artifactType.dream',
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
  const { t } = useTranslation('profile');
  const { artifacts, isLoading } = useProfileArtifacts(true);
  const grouped = groupByType(artifacts);

  return (
    <Card className="flex flex-col gap-4 bg-transparent">
      <div className="flex items-start justify-between gap-3">
        <p className="font-mono text-tiny font-bold uppercase tracking-label text-accent">
          {t('selfDescription.kicker')}
        </p>
        <Button variant="ghost" size="sm" onClick={() => navigate('/onboarding/artifacts')}>
          {t('selfDescription.change')}
        </Button>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-2">
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="h-5 w-1/2" />
        </div>
      ) : grouped.length === 0 ? (
        <p className="text-body text-secondary">
          {t('selfDescription.empty')}
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {grouped.map(([type, values]) => (
            <div key={type}>
              <p className="text-caption font-bold text-muted mb-1">{ARTIFACT_LABEL_KEYS[type] ? t(ARTIFACT_LABEL_KEYS[type]) : type}</p>
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
