/**
 * @fileoverview Componente EmotionAnalyzer - Genesis Luminal
 */

import React, { useState } from 'react';

export interface EmotionAnalyzerProps {
  onAnalysis?: (result: any) => void;
  placeholder?: string;
}

export const EmotionAnalyzer: React.FC<EmotionAnalyzerProps> = ({
  onAnalysis,
  placeholder = "Digite seu texto para análise emocional..."
}) => {
  const [text, setText] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const analyzeEmotion = async () => {
    if (!text.trim()) return;
    
    setLoading(true);
    try {
      // Simulação simples para testes
      const mockResult = {
        intensity: 0.8,
        dominantAffect: 'joy',
        confidence: 0.9,
        emotions: {
          joy: 0.8,
          excitement: 0.6,
          positive: 0.7
        }
      };
      
      setResult(mockResult);
      onAnalysis?.(mockResult);
    } catch (error) {
      console.error('Erro na análise:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="emotion-analyzer">
      <div className="input-section">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={placeholder}
          rows={4}
          className="w-full p-3 border rounded-lg"
        />
        <button
          onClick={analyzeEmotion}
          disabled={loading || !text.trim()}
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50"
        >
          {loading ? 'Analisando...' : 'Analisar Emoção'}
        </button>
      </div>
      
      {result && (
        <div className="result-section mt-4 p-4 bg-gray-50 rounded-lg">
          <h3>Resultado da Análise:</h3>
          <p>Emoção dominante: <span className="joy">{result.dominantAffect}</span></p>
          <p>Intensidade: {(result.intensity * 100).toFixed(1)}%</p>
          <p>Confiança: {(result.confidence * 100).toFixed(1)}%</p>
        </div>
      )}
    </div>
  );
};

export default EmotionAnalyzer;
