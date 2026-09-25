import { settleConfirm, useConfirmStore } from '@/shared/lib/confirm';
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog';

/** Единственная точка отрисовки для `confirm()` из `@/shared/lib/confirm`. */
export function ConfirmHost() {
  const request = useConfirmStore((s) => s.request);
  return (
    <ConfirmDialog
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
