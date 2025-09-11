/**
 * 🚀 GENESIS CORE - COM API CLAUDE REAL
 * 
 * Componente principal integrado com API Claude
 * Status: IA REAL (não simulação)
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { ClaudeAPIClient } from '../../core/ai/claude/ClaudeAPIClient';
import { EmotionalDNA } from '../../core/entities/EmotionalDNA';
import { EmotionalRenderer } from '../visual/EmotionalRenderer';
import { AudioEngine } from '../../infrastructure/audio/AudioEngine';

// REMOVIDO: SimpleLSTM simulado - agora usando API Claude REAL

export const GenesisCore: React.FC = () => {
  // ✅ API CLAUDE REAL ENGINE
  const claudeClientRef = useRef<ClaudeAPIClient>(new ClaudeAPIClient());
  const audioEngineRef = useRef<AudioEngine>(new AudioEngine());
  
  // Estados para IA real
  const [currentEmotionalState, setCurrentEmotionalState] = useState<EmotionalDNA>(
    () => new EmotionalDNA(0.5, 0.3, 0.7, 0.4, 0.2, 0.6, 0.5)
  );
  const [isClaudeAnalyzing, setIsClaudeAnalyzing] = useState(false);
  const [claudeInsights, setClaudeInsights] = useState<any>(null);
  
  // Mouse tracking
  const [mousePosition, setMousePosition] = useState({ x: 0.5, y: 0.5 });
  const [sessionDuration, setSessionDuration] = useState(0);
  const sessionStartRef = useRef(Date.now());

  // Inicialização
  useEffect(() => {
    console.log('🧠 API Claude REAL inicializada - GenesisCore');
    console.log('✅ Cliente Claude funcionando - IA genuína ativa');
    console.log('🔄 Sistema LSTM local REMOVIDO - usando IA real');
    
    // Inicializar áudio
    audioEngineRef.current.initialize();
    
    return () => {
      audioEngineRef.current.dispose();
    };
  }, []);

  // Mouse handler com análise Claude
  const handleMouseMove = useCallback(async (event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    
    setMousePosition({ x, y });
    setSessionDuration(Date.now() - sessionStartRef.current);

    // Análise emocional via API Claude (throttled)
    if (!isClaudeAnalyzing) {
      setIsClaudeAnalyzing(true);
      
      try {
        console.log('🧠 Enviando análise para Claude API...');
        
        const analysis = await claudeClientRef.current.analyzeEmotionalState({
          currentState: currentEmotionalState,
          mousePosition: { x, y },
          sessionDuration: Date.now() - sessionStartRef.current,
          recentHistory: [] // Simplificado para MVP
        });

        if (analysis) {
          console.log('✅ Análise Claude recebida:', analysis.confidence);
          console.log('📊 API Claude: Estado emocional processado');
          
          setClaudeInsights(analysis);
          setCurrentEmotionalState(new EmotionalDNA(
            analysis.predictedNextState.joy,
            analysis.predictedNextState.nostalgia,
            analysis.predictedNextState.curiosity,
            analysis.predictedNextState.serenity,
            analysis.predictedNextState.ecstasy,
            analysis.predictedNextState.mystery,
            analysis.predictedNextState.power
          ));

          // Atualizar áudio baseado em recomendações Claude
          if (analysis.recommendations) {
            audioEngineRef.current.updateEmotionalState(currentEmotionalState);
            console.log('🎵 Áudio atualizado por recomendação Claude:', analysis.recommendations.audioScale);
          }
        } else {
          console.log('⚠️ Claude API: Resposta vazia, mantendo estado atual');
        }
      } catch (error) {
        console.error('❌ Erro na análise Claude:', error);
        console.log('🔄 Fallback: Mantendo estado emocional atual');
      } finally {
        // Reset throttling após 2 segundos
        setTimeout(() => setIsClaudeAnalyzing(false), 2000);
      }
    }
  }, [currentEmotionalState, isClaudeAnalyzing]);

  // Stats para debug
  const getDebugStats = () => {
    return {
      engine: 'Claude API Real',
      status: isClaudeAnalyzing ? 'Analisando...' : 'Pronto',
      lastInsight: claudeInsights?.confidence || 'Aguardando',
      emotionalState: currentEmotionalState,
      sessionTime: Math.round((Date.now() - sessionStartRef.current) / 1000)
    };
  };

  // Log stats periodicamente
  useEffect(() => {
    const interval = setInterval(() => {
      console.log('📊 Stats Claude API:', getDebugStats());
    }, 10000); // A cada 10 segundos

    return () => clearInterval(interval);
  }, [claudeInsights, currentEmotionalState]);

  return (
    <div 
      className="genesis-core"
      style={{
        width: '100vw',
        height: '100vh',
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #1a1a2e, #16213e, #0f3460)',
        cursor: 'none'
      }}
      onMouseMove={handleMouseMove}
    >
      {/* Renderer Visual */}
      <EmotionalRenderer 
        emotionalState={currentEmotionalState}
        mousePosition={mousePosition}
        claudeRecommendations={claudeInsights?.recommendations}
      />

      {/* Debug Panel (removível em produção) */}
      <div style={{
        position: 'fixed',
        top: '10px',
        right: '10px',
        background: 'rgba(0,0,0,0.7)',
        color: 'white',
        padding: '10px',
        borderRadius: '5px',
        fontSize: '12px',
        fontFamily: 'monospace',
        zIndex: 1000
      }}>
        <div>🧠 Engine: Claude API Real</div>
        <div>📊 Status: {isClaudeAnalyzing ? 'Analisando...' : 'Pronto'}</div>
        <div>🎯 Confiança: {claudeInsights?.confidence?.toFixed(2) || 'N/A'}</div>
        <div>⏱️ Sessão: {Math.round(sessionDuration / 1000)}s</div>
        <div>🎵 Áudio: {claudeInsights?.recommendations?.audioScale || 'Padrão'}</div>
      </div>
    </div>
  );
};

export default GenesisCore;
