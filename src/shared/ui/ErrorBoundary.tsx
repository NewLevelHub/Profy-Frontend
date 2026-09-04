import { Component, type ErrorInfo, type ReactNode } from 'react';
import { i18n } from '@/shared/i18n';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;
    if (this.props.fallback) return this.props.fallback;

    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 gap-6 text-center bg-page">
        <span className="text-5xl select-none" aria-hidden="true">💥</span>
        <div className="flex flex-col gap-2">
          <h1 className="text-h1 font-extrabold text-primary">
            {i18n.t('common:errorBoundary.title')}
          </h1>
          <p className="text-body text-secondary max-w-xs">
            {i18n.t('common:errorBoundary.body')}
          </p>
        </div>
        {import.meta.env.DEV && (
          <pre className="max-w-lg w-full text-left text-small text-danger bg-raised rounded-xl p-4 overflow-auto border border-default">
            {error.message}
          </pre>
        )}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-brand text-on-brand font-semibold rounded-pill text-base transition-opacity hover:opacity-80"
          >
            {i18n.t('common:reloadPage')}
          </button>
          <button
            onClick={() => {
              this.setState({ error: null });
              window.location.replace('/results');
            }}
            className="px-6 py-3 bg-transparent text-brand font-semibold rounded-pill text-base border border-default transition-colors hover:bg-raised"
          >
            {i18n.t('common:goHome')}
          </button>
        </div>
      </div>
    );
  }
}
