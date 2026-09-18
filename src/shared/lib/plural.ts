/**
 * Russian plural form for a count: 1 вопрос / 2 вопроса / 5 вопросов.
 *
 * Admin lists print a count next to almost every filter bar, and "5 вопрос"
 * reads as a bug in the data rather than in the copy.
 */
export function plural(n: number, one: string, few: string, many: string): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
  return many;
}

/** `plural` with the number prefixed: "314 вопросов". */
export function pluralize(n: number, one: string, few: string, many: string): string {
  return `${n} ${plural(n, one, few, many)}`;
}
