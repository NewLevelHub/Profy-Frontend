import { useCallback, useState } from 'react';
import { adminApi } from '@/shared/api/admin';
import type { AdminFieldRevert } from '@/shared/ui/admin/AdminField';

/**
 * "Вернуть под автообновление" for universities and programs.
 *
 * Deliberately not the same promise as the question-bank revert. A content
 * override stores the value it replaced, so undoing it puts the old text back
 * immediately. A university lock stores only the field's NAME — the previous
 * value was never recorded anywhere — so releasing it restores nothing by
 * itself: it makes the field eligible for the next seed run to overwrite,
 * which is the only recovery path a lock has ever had. The copy says exactly
 * that instead of implying an undo.
 *
 * Blocked while the form is dirty for the same reason as the content revert:
 * the response re-seeds the form and would discard unsaved edits silently.
 */
export function useLockRelease<T extends { admin_locked_fields: string[] }>({
  kind,
  id,
  lockedFields,
  dirty,
  onReleased,
}: {
  kind: 'university' | 'program';
  id: string | undefined;
  lockedFields: readonly string[];
  dirty: boolean;
  onReleased: (detail: T) => void;
}) {
  const [pendingField, setPendingField] = useState<string | null>(null);
  const [error, setError] = useState('');

  const release = useCallback(
    async (field?: string) => {
      if (!id) return;
      setPendingField(field ?? '*');
      setError('');
      try {
        const detail =
          kind === 'university'
            ? await adminApi.unlockUniversityFields(id, field)
            : await adminApi.unlockProgramFields(id, field);
        onReleased(detail as unknown as T);
      } catch {
        setError('Не удалось вернуть поле под автообновление');
      } finally {
        setPendingField(null);
      }
    },
    [kind, id, onReleased],
  );

  const fieldRelease = useCallback(
    (field: string): AdminFieldRevert | undefined => {
      if (!lockedFields.includes(field)) return undefined;
      return {
        // Always false here: a lock never carried a previous value, so the
        // control must never promise to put one back.
        bankValueKnown: false,
        label: 'Вернуть под автообновление',
        description:
          'Значение останется как есть — прежнее нигде не сохранялось. Поле снова сможет быть перезаписано сид-скриптом на ближайшем деплое.',
        pending: pendingField === field,
        disabledReason: dirty
          ? 'Сначала сохраните или сбросьте черновик — снятие перечитывает строку с сервера.'
          : undefined,
        onRevert: () => void release(field),
      };
    },
    [lockedFields, pendingField, dirty, release],
  );

  return {
    fieldRelease,
    releaseAll: () => void release(),
    releasingAll: pendingField === '*',
    error,
  };
}
