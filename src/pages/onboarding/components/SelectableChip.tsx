/** The onboarding pill. Per spec, selection is marked with a dawn border
 *  (not a fill), unselected chips sit on a plain hairline border.
 *  Deliberately neutral: never colored to imply "good"/"bad" — step 2's easy
 *  vs. struggle columns rely on both sides looking identical.
 *
 *  Shared by the subject groups and the exam picker so the two chip rows on
 *  that screen can't drift apart visually.
 */
export interface SelectableChipProps {
  label: string;
  selected: boolean;
  onClick: () => void;
  /** Already chosen in a sibling group where the same value can't mean two
   *  things at once (e.g. a subject marked both "легко" and "трудно"). */
  disabled?: boolean;
  disabledTitle?: string;
}

export function SelectableChip({
  label, selected, onClick, disabled, disabledTitle,
}: SelectableChipProps) {
  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      aria-disabled={disabled}
      aria-pressed={selected}
      title={disabled ? disabledTitle : undefined}
      className="px-3 py-1.5 rounded-pill text-small font-medium transition-colors disabled:cursor-not-allowed"
      style={{
        background: 'var(--bg-surface)',
        color: disabled ? 'var(--mute)' : selected ? 'var(--midnight)' : 'var(--ink)',
        border: selected ? '1.5px solid var(--dawn)' : '1.5px solid var(--line)',
        opacity: disabled ? 0.45 : 1,
      }}
    >
      {label}
    </button>
  );
}
