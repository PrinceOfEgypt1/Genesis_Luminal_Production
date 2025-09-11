/**
 * 🎨 EMOTIONAL RENDERER
 * Renderizador visual responsivo às emoções
 */

import React from 'react';
import { EmotionalDNA } from '../../core/entities/EmotionalDNA';

interface EmotionalRendererProps {
  emotionalState: EmotionalDNA;
  mousePosition: { x: number; y: number };
  claudeRecommendations?: any;
}

export const EmotionalRenderer: React.FC<EmotionalRendererProps> = ({
  emotionalState,
  mousePosition,
  claudeRecommendations
}) => {
  // Cores baseadas no estado emocional
  const emotionalColor = `hsl(
    ${emotionalState.joy * 60 + emotionalState.curiosity * 180},
    ${50 + emotionalState.ecstasy * 30}%,
    ${40 + emotionalState.serenity * 20}%
  )`;

  // Intensidade baseada em recomendações Claude
  const intensity = claudeRecommendations?.intensity || 0.7;

  return (
    <div style={{
      position: 'absolute',
      width: '100%',
      height: '100%',
      overflow: 'hidden'
    }}>
      {/* Partículas emocionais */}
      {Array.from({ length: Math.round(2000 * intensity) }).map((_, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            width: '2px',
            height: '2px',
            backgroundColor: emotionalColor,
            borderRadius: '50%',
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            opacity: Math.random() * 0.8,
            animation: `float ${2 + Math.random() * 3}s ease-in-out infinite`,
            transform: `translate(
              ${(mousePosition.x - 0.5) * 100}px,
              ${(mousePosition.y - 0.5) * 100}px
            )`
          }}
        />
      ))}

      {/* Ondas emocionais */}
      <div
        style={{
          position: 'absolute',
          left: `${mousePosition.x * 100}%`,
          top: `${mousePosition.y * 100}%`,
          width: '100px',
          height: '100px',
          borderRadius: '50%',
          border: `2px solid ${emotionalColor}`,
          transform: 'translate(-50%, -50%)',
          animation: 'pulse 2s ease-in-out infinite',
          opacity: 0.5
        }}
      />

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        
        @keyframes pulse {
          0% { transform: translate(-50%, -50%) scale(0.5); opacity: 0.8; }
          100% { transform: translate(-50%, -50%) scale(3); opacity: 0; }
        }
      `}</style>
    </div>
  );
};
