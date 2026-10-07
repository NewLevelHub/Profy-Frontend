import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { buildPatchBody } from '@/shared/lib/adminPatch';
import { useUnsavedGuard } from '@/shared/lib/useUnsavedGuard';
import type { SaveState } from '@/shared/ui/admin/AdminSaveBar';

interface UseAdminFormOptions<TForm extends object, TDetail> {
  /** Server state mapped into form state — the baseline "unchanged" value. */
  initial: TForm | null;
  keys: readonly (keyof TForm)[];
  /** Human names per key, used by the save bar to say what is about to change. */
  /** Field → i18n key (KZ-202): the caller's map is an index, the wording is in
      the catalog. Resolved here, where the hook already has `t`. */
  labels: Partial<Record<keyof TForm, string>>;
  onSave: (patch: Partial<TForm>) => Promise<TDetail>;
  /** Re-derives form state from the server's response after a successful save. */
  toForm: (detail: TDetail) => TForm;
  errorMessage?: string;
}

/**
 * Shared edit-form state for admin detail screens: draft vs. baseline, the
 * PATCH body, dirty tracking, reset, save, and the leave-page guard.
 *
 * Every detail page hand-rolled this before PRO-242 — five `useState` pairs,
 * a `buildPatchBody` call duplicated for `isDirty` and again inside the save
 * handler, and a save result string that never cleared. Two of them computed
 * the patch twice per render.
 *
 * `buildPatchBody` sends only changed keys on purpose: on these endpoints every
 * key present in the PATCH is locked against the automated content re-sync, so
 * posting the whole form would silently lock every field forever after one
 * edit. `changedLabels` exists so the UI can name that consequence.
 */
export function useAdminForm<TForm extends object, TDetail>({
  initial,
  keys,
  labels,
  onSave,
  toForm,
  errorMessage,
}: UseAdminFormOptions<TForm, TDetail>) {
  const { t } = useTranslation('admin');
  const [baseline, setBaseline] = useState<TForm | null>(initial);
  const [form, setForm] = useState<TForm | null>(initial);
  const [saving, setSaving] = useState(false);
  const [state, setState] = useState<SaveState>({ kind: 'idle' });

  // The detail request resolves after mount, so seed both copies the first
  // time real data arrives (and whenever the route switches to another row).
  const [seeded, setSeeded] = useState<TForm | null>(initial);
  if (initial !== seeded) {
    setSeeded(initial);
    setBaseline(initial);
    setForm(initial);
    setState({ kind: 'idle' });
  }

  const patch = useMemo(
    () => (baseline && form ? buildPatchBody(baseline, form, keys) : ({} as Partial<TForm>)),
    [baseline, form, keys],
  );

  const changedKeys = Object.keys(patch) as (keyof TForm)[];
  const dirty = changedKeys.length > 0;

  useUnsavedGuard(dirty);

  const changedLabels = changedKeys.map((key) => {
    const labelKey = labels[key];
    return labelKey ? t(labelKey) : String(key);
  });

  const setField = useCallback(<K extends keyof TForm>(key: K, value: TForm[K]) => {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
  }, []);

  const reset = useCallback(() => {
    setForm(baseline);
    setState({ kind: 'idle' });
  }, [baseline]);

  const save = useCallback(
    async (override?: Partial<TForm>) => {
      if (!dirty && !override) return;
      setSaving(true);
      setState({ kind: 'idle' });
      try {
        const updated = await onSave(override ?? patch);
        const next = toForm(updated);
        setBaseline(next);
        setForm(next);
        setState({ kind: 'saved' });
      } catch (error) {
        setState({
          kind: 'error',
          message: error instanceof Error && error.message ? error.message : (errorMessage ?? t('form.saveError')),
        });
      } finally {
        setSaving(false);
      }
    },
    [dirty, onSave, patch, toForm, errorMessage, t],
  );

  return { form, setForm, setField, patch, dirty, changedKeys, changedLabels, saving, state, reset, save };
}
