import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 text-slate-200 flex flex-col items-center justify-center p-8">
          <div className="max-w-md space-y-4">
            <h1 className="text-3xl font-serif font-bold text-rose-500">Something went wrong.</h1>
            <p className="text-slate-400">An unexpected error occurred in the application.</p>
            <div className="p-4 bg-slate-800 rounded text-sm font-mono overflow-auto text-rose-300">
              {this.state.error?.message}
            </div>
            <button
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded text-white font-medium"
              onClick={() => window.location.reload()}
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
