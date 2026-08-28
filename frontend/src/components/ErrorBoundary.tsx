import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  isChunkError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    isChunkError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    const message = error?.message || '';
    const isChunkError =
      message.includes('dynamically imported module') ||
      message.includes('Loading chunk') ||
      message.includes('Importing a module script failed') ||
      message.includes('error loading dynamically imported module');

    return { hasError: true, isChunkError, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);

    const message = error?.message || '';
    const isChunkError =
      message.includes('dynamically imported module') ||
      message.includes('Loading chunk') ||
      message.includes('Importing a module script failed') ||
      message.includes('error loading dynamically imported module');

    if (isChunkError) {
      const lastReload = sessionStorage.getItem('error_boundary_chunk_reload');
      const now = Date.now();
      if (!lastReload || now - parseInt(lastReload, 10) > 10000) {
        sessionStorage.setItem('error_boundary_chunk_reload', String(now));
        // Auto reload after 200ms to seamlessly load latest deployment bundles
        setTimeout(() => {
          window.location.reload();
        }, 200);
      }
    }
  }

  public render() {
    if (this.state.hasError) {
      if (this.state.isChunkError) {
        return (
          <div className="min-h-screen bg-darkroom-bg text-slate-200 flex flex-col items-center justify-center p-8 select-none">
            <div className="max-w-md space-y-4 text-center">
              <div className="size-12 rounded-2xl bg-blue-500/20 text-blue-400 mx-auto flex items-center justify-center text-xl font-bold border border-blue-500/30 animate-pulse">
                ⚡
              </div>
              <h1 className="text-2xl font-serif font-bold text-white">Updating to Latest Build...</h1>
              <p className="text-sm text-slate-400">
                A new version of Screened was deployed. Refreshing assets to give you the newest tools...
              </p>
              <button
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 rounded-xl text-white font-medium text-xs font-mono transition-all cursor-pointer shadow-lg shadow-blue-950/50"
                onClick={() => window.location.reload()}
              >
                Refresh Now
              </button>
            </div>
          </div>
        );
      }

      return (
        <div className="min-h-screen bg-darkroom-bg text-slate-200 flex flex-col items-center justify-center p-8">
          <div className="max-w-md space-y-4">
            <h1 className="text-3xl font-serif font-bold text-rose-500">Something went wrong.</h1>
            <p className="text-slate-400">An unexpected error occurred in the application.</p>
            <div className="p-4 bg-darkroom-surface border border-darkroom-border rounded-xl text-sm font-mono overflow-auto text-rose-300">
              {this.state.error?.message}
            </div>
            <button
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-xl text-white font-medium cursor-pointer transition-colors"
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
