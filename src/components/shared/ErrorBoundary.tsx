import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.hash = '';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[500px] w-full flex items-center justify-center p-6 bg-slate-50">
          <div className="max-w-lg w-full bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center animate-in fade-in duration-200">
            <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-[32px]">error_outline</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-1">
              {this.props.fallbackTitle || 'Something went wrong in this view'}
            </h2>
            <p className="text-sm text-slate-500 mb-4">
              {this.state.error?.message || 'An unexpected rendering error occurred while loading this section.'}
            </p>
            {this.state.error?.stack && (
              <pre className="text-left text-[11px] font-mono bg-slate-100 text-slate-700 p-3 rounded-lg max-h-36 overflow-auto mb-6">
                {this.state.error.message}
              </pre>
            )}
            <div className="flex gap-3 justify-center">
              <button
                onClick={this.handleReset}
                className="px-4 py-2 text-xs font-semibold text-white bg-[#4472C4] hover:bg-[#365cb5] rounded-lg shadow-sm transition-colors cursor-pointer"
              >
                Reload Component
              </button>
              <button
                onClick={() => {
                  window.location.reload();
                }}
                className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
              >
                Refresh App
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
