import { settleConfirm, useConfirmStore } from '@/shared/lib/confirm';
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog';

/** Единственная точка отрисовки для `confirm()` из `@/shared/lib/confirm`. */
export function ConfirmHost() {
  const request = useConfirmStore((s) => s.request);
  const adminTarget = document.getElementById('admin-overlays');
  return (
    <ConfirmDialog
      portalTarget={adminTarget}
      className={adminTarget ? 'rd-admin-dialog' : undefined}
      open={request !== null}
      title={request?.title ?? ''}
      body={request?.body}
      confirmLabel={request?.confirmLabel ?? ''}
      cancelLabel={request?.cancelLabel ?? ''}
      onConfirm={() => settleConfirm(true)}
      onCancel={() => settleConfirm(false)}
    />
  );
}
