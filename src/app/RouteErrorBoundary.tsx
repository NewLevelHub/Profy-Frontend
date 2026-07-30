import { isRouteErrorResponse, useNavigate, useRouteError } from 'react-router';
import { ROUTES } from './routes';

/** router.tsx's errorElement — catches everything the App-level ErrorBoundary
 * (src/shared/ui/ErrorBoundary.tsx) can't: thrown Response()s from
 * loaders/actions, a failed route.lazy() chunk fetch (e.g. a stale deploy —
 * see comment below), and render errors thrown by a specific route's element
 * without tearing down the whole app shell (sidebar/header stay mounted,
 * only the routed content is replaced). The App-level boundary is the
 * last-resort net for errors this one can't see (e.g. thrown outside the
 * router tree entirely). */
export function RouteErrorBoundary() {
  const error = useRouteError();
  const navigate = useNavigate();

  const status = isRouteErrorResponse(error) ? error.status : null;
  const isChunkLoadError =
    error instanceof Error && /Failed to fetch dynamically imported module|Importing a module script failed/i.test(error.message);

  const title = status === 404
    ? 'Страница не найдена'
    : isChunkLoadError
      ? 'Доступна новая версия'
      : 'Что-то пошло не так';

  const message = status === 404
    ? 'Такой страницы не существует или она была перемещена.'
    : isChunkLoadError
      ? 'Приложение обновилось — обнови страницу, чтобы продолжить.'
      : 'Произошла непредвиденная ошибка. Попробуй обновить страницу.';

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-6 gap-5 text-center bg-page">
      <span className="text-5xl select-none" aria-hidden="true">{status === 404 ? '🧭' : '⚠️'}</span>
      <div className="flex flex-col gap-2">
        <h1 className="text-h1 font-extrabold text-primary">{title}</h1>
        <p className="text-body text-secondary max-w-sm">{message}</p>
      </div>
      {import.meta.env.DEV && error instanceof Error && !isChunkLoadError && (
        <pre className="max-w-lg w-full text-left text-small text-danger bg-raised rounded-xl p-4 overflow-auto border border-default">
          {error.message}
        </pre>
      )}
      <div className="flex flex-col sm:flex-row gap-3">
        {isChunkLoadError ? (
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-brand text-on-brand font-semibold rounded-pill text-base transition-opacity hover:opacity-80"
          >
            Обновить страницу
          </button>
        ) : (
          <button
            onClick={() => navigate(ROUTES.home)}
            className="px-6 py-3 bg-brand text-on-brand font-semibold rounded-pill text-base transition-opacity hover:opacity-80"
          >
            На главную
          </button>
        )}
      </div>
    </div>
  );
}
