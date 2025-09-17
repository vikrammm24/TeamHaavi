import React from 'react';

type Props = { children: React.ReactNode };
type State = { hasError: boolean; error?: any; info?: any };

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, info: any) {
    // Log for diagnostics; avoid PII
    try {
      console.error('[ErrorBoundary]', error, info);
    } catch {}
    this.setState({ info });
  }

  render() {
    if (this.state.hasError) {
      const message = String(this.state.error?.message || this.state.error || 'An error occurred');
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center p-6">
          <div className="max-w-xl w-full bg-white/95 backdrop-blur rounded-xl shadow-2xl p-6 text-center">
            <h2 className="text-2xl font-bold text-red-700 mb-2">Something went wrong</h2>
            <p className="text-sm text-gray-700 break-words mb-4">{message}</p>
            <details className="text-left text-xs text-gray-600 whitespace-pre-wrap bg-gray-50 p-3 rounded border">
              {String(this.state.info?.componentStack || '')}
            </details>
            <button
              className="mt-4 inline-flex items-center justify-center px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
              onClick={() => this.setState({ hasError: false, error: undefined, info: undefined })}
            >
              Try again
            </button>
          </div>
        </div>
      );
    }
    return this.props.children as any;
  }
}

export default ErrorBoundary;
