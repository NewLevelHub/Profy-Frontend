import { useTranslation } from 'react-i18next';
import type { ThinkingStyleNote } from '@/shared/types';
import { DomainCardFrame, DomainKicker, DomainEmptyState } from './DomainCardParts';

interface ThinkingStyleMotivationSectionProps {
  thinkingStyleNotes: ThinkingStyleNote[];
  motivationHighlights: string[];
}

// Both fields are small (thinking style: 0-2 items; motivation: a handful
// of short phrases, contract §4.3) — too little content to justify two
// separate bordered cards, so they share one, each with its own kicker.
export function ThinkingStyleMotivationSection({
  thinkingStyleNotes,
  motivationHighlights,
}: ThinkingStyleMotivationSectionProps) {
  const { t } = useTranslation('results');
  return (
    <DomainCardFrame ariaLabel={t('thinkingMotivation.aria')}>
      <div>
        <DomainKicker>{t('thinkingMotivation.kickerThinking')}</DomainKicker>
        {thinkingStyleNotes.length === 0 ? (
          <DomainEmptyState>{t('domain.emptyMore')}</DomainEmptyState>
        ) : (
          <div className="flex flex-col gap-3">
            {thinkingStyleNotes.map((note, i) => (
              <div key={i}>
                <p className="text-body-sm font-semibold text-[color:var(--text-heading)] leading-snug">
                  {note.title}
                </p>
                <p className="text-caption leading-snug mt-0.5" style={{ color: 'var(--ink)' }}>
                  {note.description}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="border-t border-[var(--hairline)]" />

      <div>
        <DomainKicker>{t('thinkingMotivation.kickerMotivation')}</DomainKicker>
        {motivationHighlights.length === 0 ? (
          <DomainEmptyState>{t('domain.emptyMore')}</DomainEmptyState>
        ) : (
          <div className="flex flex-col gap-2">
            {motivationHighlights.map((text, i) => (
              <p
                key={i}
                className="text-body-sm font-semibold text-[color:var(--text-heading)] leading-snug"
              >
                {text}
              </p>
            ))}
          </div>
        )}
      </div>
    </DomainCardFrame>
  );
}
