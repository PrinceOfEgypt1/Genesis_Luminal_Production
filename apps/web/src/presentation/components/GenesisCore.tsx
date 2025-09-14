/**
 * GenesisCore Refatorado - Apenas Orquestração
 * Implementa SRP delegando responsabilidades para componentes especializados
 */

import React, { useCallback, useEffect } from 'react';
import { useGenesisState } from '../hooks/useGenesisState';
import { ParticleSystem } from './ParticleSystem';
import { EmotionalAudioEngine } from '../../core/audio/EmotionalAudioEngine';
import { BackendClient } from '../../services/BackendClient';

export const GenesisCore: React.FC = () => {
  const {
    state,
    updateMousePosition,
    updatePerformance,
    setCurrentDistribution,
    setConnectionStatus,
    toggleAudio,
    getDominantEmotion,
    getEmotionalIntensity,
    getSessionDuration
  } = useGenesisState();

  const audioEngineRef = React.useRef<EmotionalAudioEngine | null>(null);
  const backendClientRef = React.useRef<BackendClient>(new BackendClient());

  // Inicializar sistemas
  useEffect(() => {
    const initializeSystems = async () => {
      try {
        // Inicializar engine de áudio
        audioEngineRef.current = new EmotionalAudioEngine();
        await audioEngineRef.current.initialize();

        // Testar conexão backend
        setConnectionStatus('connecting');
        const health = await backendClientRef.current.healthCheck();
        setConnectionStatus(health.success ? 'connected' : 'disconnected');
        
        console.log('🚀 GenesisCore inicializado');
      } catch (error) {
        console.error('Erro na inicialização:', error);
        setConnectionStatus('disconnected');
      }
    };

    initializeSystems();

    return () => {
      if (audioEngineRef.current) {
        audioEngineRef.current.dispose();
      }
    };
  }, [setConnectionStatus]);

  // Handler de movimento do mouse
  const handleMouseMove = useCallback((event: React.MouseEvent) => {
    const normalizedPosition = {
      x: event.clientX / window.innerWidth,
      y: event.clientY / window.innerHeight
    };

    updateMousePosition({
      x: event.clientX,
      y: event.clientY
    });

    // Síntese de áudio se habilitado
    if (state.audioEnabled && audioEngineRef.current) {
      audioEngineRef.current.synthesizeEmotion(state.emotionalDNA);
    }
  }, [updateMousePosition, state.audioEnabled, state.emotionalDNA]);

  // Handler de clique para alternar áudio
  const handleClick = useCallback(() => {
    toggleAudio();
  }, [toggleAudio]);

  // Handler de teclas para alternar distribuições
  const handleKeyPress = useCallback((event: React.KeyboardEvent) => {
    const distributionMap: { [key: string]: string } = {
      '1': 'fibonacci',
      '2': 'spiral',
      '3': 'organic',
      '4': 'random'
    };

    const newDistribution = distributionMap[event.key];
    if (newDistribution) {
      setCurrentDistribution(newDistribution);
    }
  }, [setCurrentDistribution]);

  // Callback de performance do sistema de partículas
  const handlePerformanceUpdate = useCallback((metrics: { fps: number; renderedParticles: number }) => {
    updatePerformance({
      fps: metrics.fps,
      renderedParticles: metrics.renderedParticles,
      memoryUsage: (performance as any).memory?.usedJSHeapSize || 0
    });
  }, [updatePerformance]);

  const dominantEmotion = getDominantEmotion();
  const emotionalIntensity = getEmotionalIntensity();

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        background: `linear-gradient(45deg, 
          hsl(${state.mousePosition.x * 360 / window.innerWidth}, 20%, 5%), 
          hsl(${state.mousePosition.y * 360 / window.innerHeight}, 30%, 8%))`,
        cursor: 'none',
        overflow: 'hidden',
        position: 'relative'
      }}
      onMouseMove={handleMouseMove}
      onClick={handleClick}
      onKeyDown={handleKeyPress}
      tabIndex={0}
      role="application"
      aria-label="Genesis Luminal - Entidade Digital Interativa"
    >
      {/* Sistema de Partículas */}
      <ParticleSystem
        emotionalDNA={state.emotionalDNA}
        mousePosition={state.mousePosition}
        distribution={state.currentDistribution}
        particleCount={state.performance.particleCount}
        onPerformanceUpdate={handlePerformanceUpdate}
      />

      {/* Interface de Status */}
      <div style={{
        position: 'fixed',
        top: '20px',
        left: '20px',
        zIndex: 100,
        background: 'rgba(0, 0, 0, 0.7)',
        padding: '1rem',
        borderRadius: '8px',
        color: 'white',
        fontFamily: 'monospace',
        fontSize: '0.8rem'
      }}>
        <div>Status: {state.connectionStatus}</div>
        <div>FPS: {state.performance.fps}</div>
        <div>Partículas: {state.performance.renderedParticles}</div>
        <div>Distribuição: {state.currentDistribution}</div>
        <div>Emoção: {dominantEmotion}</div>
        <div>Intensidade: {(emotionalIntensity * 100).toFixed(1)}%</div>
        <div>Áudio: {state.audioEnabled ? 'ON' : 'OFF'}</div>
      </div>

      {/* Instruções de Uso */}
      <div style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: 100,
        background: 'rgba(0, 0, 0, 0.7)',
        padding: '1rem',
        borderRadius: '8px',
        color: 'white',
        fontFamily: 'monospace',
        fontSize: '0.7rem'
      }}>
        <div>Mover mouse: Interagir</div>
        <div>Clique: Toggle áudio</div>
        <div>1-4: Mudar distribuição</div>
      </div>
    </div>
  );
};

export default GenesisCore;
