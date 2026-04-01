import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      let errorMessage = 'Ocorreu um erro inesperado.';
      
      try {
        // Check if it's a Firestore error JSON
        const parsedError = JSON.parse(this.state.error?.message || '');
        if (parsedError.error && parsedError.operationType) {
          errorMessage = `Erro no banco de dados (${parsedError.operationType}): ${parsedError.error}`;
          if (parsedError.error.includes('Missing or insufficient permissions')) {
            errorMessage = 'Você não tem permissão para realizar esta operação ou acessar estes dados.';
          }
        }
      } catch (e) {
        // Not a JSON error, use default or the error message
        if (this.state.error?.message) {
          errorMessage = this.state.error.message;
        }
      }

      return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
          <div className="bg-gray-800 border border-red-900/50 p-8 rounded-lg shadow-2xl max-w-md w-full text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-white mb-4">Ops! Algo deu errado</h2>
            <p className="text-gray-400 mb-6">{errorMessage}</p>
            <button
              onClick={() => window.location.reload()}
              className="w-full py-3 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded transition-colors"
            >
              RECARREGAR PÁGINA
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
