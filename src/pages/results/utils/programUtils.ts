export function formatCost(cost: number | null): string {
  if (cost === null) return 'Стоимость не указана';
  return `${cost.toLocaleString()} $/год`;
}

export function toDisplayString(value: unknown): string {
  if (value === null || value === undefined) return '—';
  if (typeof value !== 'object') return String(value);
  if (Array.isArray(value)) return value.map(toDisplayString).join(', ');
  const obj = value as Record<string, unknown>;
  const preferred = ['amount', 'value', 'score', 'level', 'min', 'conditions', 'name'];
  for (const field of preferred) {
    if (obj[field] !== undefined && obj[field] !== null) {
      const rest = obj.conditions !== undefined && field !== 'conditions'
        ? ` · ${String(obj.conditions)}`
        : '';
      return `${String(obj[field])}${rest}`;
    }
  }
  return Object.values(obj).filter(v => v !== null && v !== undefined).map(String).join(' · ') || '—';
}
