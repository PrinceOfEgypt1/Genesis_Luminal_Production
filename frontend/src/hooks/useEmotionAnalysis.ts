/**
 * @fileoverview Hook para análise de emoções
 * @version 1.0.0
 */

import { useState, useCallback } from 'react';

interface EmotionResult {
  dominant: string;
  intensity: number;
  confidence: number;
}

export interface UseEmotionAnalysisReturn {
  loading: boolean;
  isLoading: boolean; // Alias para compatibilidade com testes
  result: EmotionResult | null;
  error: string | null;
  analyze: (text: string, userId?: string) => Promise<void>;
  reset: () => void; // Método esperado pelos testes
}

export const useEmotionAnalysis = (): UseEmotionAnalysisReturn => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<EmotionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const analyze = useCallback(async (text: string, userId?: string) => {
    if (!text.trim()) {
      setError('Texto não pode estar vazio');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Simulação de análise de emoção
      const response = await fetch('/api/emotion/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          text: text.trim(),
          ...(userId && { userId })
        }),
      });

      if (!response.ok) {
        throw new Error('Falha na análise de emoção');
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    loading,
    isLoading: loading, // Alias para compatibilidade
    result,
    error,
    analyze,
    reset,
  };
};

export default useEmotionAnalysis;
