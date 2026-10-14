import { useTranslation } from 'react-i18next';
import { homePathForUser } from '@/shared/lib/homePath';
import { useAuthStore } from '@/shared/store/auth';
import { JourneyCheckpoint } from '@/shared/ui/redesign/JourneyCheckpoint';

/**
 * Last-resort crash screen, shared by the route tree's `errorElement` and the
 * top-level `ErrorBoundary`. Works outside the router and the query client.
 * Both actions do a full page load on purpose: after an unexpected error the
 * in-memory state is suspect.
 */
export function ErrorScreen({ error }: { error?: unknown }) {
  const { t } = useTranslation('common');

  const goHome = () => {
    const { token, user } = useAuthStore.getState();
    window.location.replace(token ? homePathForUser(user) : '/');
  };

  return (
    <JourneyCheckpoint
      title={t('errorBoundary.title')}
      body={t('errorBoundary.body')}
      illustration="rest"
      actions={<>
        <button type="button" className="rd-button rd-button-outline" onClick={goHome}>{t('goHome')}</button>
        <button type="button" className="rd-button" onClick={() => window.location.reload()}>{t('reloadPage')}</button>
      </>}
    >
      {import.meta.env.DEV && error instanceof Error && (
        <pre className="overflow-auto whitespace-pre-wrap text-left text-danger">{error.message}</pre>
      )}
    </JourneyCheckpoint>
  );
}
