import { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      const err = this.state.error;
      const showDetails = import.meta.env.DEV && err;

      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#f8f9fa',
          padding: '20px',
        }}>
          <div style={{
            textAlign: 'center',
            maxWidth: '500px',
            padding: '48px',
            backgroundColor: 'white',
            borderRadius: '16px',
            boxShadow: '0 4px 24px rgba(0,0,0,0.1)',
          }}>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>⚠️</div>
            <h1 style={{ fontSize: '24px', color: '#1a1a2e', marginBottom: '12px' }}>
              Something went wrong
            </h1>
            <p style={{ color: '#666', marginBottom: '24px', lineHeight: '1.6' }}>
              An unexpected error occurred. Please try refreshing the page.
            </p>
            {showDetails && (
              <pre style={{
                textAlign: 'left',
                fontSize: '12px',
                color: '#b91c1c',
                backgroundColor: '#fef2f2',
                padding: '12px',
                borderRadius: '8px',
                overflow: 'auto',
                maxHeight: '240px',
                marginBottom: '24px',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              }}
              >
                {err?.message}
                {err?.stack ? `\n\n${err.stack}` : ''}
              </pre>
            )}
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: '12px 32px',
                fontSize: '16px',
                backgroundColor: '#6C63FF',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
              }}
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
