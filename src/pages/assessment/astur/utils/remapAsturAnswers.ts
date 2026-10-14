import type { AsturContentSubtest, AsturItemAnswer } from '@/shared/types';

type ServedItem = AsturContentSubtest['items'][number];

/** The item's choosable strings. The server serves them in the same order
 *  in every language (the shuffle is seeded by run and item only), so a
 *  position means the same choice in ru and kk. */
function choices(item: ServedItem): readonly string[] | null {
  const lists = item as Partial<Record<'options' | 'words' | 'concepts', string[]>>;
  return lists.options ?? lists.words ?? lists.concepts ?? null;
}

/** One item's in-progress value, carried over to the same item served in
 *  another language: a picked string becomes the one at the same position.
 *  Free text, numbers and figure letters are kept as they are. */
function remapValue(from: ServedItem | undefined, to: ServedItem | undefined, value: unknown): unknown {
  const source = from && choices(from);
  const target = to && choices(to);
  if (!source || !target) return value;
  const carry = (picked: unknown) => {
    if (typeof picked !== 'string') return picked;
    const index = source.indexOf(picked);
    return index >= 0 && index < target.length ? target[index] : picked;
  };
  return Array.isArray(value) ? value.map(carry) : carry(value);
}

/** Values keyed by 1-based item position, after a language switch served
 *  the same subtest again in the other language. */
export function remapAsturValues(
  from: AsturContentSubtest,
  to: AsturContentSubtest,
  values: Record<string, unknown>,
): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(values).map(([position, value]) => {
      const index = Number(position) - 1;
      return [position, remapValue(from.items[index], to.items[index], value)];
    }),
  );
}

/** Same as `remapAsturValues`, for answers already committed as answered/skipped. */
export function remapAsturAnswers(
  from: AsturContentSubtest,
  to: AsturContentSubtest,
  answers: Record<string, AsturItemAnswer>,
): Record<string, AsturItemAnswer> {
  return Object.fromEntries(
    Object.entries(answers).map(([position, answer]): [string, AsturItemAnswer] => {
      if (answer.status === 'skipped') return [position, answer];
      const index = Number(position) - 1;
      return [position, { status: 'answered', value: remapValue(from.items[index], to.items[index], answer.value) }];
    }),
  );
}
