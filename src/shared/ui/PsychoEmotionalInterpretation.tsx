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
import { Text } from './typography';

const SIGN_GLYPH: Record<PsychoPositionSign, string> = {
  plus: '+',
  cross: '×',
  equal: '=',
  minus: '−',
  plus_minus: '+−',
};

export interface PsychoEmotionalInterpretationProps {
  interpretation?: Interpretation | null;
  className?: string;
}

/**
 * PRO-448 — specialist-facing reading of the psychoemotional (colour) test:
 * how far to trust the run, the main signals, the colour pair of each
 * functional group and the first-vs-last root conflict.
 * The texts arrive from the backend catalog
 * already in the viewer's locale; only the headings are i18n keys here.
 * Quantitative index paragraphs are rendered beside their scales by
 * PsychoEmotionalReport, so qualitative and numeric readings are not mixed.
 */
export function PsychoEmotionalInterpretation({ interpretation, className }: PsychoEmotionalInterpretationProps) {
  const { t } = useTranslation('psychologist');
  if (!interpretation) return null;
  const { reading, highlights, positions, mcv_groups: mcvGroups = [], conversation_prompts: prompts = [] } = interpretation;
  if (!reading.length && !highlights.length && !positions.length && !mcvGroups.length && !prompts.length) return null;

  return (
    <section className={cn('flex flex-col gap-4 border-t border-default pt-4', className)} aria-label={t('psychoInterpretation.title')}>
      <div className="flex flex-col gap-1">
        <Text as="h3" variant="body-lg" className="font-semibold text-heading">
          {t('psychoInterpretation.title')}
        </Text>
        <Text variant="body-sm" className="text-secondary">
          {t('psychoInterpretation.intro')}
        </Text>
      </div>

      {reading.length > 0 && (
        <div role="note" className="flex flex-col gap-1.5 rounded-[12px] border border-default bg-warning-subtle p-3">
          <BlockTitle>{t('psychoInterpretation.reading')}</BlockTitle>
          {reading.map((text) => (
            <Text key={text} variant="body-sm" className="text-primary">{text}</Text>
          ))}
        </div>
      )}

      {highlights.length > 0 && (
        <Block title={t('psychoInterpretation.highlights')}>
          <ul className="m-0 flex list-disc flex-col gap-2 pl-5">
            {highlights.map((note) => (
              <li key={note.key} className="text-secondary">
                <Text as="span" variant="body-sm" className="text-primary">{note.text}</Text>
              </li>
            ))}
          </ul>
        </Block>
      )}

      {positions.length > 0 && (
        <Block title={t('psychoInterpretation.positions')}>
          <div className="flex flex-col gap-3">
            {positions.map((note) => (
              <PositionRow key={note.sign} note={note} />
            ))}
          </div>
        </Block>
      )}

      {mcvGroups.length > 0 && (
        <Block title={t('psychoInterpretation.mcvTitle')}>
          <Text variant="body-sm" className="text-secondary">
            {t('psychoInterpretation.mcvIntro')}
          </Text>
          <div className="flex flex-col gap-3">
            {mcvGroups.map((group, index) => (
              <McvGroupRow key={`${group.colors.join('-')}-${index}`} group={group} />
            ))}
          </div>
        </Block>
      )}

      {prompts.length > 0 && (
        <Block title={t('psychoInterpretation.conversationTitle')}>
          <Text variant="body-sm" className="text-secondary">
            {t('psychoInterpretation.conversationIntro')}
          </Text>
          <ol className="m-0 flex list-decimal flex-col gap-2.5 pl-5">
            {prompts.map((prompt) => (
              <li key={prompt.key} className="pl-1 text-secondary">
                <Text as="span" variant="body-sm" className="font-medium text-primary">
                  {prompt.text}
                </Text>
              </li>
            ))}
          </ol>
        </Block>
      )}
    </section>
  );
}

function BlockTitle({ children }: { children: string }) {
  return (
    <Text as="h4" variant="caption" className="font-semibold uppercase tracking-wide text-muted">
      {children}
    </Text>
  );
}

function Block({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2 border-t border-default pt-3">
      <BlockTitle>{title}</BlockTitle>
      {children}
    </div>
  );
}

function PositionRow({ note }: { note: PsychoEmotionalPositionNote }) {
  const { t } = useTranslation('psychologist');
  const { t: tAssessment } = useTranslation('assessment');
  const label = note.sign === 'plus_minus' ? t('psychoInterpretation.plusMinus') : t(`psycho.sign.${note.sign}`);
  return (
    <article
      className={cn(
        'flex flex-col gap-2 rounded-[12px] border border-default bg-surface p-3.5',
        note.sign === 'plus_minus' && 'bg-warning-subtle',
      )}
    >
      <span className="flex flex-wrap items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-raised font-mono text-primary">
          {SIGN_GLYPH[note.sign]}
        </span>
        <span className="flex gap-0.5">
          {note.colors.map((id) => (
            <span
              key={id}
              className="inline-block h-3.5 w-3.5 rounded-[3px] ring-1 ring-inset ring-black/15"
              style={{ backgroundColor: PSYCHO_COLOR_BY_ID[id]?.hex ?? 'transparent' }}
              title={tAssessment(`psychoemotional.color.${id}`)}
              aria-label={tAssessment(`psychoemotional.color.${id}`)}
            />
          ))}
        </span>
        <span className="min-w-0 flex-1">
          <Text as="span" variant="caption" className="block font-semibold text-heading">{label}</Text>
          <Text as="span" variant="caption" className="block text-muted">
            {t(`psychoInterpretation.positionDescriptions.${note.sign}`)}
          </Text>
        </span>
      </span>
      <Text variant="body-sm" className="text-primary">{note.text}</Text>
    </article>
  );
}

function McvGroupRow({ group }: { group: PsychoEmotionalMcvGroup }) {
  const { t } = useTranslation('psychologist');
  const { t: tAssessment } = useTranslation('assessment');
  return (
    <article className="flex flex-col gap-2 rounded-[12px] border border-default bg-surface p-3.5">
      <div className="flex flex-wrap items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-raised font-mono text-primary">
          {SIGN_GLYPH[group.sign]}
        </span>
        <span className="flex gap-0.5">
          {group.colors.map((id) => (
            <span
              key={id}
              className="inline-block h-3.5 w-3.5 rounded-[3px] ring-1 ring-inset ring-black/15"
              style={{ backgroundColor: PSYCHO_COLOR_BY_ID[id]?.hex ?? 'transparent' }}
              title={tAssessment(`psychoemotional.color.${id}`)}
              aria-label={tAssessment(`psychoemotional.color.${id}`)}
            />
          ))}
        </span>
        <Text as="span" variant="caption" className="font-semibold text-heading">
          {group.stable ? t('psychoInterpretation.mcvStable') : t('psychoInterpretation.mcvSplit')}
        </Text>
        <Text as="span" variant="caption" className="text-muted">
          · {t(`psycho.sign.${group.sign}`)}
        </Text>
      </div>
      <Text variant="body-sm" className="text-primary">{group.text}</Text>
    </article>
  );
}
