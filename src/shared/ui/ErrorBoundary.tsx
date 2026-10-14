import { Component, type ErrorInfo, type ReactNode } from 'react';
import { ErrorScreen } from '@/shared/ui/ErrorScreen';

interface State {
  error: Error | null;
}

/**
 * Catches what happens outside the route tree (providers, ConfirmHost).
 * Errors inside routes go to the router's own `errorElement` — RouteErrorPage.
 */
export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  render() {
    const { error } = this.state;
    return error ? <ErrorScreen error={error} /> : this.props.children;
  }
}
