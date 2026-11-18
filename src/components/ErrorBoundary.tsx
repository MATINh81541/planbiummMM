/*
 * PlanBium global error boundary.
 *
 * Catches render-time crashes so the user never sees a white screen.
 * Shows a friendly translated message with a Reload button.
 */

import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { LocaleProvider, useLocale } from '@/lib/i18n/locale-context';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

function ErrorFallback() {
  const { t } = useLocale();
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="glass-surface rounded-glass-lg p-8 sm:p-12 text-center max-w-md w-full">
        <AlertTriangle size={48} className="mx-auto text-amber-500 mb-4" aria-hidden="true" />
        <h1 className="text-xl font-bold text-gray-900 mb-2">
          {t('errorBoundary.title')}
        </h1>
        <p className="text-gray-500 mb-6">
          {t('errorBoundary.description')}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center justify-center gap-2 font-semibold transition-all duration-300 ease-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-400 focus-visible:ring-offset-2 bg-gray-900 text-white hover:bg-gray-800 active:scale-[0.98] px-6 py-3 text-base rounded-glass"
        >
          <RefreshCw size={18} aria-hidden="true" />
          {t('errorBoundary.reload')}
        </button>
      </div>
    </div>
  );
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('PlanBium render crash:', error, info);
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <LocaleProvider>
        <ErrorFallback />
      </LocaleProvider>
    );
  }
}
