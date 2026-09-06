import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('StayOS App caught error:', error, errorInfo);
  }

  handleReset = () => {
    try {
      localStorage.clear();
      window.location.reload();
    } catch (e) {
      window.location.reload();
    }
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#f7f9fb] flex items-center justify-center p-6 text-[#191c1e] font-sans">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-[#c6c6cd]/50 p-8 text-center flex flex-col items-center">
            <div className="w-14 h-14 rounded-2xl bg-[#ffdad6] text-[#ba1a1a] flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-[32px]">warning</span>
            </div>
            <h1 className="text-xl font-bold text-[#191c1e] mb-2">Something went wrong</h1>
            <p className="text-sm text-[#45464d] mb-6 leading-relaxed">
              An unexpected display issue occurred. You can reload the page or reset cached property data to restore default configuration.
            </p>
            {this.state.error?.message && (
              <div className="w-full bg-[#f1f3f5] p-3 rounded-lg text-left text-xs font-mono text-[#ba1a1a] mb-6 overflow-x-auto max-h-28">
                {this.state.error.message}
              </div>
            )}
            <div className="flex gap-3 w-full">
              <button
                onClick={this.handleReload}
                className="flex-1 py-2.5 px-4 bg-[#eceef0] hover:bg-[#e2e5e8] text-[#191c1e] rounded-xl text-sm font-semibold transition-colors"
              >
                Reload Page
              </button>
              <button
                onClick={this.handleReset}
                className="flex-1 py-2.5 px-4 bg-[#0058be] hover:bg-[#00479e] text-white rounded-xl text-sm font-semibold transition-colors"
              >
                Reset Cache
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
