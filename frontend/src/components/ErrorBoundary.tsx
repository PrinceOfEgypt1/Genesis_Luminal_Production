/**
 * ErrorBoundary para captura e tratamento de erros na aplicação
 */

import React, { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: string | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null 
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Atualiza o state para mostrar a UI de erro
    return { 
      hasError: true, 
      error, 
      errorInfo: null 
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log do erro para monitoramento
    console.error('ErrorBoundary capturou um erro:', error, errorInfo);
    
    this.setState({
      hasError: true,
      error,
      errorInfo: (errorInfo?.componentStack ?? null)
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div 
          role="alert" 
          aria-live="assertive"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            padding: '2rem',
            backgroundColor: '#0a0015',
            color: 'white',
            fontFamily: '"Segoe UI", system-ui, -apple-system, sans-serif',
            textAlign: 'center'
          }}
        >
          <div style={{
            maxWidth: '600px',
            padding: '2rem',
            borderRadius: '16px',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <h1 style={{
              fontSize: '2rem',
              marginBottom: '1rem',
              color: '#ff6b6b'
            }}>
              🚨 Erro na Consciência Digital
            </h1>
            
            <p style={{
              fontSize: '1.1rem',
              marginBottom: '1.5rem',
              opacity: 0.9
            }}>
              A entidade digital encontrou um erro inesperado e precisa reinicializar.
            </p>
            
            <details style={{
              marginBottom: '1.5rem',
              textAlign: 'left',
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
              padding: '1rem',
              borderRadius: '8px',
              fontSize: '0.9rem'
            }}>
              <summary style={{
                cursor: 'pointer',
                marginBottom: '0.5rem',
                fontWeight: 'bold'
              }}>
                Detalhes técnicos do erro
              </summary>
              
              <p><strong>Erro:</strong> {this.state.error?.message}</p>
              {this.state.errorInfo && (
                <pre style={{
                  whiteSpace: 'pre-wrap',
                  fontSize: '0.8rem',
                  opacity: 0.8
                }}>
                  {this.state.errorInfo}
                </pre>
              )}
            </details>
            
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: '0.75rem 1.5rem',
                fontSize: '1rem',
                backgroundColor: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'background-color 0.3s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#45a049'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#4CAF50'}
              onFocus={(e) => e.currentTarget.style.outline = '2px solid #81C784'}
              onBlur={(e) => e.currentTarget.style.outline = 'none'}
            >
              🔄 Reinicializar Consciência
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;