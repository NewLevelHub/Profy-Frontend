import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { PSYCHO_COLOR_BY_ID } from '@/shared/config/psychoColors';
import { cn } from '@/shared/lib/cn';
import type {
  PsychoEmotionalMcvGroup,
  PsychoEmotionalInterpretation as Interpretation,
  PsychoEmotionalPositionNote,
  PsychoPositionSign,
} from '@/shared/types';
import { Mono } from './typography/Mono';
import { Text } from './typography/Text';

const SIGN_GLYPH: Record<PsychoPositionSign, string> = {
  plus: '+',
  cross: '×',
  equal: '=',
  minus: '−',
  plus_minus: '+−',
};

const SIGN_ORDER: PsychoPositionSign[] = ['plus', 'cross', 'equal', 'minus', 'plus_minus'];

export interface PsychoEmotionalInterpretationDocumentProps {
  interpretation?: Interpretation | null;
  className?: string;
  part?: 'all' | 'classic' | 'mcv';
}

/** Document-like reading order matching the reference report structure. */
export function PsychoEmotionalInterpretationDocument({
  interpretation,
  className,
  part = 'all',
}: PsychoEmotionalInterpretationDocumentProps) {
  const { t } = useTranslation('psychologist');
  if (!interpretation) return null;

  const {
    reading,
    highlights,
    positions,
    mcv_groups: mcvGroups = [],
  } = interpretation;
  const showClassic = part === 'all' || part === 'classic';
  const showMcv = part === 'all' || part === 'mcv';
  const hasClassic = reading.length > 0 || highlights.length > 0 || positions.length > 0;
  const hasContent = (showClassic && hasClassic)
    || (showMcv && mcvGroups.length > 0);
  if (!hasContent) return null;

  const label = part === 'mcv'
    ? t('psychoInterpretation.mcvTitle')
    : t('psychoInterpretation.title');

  return (
    <section
      className={cn('flex flex-col gap-5 border-t border-default pt-5', className)}
      aria-label={label}
    >
      {showClassic && hasClassic && (
        <>
          <SectionHeading
            title={t('psychoInterpretation.title')}
            description={t('psychoInterpretation.intro')}
          />

          {(reading.length > 0 || highlights.length > 0) && (
            <div className="flex flex-col gap-3 border-l-2 border-warning pl-4">
              {reading.length > 0 && (
                <div className="flex flex-col gap-1">
                  <Text variant="caption" className="font-semibold uppercase tracking-wide text-muted">
                    {t('psychoInterpretation.reading')}
                  </Text>
                  {reading.map((text) => (
                    <Text key={text} variant="body-sm" className="text-primary">{text}</Text>
                  ))}
                </div>
              )}
              {highlights.length > 0 && (
                <div className="flex flex-col gap-1.5">
                  <Text variant="caption" className="font-semibold uppercase tracking-wide text-muted">
                    {t('psychoInterpretation.highlights')}
                  </Text>
                  {highlights.map((note) => (
                    <Text key={note.key} variant="body-sm" className="text-primary">{note.text}</Text>
                  ))}
                </div>
              )}
            </div>
          )}

          <FunctionalPositionGroups positions={positions} />
        </>
      )}

      {showMcv && mcvGroups.length > 0 && (
        <>
          <SectionHeading
            title={t('psychoInterpretation.mcvTitle')}
            description={t('psychoInterpretation.mcvIntro')}
          />
          <McvGroups groups={mcvGroups} />
        </>
      )}

    </section>
  );
}

function SectionHeading({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex flex-col gap-1">
      <Text as="h3" variant="body-lg" className="font-semibold text-heading">{title}</Text>
      <Text variant="body-sm" className="text-secondary">{description}</Text>
    </div>
  );
}

function FunctionalPositionGroups({ positions }: { positions: PsychoEmotionalPositionNote[] }) {
  return (
    <div className="flex flex-col">
      {SIGN_ORDER.map((sign) => {
        const notes = positions.filter((note) => note.sign === sign);
        if (notes.length === 0) return null;
        return (
          <FunctionalGroup key={sign} sign={sign}>
            {notes.map((note, index) => (
              <InterpretationLine
                key={`${note.sign}-${note.colors.join('-')}-${index}`}
                sign={note.sign}
                colors={note.colors}
                text={note.text}
              />
            ))}
          </FunctionalGroup>
        );
      })}
    </div>
  );
}

function McvGroups({ groups }: { groups: PsychoEmotionalMcvGroup[] }) {
  return (
    <div className="flex flex-col">
      {SIGN_ORDER.map((sign) => {
        const notes = groups.filter((group) => group.sign === sign);
        if (notes.length === 0) return null;
        return (
          <FunctionalGroup key={sign} sign={sign}>
            {notes.map((group, index) => (
              <InterpretationLine
                key={`${group.sign}-${group.colors.join('-')}-${index}`}
                sign={group.sign}
                colors={group.colors}
                text={group.text}
              />
            ))}
          </FunctionalGroup>
        );
      })}
    </div>
  );
}

function FunctionalGroup({ sign, children }: { sign: PsychoPositionSign; children: ReactNode }) {
  const { t } = useTranslation('psychologist');
  const title = sign === 'plus_minus'
    ? t('psychoInterpretation.plusMinus')
    : t(`psycho.sign.${sign}`);
  return (
    <section className="grid border-t border-default py-4 first:border-t-0 md:grid-cols-[210px_1fr] md:gap-6">
      <div className="mb-3 md:mb-0">
        <Text variant="body-sm" className="font-semibold text-heading">
          ({SIGN_GLYPH[sign]}) {title}
        </Text>
        <Text variant="caption" className="mt-1 text-muted">
          {t(`psychoInterpretation.positionDescriptions.${sign}`)}
        </Text>
      </div>
      <div className="flex flex-col">{children}</div>
    </section>
  );
}

function InterpretationLine({
  sign,
  colors,
  text,
}: {
  sign: PsychoPositionSign;
  colors: number[];
  text: string;
}) {
  return (
    <article className="grid gap-2 border-b border-default py-3 first:pt-0 last:border-b-0 last:pb-0 sm:grid-cols-[104px_1fr] sm:gap-4">
      <FunctionCode sign={sign} colors={colors} />
      <Text variant="body-sm" className="text-primary">{text}</Text>
    </article>
  );
}

function FunctionCode({ sign, colors }: { sign: PsychoPositionSign; colors: number[] }) {
  const { t } = useTranslation('assessment');
  return (
    <span className="flex flex-wrap items-center gap-x-2 gap-y-1 self-start">
      {colors.map((id, index) => {
        const prefix = sign === 'plus_minus'
          ? index === 0 ? '+' : '−'
          : SIGN_GLYPH[sign];
        return (
          <span key={`${sign}-${id}-${index}`} className="inline-flex items-center gap-1">
            <span
              className="h-3 w-3 rounded-[2px] ring-1 ring-inset ring-black/15"
              style={{ backgroundColor: PSYCHO_COLOR_BY_ID[id]?.hex ?? 'transparent' }}
              title={t(`psychoemotional.color.${id}`)}
            />
            <Mono variant="sm" className="font-semibold text-heading">{prefix}{id}</Mono>
          </span>
        );
      })}
    </span>
  );
}
