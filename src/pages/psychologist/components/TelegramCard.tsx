import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { telegramApi, telegramKeys } from '@/shared/api/telegram';
import { Button, buttonClasses } from '@/shared/ui/Button';
import { Text } from '@/shared/ui/typography';

const PANEL = 'rd-psych-panel bg-surface border border-strong rounded-[10px]';

/**
 * Call reminders in Telegram, a day and an hour before. Hidden until the
 * bot is set up on the server (`enabled: false`). The link comes back from
 * the API, so it opens on a second click — a tab opened after a request is
 * blocked as a popup. The state is re-read when the tab gets focus back,
 * after «Старт» in Telegram.
 */
export function TelegramCard() {
  const { t } = useTranslation('psychologist');
  const queryClient = useQueryClient();
  const state = useQuery({ queryKey: telegramKeys.me, queryFn: telegramApi.me, refetchOnWindowFocus: true });
  const [url, setUrl] = useState<string | null>(null);
  const refresh = () => void queryClient.invalidateQueries({ queryKey: telegramKeys.me });
  const link = useMutation({ mutationFn: telegramApi.link, onSuccess: setUrl });
  const unlink = useMutation({
    mutationFn: telegramApi.unlink,
    onSuccess: () => {
      setUrl(null);
      refresh();
    },
  });

  if (!state.data?.enabled) return null;
  const linked = state.data.linked;

  return (
    <section className={`${PANEL} px-6 py-5 flex flex-wrap items-center justify-between gap-4`}>
      <div className="min-w-0 max-w-[60ch]">
        <Text as="h2" variant="body-lg" className="font-semibold text-heading m-0">
          {t('calls.telegram.title')}
        </Text>
        <Text variant="body-sm" className="text-muted mt-1 mb-0">
          {linked ? t('calls.telegram.on') : url ? t('calls.telegram.opened') : t('calls.telegram.off')}
        </Text>
        {(link.isError || unlink.isError) && (
          <div role="alert">
            <Text variant="body-sm" className="text-danger mt-1 mb-0">
              {t('calls.telegram.error')}
            </Text>
          </div>
        )}
      </div>
      {linked ? (
        <Button variant="ghost" size="sm" onClick={() => unlink.mutate()} disabled={unlink.isPending}>
          {t('calls.telegram.disconnect')}
        </Button>
      ) : url ? (
        <a href={url} target="_blank" rel="noopener noreferrer" className={buttonClasses({ size: 'sm' })}>
          {t('calls.telegram.connect')}
        </a>
      ) : (
        <Button size="sm" onClick={() => link.mutate()} disabled={link.isPending}>
          {t('calls.telegram.connect')}
        </Button>
      )}
    </section>
  );
}
