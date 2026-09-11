import { useCallback, useState } from 'react';
import { adminApi } from '@/shared/api/admin';
import type { AdminContentResource } from '@/shared/api/endpoints';
import type { AdminFieldRevert } from '@/shared/ui/admin/AdminField';
import type { AdminOverrides } from '@/shared/types';

interface Options<T> {
  resource: AdminContentResource;
  id: string | undefined;
  /** Overrides of the row as it is stored — not of the unsaved draft. */
  overrides: AdminOverrides;
  /** True while the form holds unsaved edits. Reverting reloads the row from
   *  the server and re-seeds the form, which would silently discard them. */
  dirty: boolean;
  onReverted: (detail: T) => void;
}

/**
 * "Вернуть исходное" for question-bank content.
 *
 * A PATCH here records an override that every deploy's seed re-sync composes
 * back over the bank, so before PRO-262 an accidental edit was permanent and
 * reachable only by hand in the database. `DELETE .../overrides/{field}`
 * restores the value the bank held when the field was first edited — right
 * away, not at the next deploy.
 *
 * Reverting is blocked while the form is dirty rather than warning after the
 * fact: the response re-seeds the whole form, so an unsaved edit to another
 * field would vanish without anything having said so.
 */
export function useOverrideRevert<T extends { overrides: AdminOverrides }>({
  resource,
  id,
  overrides,
  dirty,
  onReverted,
}: Options<T>) {
  const [pendingField, setPendingField] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const revert = useCallback(
    async (field?: string) => {
      if (!id) return;
      setPendingField(field ?? '*');
      setError('');
      setNotice('');
      try {
        const detail = await adminApi.clearContentOverrides<T>(resource, id, field);
        onReverted(detail);
        setNotice(
          field ? 'Значение из контент-банка возвращено.' : 'Все правки сняты, строка снова из банка.',
        );
      } catch {
        setError(
          field
            ? 'Не удалось вернуть исходное значение'
            : 'Не удалось снять правки',
        );
      } finally {
        setPendingField(null);
      }
    },
    [resource, id, onReverted],
  );

  /** Props for one `AdminField`, or undefined when the field is untouched. */
  const fieldRevert = useCallback(
    (field: string): AdminFieldRevert | undefined => {
      const entry = overrides[field];
      if (!entry) return undefined;
      return {
        bankValue: entry.bank_value,
        bankValueKnown: entry.bank_value_known,
        pending: pendingField === field,
        disabledReason: dirty
          ? 'Сначала сохраните или сбросьте черновик — возврат перечитывает строку с сервера.'
          : undefined,
        onRevert: () => void revert(field),
      };
    },
    [overrides, pendingField, dirty, revert],
  );

  return {
    fieldRevert,
    revertAll: () => void revert(),
    revertingAll: pendingField === '*',
    error,
    notice,
  };
}
