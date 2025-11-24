import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import './ErrorBoundary.css';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null,
      isNetworkError: false
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Check if it's a network error
    const isNetworkError = 
      error.message?.includes('network') ||
      error.message?.includes('fetch') ||
      error.message?.includes('Firebase') ||
      !navigator.onLine;

    this.setState({
      error,
      errorInfo,
      isNetworkError
    });
  }

  handleReset = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null,
      isNetworkError: false
    });
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary-container">
          <div className="error-boundary-content glass-card">
            <div className="error-icon">
              <AlertTriangle size={80} color="#e74c3c" />
            </div>
            
            <h1 className="error-title">
              {this.state.isNetworkError ? 'Problème de Connexion' : 'Oups, une erreur !'}
            </h1>
            
            <p className="error-message">
              {this.state.isNetworkError 
                ? "Impossible de se connecter au serveur. Vérifiez votre connexion internet."
                : "Une erreur inattendue s'est produite."}
            </p>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="error-details">
                <summary>Détails techniques</summary>
                <pre>{this.state.error.toString()}</pre>
                {this.state.errorInfo && (
                  <pre>{this.state.errorInfo.componentStack}</pre>
                )}
              </details>
            )}

            <div className="error-actions">
              <button 
                className="btn btn-primary" 
                onClick={this.handleReset}
              >
                <RefreshCw size={20} />
                Réessayer
              </button>
              <button 
                className="btn btn-secondary" 
                onClick={this.handleGoHome}
              >
                <Home size={20} />
                Retour à l'accueil
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
