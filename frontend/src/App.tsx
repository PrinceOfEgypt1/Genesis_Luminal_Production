import { useState } from 'react';
import { GenesisCore } from './components/GenesisCore';
import ErrorBoundary from './components/ErrorBoundary';
import './App.css';

export default function App() {
  const [isInitialized, setIsInitialized] = useState(false);

  return (
    <ErrorBoundary>
      <div className="App">
        <GenesisCore 
          onInitialized={() => setIsInitialized(true)}
          isActive={isInitialized}
        />
      </div>
    </ErrorBoundary>
  );
}

------------------------------------------------------------------------------------------------------------------------