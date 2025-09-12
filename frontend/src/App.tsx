import React, { useState } from 'react';
import { GenesisCore } from './components/GenesisCore';
import ErrorBoundary from './components/ErrorBoundary';
import './App.css';
import './styles.css';

function App() {
  const [statusMessage, setStatusMessage] = useState<string>('');

  // Função para atualizar mensagens de status para screen readers
  const updateStatus = (message: string) => {
    setStatusMessage(message);
    // Limpar mensagem após 5 segundos
    setTimeout(() => setStatusMessage(''), 5000);
  };

  return (
    <ErrorBoundary>
      {/* Skip link para navegação por teclado */}
      <a 
        href="#main-content" 
        className="skip-link"
        onClick={(e) => {
          e.preventDefault();
          const mainContent = document.getElementById('main-content');
          mainContent?.focus();
        }}
      >
        Pular para conteúdo principal
      </a>

      {/* Região de status para screen readers */}
      <div 
        className="sr-only" 
        aria-live="polite" 
        aria-atomic="true"
        role="status"
      >
        {statusMessage}
      </div>

      <div className="App">
        <main
          id="main-content"
          role="application"
          aria-label="Genesis Luminal - Entidade Digital Senciente"
          tabIndex={-1}
          style={{ 
            width: '100%', 
            height: '100vh',
            outline: 'none'
          }}
        >
          <GenesisCore onStatusChange={updateStatus} />
        </main>
      </div>
    </ErrorBoundary>
  );
}

export default App;
