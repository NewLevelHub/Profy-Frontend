import { useCallback, useState } from 'react';
import type { SaveState } from '@/shared/ui/admin/AdminSaveBar';

interface UseContentOverrideDraftOptions<T> {
  /** The bilingual draft recomputed by the caller whenever schema/override
   *  queries resolve — `null` while still loading. */
  seed: T | null;
  onSave: (draft: T) => Promise<unknown>;
}

/**
 * Baseline/draft/dirty/save/reset state machine shared by the Belbin
 * content-override editor (PRO-424) and the АСТУР bank-version draft editor
 * (PRO-427).
 *
 * Unlike `useAdminForm` (per-field PATCH + bank-lock semantics for
 * questions/directions/etc.), these editors round-trip a full bilingual
 * bank tree on every save — there is nothing to diff per field, so "dirty"
 * is just "draft differs from baseline" by value.
 */
export function useContentOverrideDraft<T>({ seed, onSave }: UseContentOverrideDraftOptions<T>) {
  const [baseline, setBaseline] = useState<T | null>(null);
  const [draft, setDraft] = useState<T | null>(null);
  const [seeded, setSeeded] = useState<T | null>(null);
  const [saving, setSaving] = useState(false);
  const [state, setState] = useState<SaveState>({ kind: 'idle' });

  // The schema/override requests resolve after mount — seed both copies the
  // first time real data arrives, same idiom as `useAdminForm`.
  if (seed !== seeded) {
    setSeeded(seed);
    setBaseline(seed);
    setDraft(seed);
    setState({ kind: 'idle' });
  }

  const dirty = draft !== null && baseline !== null && JSON.stringify(draft) !== JSON.stringify(baseline);

  const reset = useCallback(() => {
    setDraft(baseline);
    setState({ kind: 'idle' });
  }, [baseline]);

  const save = useCallback(async () => {
    if (!draft || !dirty) return;
    setSaving(true);
    setState({ kind: 'idle' });
    try {
      await onSave(draft);
      setBaseline(draft);
      setState({ kind: 'saved' });
    } catch (error) {
      setState({
        kind: 'error',
        message: error instanceof Error && error.message ? error.message : 'Не удалось сохранить изменения',
      });
    } finally {
      setSaving(false);
    }
  }, [draft, dirty, onSave]);

  return { draft, setDraft, dirty, saving, state, reset, save };
}
