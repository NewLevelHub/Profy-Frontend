import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { PSYCHO_COLOR_BY_ID } from '@/shared/config/psychoColors';
import { cn } from '@/shared/lib/cn';
import type {
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
 * how far to trust the run, the main signals, a paragraph per index, the
 * colour pair of each functional group and the first-vs-last root conflict.
 * The texts arrive from the backend catalog
 * already in the viewer's locale; only the headings are i18n keys here.
 * Shared by the psychologist report card and the specialist block on /result.
 */
export function PsychoEmotionalInterpretation({ interpretation, className }: PsychoEmotionalInterpretationProps) {
  const { t } = useTranslation('psychologist');
  if (!interpretation) return null;
  const { reading, highlights, indices, positions } = interpretation;
  if (!reading.length && !highlights.length && !indices.length && !positions.length) return null;

  return (
    <section className={cn('flex flex-col gap-3', className)} aria-label={t('psychoInterpretation.title')}>
      <Text as="h4" variant="body-sm" className="font-semibold text-primary">
        {t('psychoInterpretation.title')}
      </Text>

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

      {indices.length > 0 && (
        <Block title={t('psychoInterpretation.indices')}>
          <div className="flex flex-col gap-2">
            {indices.map((note) => (
              <div key={note.metric}>
                <Text as="span" variant="caption" className="font-semibold text-secondary">
                  {t(`psychoResult.${note.metric}`)} · {t(`psycho.level.${note.metric}.${note.level}`)}
                </Text>
                <Text variant="body-sm" className="text-primary">{note.text}</Text>
              </div>
            ))}
          </div>
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
    <div className="flex flex-col gap-1">
      <span className="flex items-center gap-2">
        <span className="font-mono text-primary">{SIGN_GLYPH[note.sign]}</span>
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
        <Text as="span" variant="caption" className="font-semibold text-secondary">{label}</Text>
      </span>
      <Text variant="body-sm" className="text-primary">{note.text}</Text>
    </div>
  );
}
