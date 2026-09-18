import { useState } from 'react';
import type {
  BinaryScaleEvidence,
  PairScaleEvidence,
  RatedScaleEvidence,
  RoleEvidence,
} from '@/shared/types';

/**
 * "Почему такой результат" real-answers evidence — the psychologist-report
 * counterpart of `InterestTypeDetail`'s `AnswerDistribution`/`LevelMeter` on
 * the student's own /result (`pages/results/components/InterestTypeDetail.tsx`).
 * Until now every `PsychDetailCard`'s `why` here was a one-sentence restating
 * of the raw score ("Ученик набрал X из Y баллов…") — this renders the
 * actual answers that score is made of, same idea, four shapes for the four
 * answer formats the 6 new tests use (binary Да/Нет, 0-4 rated, forced-choice
 * pair pick, ipsative points).
 */

const YES_COLOR = 'var(--pine)';
const NO_COLOR = 'var(--clay)';
const NEUTRAL_COLOR = 'var(--mute)';
const RATED_COLORS = [
  YES_COLOR,
  'color-mix(in srgb, var(--pine) 50%, var(--bg-raised))',
  'var(--border)',
  'color-mix(in srgb, var(--clay) 50%, var(--bg-raised))',
  NO_COLOR,
];

interface Segment {
  count: number;
  color: string;
  label: string;
}

function EvidenceBar({ segments }: { segments: Segment[] }) {
  const withCounts = segments.filter((s) => s.count > 0);
  return (
    <div className="flex flex-col gap-1.5">
      <div
        className="flex h-3 rounded-[4px] overflow-hidden gap-0.5 bg-raised"
        role="img"
        aria-label={segments.map((s) => `${s.label}: ${s.count}`).join(', ')}
      >
        {withCounts.map((s, i) => (
          <span key={i} className="h-full" style={{ flex: s.count, background: s.color }} />
        ))}
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        {segments.map((s, i) => (
          <span key={i} className="inline-flex items-center gap-1.5 text-caption text-muted">
            <span className="w-2 h-2 rounded-[2px] flex-shrink-0" style={{ background: s.color }} aria-hidden="true" />
            {s.label}: <span className="font-mono text-primary font-semibold">{s.count}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

interface TaggedItem {
  text: string;
  tag: string;
  tagColor: string;
}

// Below this count, the list is short enough to show in full — above it,
// collapsed by default (mirrors RIASEC's own restraint about not dumping
// every one of dozens of statements onto the card at once).
const COLLAPSE_THRESHOLD = 8;

function EvidenceItemList({ items }: { items: TaggedItem[] }) {
  const [expanded, setExpanded] = useState(items.length <= COLLAPSE_THRESHOLD);
  const visible = expanded ? items : items.slice(0, COLLAPSE_THRESHOLD);

  return (
    <div className="flex flex-col gap-1.5">
      <ul className="m-0 p-0 list-none flex flex-col gap-1">
        {visible.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-caption leading-snug">
            <span
              className="flex-shrink-0 px-1.5 rounded-[4px] font-mono font-semibold whitespace-nowrap"
              style={{ background: `color-mix(in srgb, ${item.tagColor} 18%, transparent)`, color: item.tagColor }}
            >
              {item.tag}
            </span>
            <span className="text-muted">{item.text}</span>
          </li>
        ))}
      </ul>
      {items.length > COLLAPSE_THRESHOLD && (
        <button
          type="button"
          onClick={() => setExpanded((current) => !current)}
          className="self-start text-caption font-semibold text-brand hover:opacity-70 bg-transparent border-none cursor-pointer p-0"
        >
          {expanded ? 'Свернуть' : `Показать все ответы (${items.length})`}
        </button>
      )}
    </div>
  );
}

export function BinaryEvidenceView({
  evidence,
  yesLabel = 'Да',
  noLabel = 'Нет',
}: {
  evidence: BinaryScaleEvidence;
  yesLabel?: string;
  noLabel?: string;
}) {
  return (
    <div className="flex flex-col gap-2.5">
      <EvidenceBar
        segments={[
          { count: evidence.yes, color: YES_COLOR, label: yesLabel },
          { count: evidence.no, color: NO_COLOR, label: noLabel },
        ]}
      />
      <EvidenceItemList
        items={evidence.items.map((it) => ({
          text: it.text,
          tag: it.answer === 'yes' ? yesLabel : noLabel,
          tagColor: it.answer === 'yes' ? YES_COLOR : NO_COLOR,
        }))}
      />
    </div>
  );
}

export function RatedEvidenceView({
  evidence,
  valueLabels,
}: {
  evidence: RatedScaleEvidence;
  /** One label per distribution bucket (0..N) — defaults to the bare number. */
  valueLabels?: string[];
}) {
  const labels = valueLabels ?? evidence.distribution.map((_, i) => String(i));
  const colorFor = (value: number) => RATED_COLORS[value] ?? NEUTRAL_COLOR;
  return (
    <div className="flex flex-col gap-2.5">
      <EvidenceBar
        segments={evidence.distribution.map((count, i) => ({ count, color: colorFor(i), label: labels[i] }))}
      />
      <EvidenceItemList
        items={evidence.items.map((it) => ({
          text: it.text,
          tag: labels[it.value] ?? String(it.value),
          tagColor: colorFor(it.value),
        }))}
      />
    </div>
  );
}

export function PairEvidenceView({
  evidence,
  scaleLabel,
}: {
  evidence: PairScaleEvidence;
  scaleLabel: string;
}) {
  const notPicked = evidence.total - evidence.picked;
  return (
    <div className="flex flex-col gap-2.5">
      <EvidenceBar
        segments={[
          { count: evidence.picked, color: YES_COLOR, label: `Выбрал «${scaleLabel}»` },
          { count: notPicked, color: NEUTRAL_COLOR, label: 'Выбрал другой вариант' },
        ]}
      />
      <EvidenceItemList
        items={evidence.items.map((it) => ({
          text: it.text,
          tag: it.picked ? 'Выбрано' : '—',
          tagColor: it.picked ? YES_COLOR : NEUTRAL_COLOR,
        }))}
      />
    </div>
  );
}

export function RoleEvidenceView({ evidence }: { evidence: RoleEvidence }) {
  return (
    <EvidenceItemList
      items={evidence.items.map((it) => ({
        text: it.text,
        tag: `Блок ${it.block}: ${it.points}`,
        tagColor: it.points > 0 ? YES_COLOR : NEUTRAL_COLOR,
      }))}
    />
  );
}
