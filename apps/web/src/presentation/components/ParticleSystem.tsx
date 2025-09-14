/**
 * Responsabilidade ÚNICA: Coordenação do sistema de partículas
 * Implementa SRP orquestrando renderizador e distribuição
 */

import React, { useRef, useEffect, useCallback } from 'react';
import { ParticleRenderer, Particle, Viewport } from '../../infrastructure/visual/ParticleRenderer';
import { DistributionEngine, Vector2D } from '../../core/distribution/DistributionEngine';
import { EmotionalDNA } from '../hooks/useGenesisState';

interface ParticleSystemProps {
  emotionalDNA: EmotionalDNA;
  mousePosition: Vector2D;
  distribution: string;
  particleCount: number;
  onPerformanceUpdate: (metrics: { fps: number; renderedParticles: number }) => void;
}

export const ParticleSystem: React.FC<ParticleSystemProps> = ({
  emotionalDNA,
  mousePosition,
  distribution,
  particleCount,
  onPerformanceUpdate
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<ParticleRenderer | null>(null);
  const distributionEngineRef = useRef<DistributionEngine>(new DistributionEngine());
  const animationFrameRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);

  // Inicializar renderer
  useEffect(() => {
    if (canvasRef.current && !rendererRef.current) {
      rendererRef.current = new ParticleRenderer(canvasRef.current);
    }

    return () => {
      if (rendererRef.current) {
        rendererRef.current.dispose();
        rendererRef.current = null;
      }
    };
  }, []);

  // Atualizar viewport
  useEffect(() => {
    const updateViewport = () => {
      if (rendererRef.current) {
        rendererRef.current.updateViewport(window.innerWidth, window.innerHeight);
      }
    };

    updateViewport();
    window.addEventListener('resize', updateViewport);
    return () => window.removeEventListener('resize', updateViewport);
  }, []);

  // Gerar partículas baseadas na distribuição
  const generateParticles = useCallback(() => {
    const engine = distributionEngineRef.current;
    if (!engine.setStrategy(distribution)) {
      console.warn(`Distribution ${distribution} not found, using current`);
    }

    const positions = engine.generateDistribution(particleCount, mousePosition);
    
    return positions.map((pos, index): Particle => ({
      x: pos.x,
      y: pos.y,
      color: mapEmotionToColor(emotionalDNA, index),
      size: mapEmotionToSize(emotionalDNA, index),
      alpha: mapEmotionToAlpha(emotionalDNA, index),
      id: `particle_${index}`
    }));
  }, [emotionalDNA, mousePosition, distribution, particleCount]);

  // Loop de renderização
  const animate = useCallback(() => {
    if (!rendererRef.current) return;

    const particles = generateParticles();
    particlesRef.current = particles;

    const viewport: Viewport = {
      width: window.innerWidth,
      height: window.innerHeight
    };

    const result = rendererRef.current.render(particles, viewport);
    
    // Reportar métricas de performance
    onPerformanceUpdate({
      fps: result.fps,
      renderedParticles: result.renderedCount
    });

    animationFrameRef.current = requestAnimationFrame(animate);
  }, [generateParticles, onPerformanceUpdate]);

  // Iniciar/parar animação
  useEffect(() => {
    animationFrameRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [animate]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 1,
        pointerEvents: 'none'
      }}
      aria-label="Sistema de partículas emocional"
    />
  );
};

// Funções utilitárias para mapeamento emocional
function mapEmotionToColor(dna: EmotionalDNA, index: number): string {
  const hue = (dna.joy * 60 + dna.mystery * 270 + index * 10) % 360;
  const saturation = Math.round(50 + dna.ecstasy * 50);
  const lightness = Math.round(40 + dna.serenity * 40);
  
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

function mapEmotionToSize(dna: EmotionalDNA, index: number): number {
  const baseSize = 2;
  const emotionalFactor = (dna.power + dna.curiosity) * 0.5;
  const variation = Math.sin(index * 0.1) * 0.5;
  
  return baseSize + emotionalFactor * 3 + variation;
}

function mapEmotionToAlpha(dna: EmotionalDNA, index: number): number {
  const baseAlpha = 0.6;
  const emotionalFactor = (dna.mystery + dna.nostalgia) * 0.3;
  const variation = Math.cos(index * 0.05) * 0.2;
  
  return Math.max(0.1, Math.min(1, baseAlpha + emotionalFactor + variation));
}
