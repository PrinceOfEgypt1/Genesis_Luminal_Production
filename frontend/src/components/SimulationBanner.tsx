/**
 * @fileoverview Simulation Banner - Genesis Luminal
 * @version 1.0.0
 * @author Genesis Luminal Team
 * 
 * Banner de aviso sobre funcionalidades simuladas
 */

import React, { useState } from 'react';

interface SimulationBannerProps {
  features?: string[];
  severity?: 'warning' | 'error' | 'info';
  dismissible?: boolean;
}

/**
 * Banner de transparência sobre simulações
 * 
 * 🔴 [IMPLEMENTED] - Componente real para transparência
 */
export const SimulationBanner: React.FC<SimulationBannerProps> = ({
  features = ['Análise de Emoções'],
  severity = 'warning',
  dismissible = true
}) => {
  const [isDismissed, setIsDismissed] = useState(false);
  
  if (isDismissed) return null;
  
  const severityStyles = {
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800'
  };
  
  const severityIcons = {
    warning: '⚠️',
    error: '🔴',
    info: 'ℹ️'
  };
  
  return (
    <div className={`border-l-4 p-4 mb-6 ${severityStyles[severity]}`}>
      <div className="flex justify-between items-start">
        <div className="flex">
          <div className="flex-shrink-0">
            <span className="text-xl" role="img" aria-label={severity}>
              {severityIcons[severity]}
            </span>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium">
              Sistema em Desenvolvimento - Funcionalidades Simuladas
            </h3>
            <div className="mt-2 text-sm">
              <p className="mb-2">
                <strong>IMPORTANTE:</strong> Este sistema contém funcionalidades simuladas para demonstração.
              </p>
              <div className="mb-2">
                <strong>Recursos simulados:</strong>
                <ul className="list-disc list-inside ml-2">
                  {features.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
              </div>
              <div className="text-xs space-y-1">
                <p>• Resultados baseados em heurísticas simples</p>
                <p>• Não utiliza machine learning real</p>
                <p>• Apenas para fins demonstrativos</p>
                <p>• Não recomendado para uso em produção</p>
              </div>
            </div>
            <div className="mt-3">
              <a 
                href="/api/disclaimer" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm underline hover:no-underline"
              >
                Ver disclaimer completo →
              </a>
            </div>
          </div>
        </div>
        {dismissible && (
          <div className="ml-auto pl-3">
            <button
              onClick={() => setIsDismissed(true)}
              className="inline-flex text-sm hover:opacity-75"
              aria-label="Fechar aviso"
            >
              ✕
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Hook para verificar status de simulação
 */
export const useSimulationStatus = () => {
  const [status, setStatus] = React.useState<{
    isSimulated: boolean;
    features: string[];
    honestyScore: number;
  }>({
    isSimulated: true,
    features: [],
    honestyScore: 0
  });
  
  React.useEffect(() => {
    fetch('/api/system/honesty-report')
      .then(res => res.json())
      .then(data => {
        setStatus({
          isSimulated: data.summary.simulated > 0,
          features: data.features
            .filter((f: any) => f.status === 'SIMULATION')
            .map((f: any) => f.name),
          honestyScore: data.summary.honestyScore
        });
      })
      .catch(console.error);
  }, []);
  
  return status;
};

export default SimulationBanner;
