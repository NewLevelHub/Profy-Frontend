import { useTranslation } from 'react-i18next';
import { Card } from '@/shared/ui/Card';
import type { UniversityTrack } from '@/shared/types';

interface UniversityTrackSectionProps {
  track: UniversityTrack;
}

/** Shown to everyone — the plan leads to a matching specialty even if the goal isn't admission. */
export function UniversityTrackSection({ track }: UniversityTrackSectionProps) {
  const { t } = useTranslation('roadmap');
  if (track.specialties.length === 0 && track.prepare.length === 0) return null;

  return (
    <Card className="flex flex-col gap-5">
      <h2 className="text-label font-bold text-primary flex items-center gap-2">
        <span aria-hidden="true">🎓</span>
        {t('universityTrack.title')}
      </h2>

      {track.specialties.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-caption font-semibold text-muted uppercase tracking-wide">
            {t('universityTrack.leadsTo')}
          </p>
          <div className="flex flex-wrap gap-2">
            {track.specialties.map((specialty, i) => (
              <span
                key={i}
                className="px-3 py-1 rounded-pill text-caption font-semibold bg-brand-subtle text-brand border border-default"
              >
                {specialty}
              </span>
            ))}
          </div>
        </div>
      )}

      {track.prepare.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-caption font-semibold text-muted uppercase tracking-wide">
            {t('universityTrack.whatToPrepare')}
          </p>
          <ul className="flex flex-col gap-2">
            {track.prepare.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-body text-secondary">
                <span className="text-brand font-bold mt-0.5 flex-shrink-0">•</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
}
