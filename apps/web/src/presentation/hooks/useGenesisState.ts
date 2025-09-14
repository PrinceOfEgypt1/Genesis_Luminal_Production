/**
 * Responsabilidade ÚNICA: Gerenciamento de estado da aplicação
 * Implementa SRP para estado centralizado
 */

import { useState, useCallback, useRef } from 'react';

export interface GenesisState {
  emotionalDNA: EmotionalDNA;
  mousePosition: Vector2D;
  isPlaying: boolean;
  currentDistribution: string;
  performance: PerformanceMetrics;
  connectionStatus: ConnectionStatus;
  audioEnabled: boolean;
}

export interface PerformanceMetrics {
  fps: number;
  latency: number;
  particleCount: number;
  renderedParticles: number;
  memoryUsage: number;
}

export interface EmotionalDNA {
  joy: number;
  nostalgia: number;
  curiosity: number;
  serenity: number;
  ecstasy: number;
  mystery: number;
  power: number;
}

export interface Vector2D {
  x: number;
  y: number;
}

export type ConnectionStatus = 'connected' | 'connecting' | 'disconnected';

export const useGenesisState = () => {
  const [state, setState] = useState<GenesisState>({
    emotionalDNA: {
      joy: 0.5,
      nostalgia: 0.3,
      curiosity: 0.7,
      serenity: 0.4,
      ecstasy: 0.2,
      mystery: 0.6,
      power: 0.5
    },
    mousePosition: { x: 0, y: 0 },
    isPlaying: false,
    currentDistribution: 'fibonacci',
    performance: {
      fps: 60,
      latency: 16,
      particleCount: 2000,
      renderedParticles: 2000,
      memoryUsage: 0
    },
    connectionStatus: 'disconnected',
    audioEnabled: false
  });

  const sessionStartRef = useRef<number>(Date.now());

  // Atualizadores especializados (cada um foca em uma responsabilidade)
  const updateEmotionalDNA = useCallback((newDNA: Partial<EmotionalDNA>) => {
    setState(prev => ({
      ...prev,
      emotionalDNA: { ...prev.emotionalDNA, ...newDNA }
    }));
  }, []);

  const updateMousePosition = useCallback((position: Vector2D) => {
    setState(prev => ({
      ...prev,
      mousePosition: position
    }));
  }, []);

  const updatePerformance = useCallback((metrics: Partial<PerformanceMetrics>) => {
    setState(prev => ({
      ...prev,
      performance: { ...prev.performance, ...metrics }
    }));
  }, []);

  const setCurrentDistribution = useCallback((distribution: string) => {
    setState(prev => ({
      ...prev,
      currentDistribution: distribution
    }));
  }, []);

  const setConnectionStatus = useCallback((status: ConnectionStatus) => {
    setState(prev => ({
      ...prev,
      connectionStatus: status
    }));
  }, []);

  const toggleAudio = useCallback(() => {
    setState(prev => ({
      ...prev,
      audioEnabled: !prev.audioEnabled
    }));
  }, []);

  const togglePlaying = useCallback(() => {
    setState(prev => ({
      ...prev,
      isPlaying: !prev.isPlaying
    }));
  }, []);

  // Computações derivadas
  const getDominantEmotion = useCallback(() => {
    const emotions = state.emotionalDNA;
    let maxEmotion: keyof EmotionalDNA = 'joy';
    let maxValue = emotions.joy;

    (Object.keys(emotions) as Array<keyof EmotionalDNA>).forEach(emotion => {
      if (emotions[emotion] > maxValue) {
        maxValue = emotions[emotion];
        maxEmotion = emotion;
      }
    });

    return maxEmotion;
  }, [state.emotionalDNA]);

  const getEmotionalIntensity = useCallback(() => {
    const values = Object.values(state.emotionalDNA);
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }, [state.emotionalDNA]);

  const getSessionDuration = useCallback(() => {
    return Date.now() - sessionStartRef.current;
  }, []);

  return {
    state,
    // Atualizadores
    updateEmotionalDNA,
    updateMousePosition,
    updatePerformance,
    setCurrentDistribution,
    setConnectionStatus,
    toggleAudio,
    togglePlaying,
    // Computações
    getDominantEmotion,
    getEmotionalIntensity,
    getSessionDuration
  };
};
