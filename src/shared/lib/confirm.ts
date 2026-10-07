import { create } from 'zustand';

export interface ConfirmOptions {
  title: string;
  body?: string;
  confirmLabel: string;
  cancelLabel: string;
}

interface ConfirmRequest extends ConfirmOptions {
  resolve: (ok: boolean) => void;
}

interface ConfirmState {
  request: ConfirmRequest | null;
}

export const useConfirmStore = create<ConfirmState>(() => ({ request: null }));

/**
 * Промис-замена `window.confirm` для кода без своего state (хуки, обработчики
 * вне компонента). Рисует его единственный <ConfirmHost /> в App. Новый вызов
 * поверх открытого закрывает предыдущий как «Отмена» — так же, как один
 * нативный confirm не может висеть поверх другого.
 */
export function confirm(options: ConfirmOptions): Promise<boolean> {
  return new Promise((resolve) => {
    useConfirmStore.getState().request?.resolve(false);
    useConfirmStore.setState({ request: { ...options, resolve } });
  });
}

export function settleConfirm(ok: boolean) {
  const { request } = useConfirmStore.getState();
  if (!request) return;
  useConfirmStore.setState({ request: null });
  request.resolve(ok);
}
