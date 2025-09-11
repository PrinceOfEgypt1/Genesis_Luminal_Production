/**
 * 🚀 GENESIS CORE - VISUAL ELABORADO + CLAUDE API REAL
 * Combinação: Interface visual avançada + IA Claude genuína
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { backendClient } from '../../services/BackendClient';
import { EmotionalDNA } from '../../core/entities/EmotionalDNA';

export const GenesisCore: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const backgroundCanvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  
  // Estados Claude API (mantidos do funcionamento atual)
  const [currentEmotional, setCurrentEmotional] = useState<EmotionalDNA>(
    new EmotionalDNA(0.5, 0.3, 0.7, 0.4, 0.2, 0.6, 0.5)
  );
  const [mousePosition, setMousePosition] = useState({ x: 0.5, y: 0.5 });
  const [sessionStart] = useState(Date.now());
  const [backendStatus, setBackendStatus] = useState<'connecting' | 'connected' | 'offline'>('connecting');
  const [lastAnalysis, setLastAnalysis] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Estados para visual elaborado
  const [particles, setParticles] = useState<Array<{
    x: number; y: number; vx: number; vy: number;
    size: number; opacity: number; hue: number;
    life: number; maxLife: number; type: number;
  }>>([]);
  
  const [waveRings, setWaveRings] = useState<Array<{
    x: number; y: number; radius: number; opacity: number; hue: number;
  }>>([]);

  // Inicialização
  useEffect(() => {
    console.log('🚀 Genesis Luminal - Visual Elaborado + Claude API');
    console.log('🧠 Sistema: IA Claude Real + Interface Avançada');
    
    checkBackendStatus();
    initializeAdvancedParticles();
    
    const animate = () => {
      renderAdvanced();
      animationRef.current = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // Verificar backend (mantido igual)
  const checkBackendStatus = async () => {
    try {
      const isHealthy = await backendClient.healthCheck();
      setBackendStatus(isHealthy ? 'connected' : 'offline');
      console.log(isHealthy ? '✅ Backend conectado - Claude API disponível' : '⚠️ Backend offline');
    } catch (error) {
      setBackendStatus('offline');
      console.log('❌ Erro ao conectar backend:', error);
    }
  };

  // Inicializar sistema de partículas avançado
  const initializeAdvancedParticles = () => {
    const newParticles = [];
    for (let i = 0; i < 3000; i++) {
      newParticles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 3,
        vy: (Math.random() - 0.5) * 3,
        size: Math.random() * 4 + 1,
        opacity: Math.random() * 0.9 + 0.1,
        hue: Math.random() * 360,
        life: Math.random() * 1000,
        maxLife: 500 + Math.random() * 1000,
        type: Math.floor(Math.random() * 3) // 0: normal, 1: energy, 2: mystical
      });
    }
    setParticles(newParticles);
  };

  // Mouse handler com Claude API (mantido + efeitos visuais)
  const handleMouseMove = useCallback(async (event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    
    setMousePosition({ x, y });

    // Adicionar onda visual no mouse
    setWaveRings(prev => [...prev.slice(-10), {
      x: event.clientX,
      y: event.clientY,
      radius: 0,
      opacity: 1,
      hue: currentEmotional.joy * 360
    }]);

    // Claude API analysis (mantido exatamente igual)
    if (backendStatus === 'connected' && !isAnalyzing) {
      setIsAnalyzing(true);
      
      try {
        console.log('🧠 Enviando análise para Claude via backend...');
        
        const response = await backendClient.analyzeEmotionalState({
          currentState: currentEmotional,
          mousePosition: { x, y },
          sessionDuration: Date.now() - sessionStart
        });

        if (response?.success && response.analysis) {
          console.log('✅ Análise Claude recebida via backend!');
          console.log('📊 Confiança:', response.analysis.confidence);
          console.log('🎨 Recomendação:', response.analysis.recommendations.visualStyle);
          
          setLastAnalysis(response.analysis);
          
          const predicted = response.analysis.predictedNextState;
          setCurrentEmotional(new EmotionalDNA(
            predicted.joy, predicted.nostalgia, predicted.curiosity,
            predicted.serenity, predicted.ecstasy, predicted.mystery, predicted.power
          ));
        } else if (response?.fallback) {
          console.log('⚠️ Backend retornou fallback');
          updateEmotionalStateLocal(x, y);
        }
      } catch (error) {
        console.log('❌ Erro na análise Claude, usando fallback local');
        updateEmotionalStateLocal(x, y);
      } finally {
        setTimeout(() => setIsAnalyzing(false), 3000);
      }
    } else if (backendStatus === 'offline') {
      updateEmotionalStateLocal(x, y);
    }
  }, [currentEmotional, backendStatus, isAnalyzing, sessionStart]);

  // Predição local (fallback)
  const updateEmotionalStateLocal = (x: number, y: number) => {
    const influence = 0.1;
    setCurrentEmotional(prev => new EmotionalDNA(
      Math.max(0, Math.min(1, prev.joy + (x - 0.5) * influence)),
      Math.max(0, Math.min(1, prev.nostalgia + Math.sin(Date.now() * 0.001) * 0.05)),
      Math.max(0, Math.min(1, prev.curiosity + (y - 0.5) * influence)),
      Math.max(0, Math.min(1, prev.serenity + (1 - Math.abs(x - 0.5)) * influence)),
      Math.max(0, Math.min(1, prev.ecstasy + (x * y) * influence)),
      Math.max(0, Math.min(1, prev.mystery + (1 - y) * influence)),
      Math.max(0, Math.min(1, prev.power + Math.abs(x - 0.5) * influence))
    ));
  };

  // Renderização avançada
  const renderAdvanced = () => {
    const canvas = canvasRef.current;
    const bgCanvas = backgroundCanvasRef.current;
    if (!canvas || !bgCanvas) return;

    const ctx = canvas.getContext('2d');
    const bgCtx = bgCanvas.getContext('2d');
    if (!ctx || !bgCtx) return;

    // Ajustar tamanhos
    [canvas, bgCanvas].forEach(c => {
      if (c.width !== window.innerWidth || c.height !== window.innerHeight) {
        c.width = window.innerWidth;
        c.height = window.innerHeight;
      }
    });

    // Fundo gradiente dinâmico
    const gradient = bgCtx.createRadialGradient(
      window.innerWidth/2, window.innerHeight/2, 0,
      window.innerWidth/2, window.innerHeight/2, Math.max(window.innerWidth, window.innerHeight)
    );
    
    const hue1 = (currentEmotional.mystery * 360 + Date.now() * 0.01) % 360;
    const hue2 = (currentEmotional.serenity * 360 + Date.now() * 0.008) % 360;
    
    gradient.addColorStop(0, `hsla(${hue1}, 40%, 8%, 0.8)`);
    gradient.addColorStop(0.7, `hsla(${hue2}, 60%, 12%, 0.6)`);
    gradient.addColorStop(1, 'hsla(220, 80%, 4%, 0.9)');
    
    bgCtx.fillStyle = gradient;
    bgCtx.fillRect(0, 0, bgCanvas.width, bgCanvas.height);

    // Limpar canvas principal
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Renderizar ondas de mouse
    setWaveRings(prev => prev.map(ring => ({
      ...ring,
      radius: ring.radius + 5,
      opacity: ring.opacity * 0.95
    })).filter(ring => ring.opacity > 0.01));

    waveRings.forEach(ring => {
      ctx.beginPath();
      ctx.arc(ring.x, ring.y, ring.radius, 0, Math.PI * 2);
      ctx.strokeStyle = `hsla(${ring.hue}, 70%, 60%, ${ring.opacity})`;
      ctx.lineWidth = 2;
      ctx.stroke();
    });

    // Intensidade baseada em Claude ou padrão
    const intensity = lastAnalysis?.recommendations?.intensity || 0.8;
    const visualStyle = lastAnalysis?.recommendations?.visualStyle || 'organic';

    // Renderizar partículas avançadas
    const mouseX = mousePosition.x * canvas.width;
    const mouseY = mousePosition.y * canvas.height;

    setParticles(prev => prev.map(particle => {
      // Física avançada baseada no tipo
      const dx = mouseX - particle.x;
      const dy = mouseY - particle.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // Diferentes comportamentos por tipo
      if (particle.type === 0) { // Normal - atração
        if (distance < 300) {
          const force = (300 - distance) / 300 * intensity;
          particle.vx += dx * force * 0.002;
          particle.vy += dy * force * 0.002;
        }
      } else if (particle.type === 1) { // Energy - orbital
        if (distance < 200) {
          const angle = Math.atan2(dy, dx) + Math.PI / 2;
          particle.vx += Math.cos(angle) * intensity * 0.03;
          particle.vy += Math.sin(angle) * intensity * 0.03;
        }
      } else { // Mystical - repulsão
        if (distance < 150) {
          const force = (150 - distance) / 150 * intensity;
          particle.vx -= dx * force * 0.001;
          particle.vy -= dy * force * 0.001;
        }
      }

      // Atualizar posição
      particle.x += particle.vx;
      particle.y += particle.vy;

      // Fricção diferencial
      const friction = particle.type === 1 ? 0.98 : 0.99;
      particle.vx *= friction;
      particle.vy *= friction;

      // Bordas com wrap-around
      if (particle.x < 0) particle.x = canvas.width;
      if (particle.x > canvas.width) particle.x = 0;
      if (particle.y < 0) particle.y = canvas.height;
      if (particle.y > canvas.height) particle.y = 0;

      // Vida da partícula
      particle.life += 1;
      if (particle.life > particle.maxLife) {
        particle.life = 0;
        particle.x = Math.random() * canvas.width;
        particle.y = Math.random() * canvas.height;
      }

      return particle;
    }));

    // Renderizar partículas com estilo Claude
    particles.forEach(particle => {
      const lifeRatio = particle.life / particle.maxLife;
      const pulseOpacity = particle.opacity * (0.5 + 0.5 * Math.sin(Date.now() * 0.01 + particle.x * 0.001));
      
      // Cor baseada em emoções Claude
      let hue = (particle.hue + currentEmotional.joy * 120 + currentEmotional.curiosity * 180) % 360;
      
      // Modificar cor baseado no estilo recomendado por Claude
      if (visualStyle === 'fibonacci') {
        hue = (hue + Math.sin(particle.x * 0.01) * 60) % 360;
      } else if (visualStyle === 'spiral') {
        const angle = Math.atan2(particle.y - canvas.height/2, particle.x - canvas.width/2);
        hue = (hue + angle * 57.3) % 360;
      }

      const saturation = 50 + currentEmotional.ecstasy * 40;
      const lightness = 30 + currentEmotional.serenity * 40;
      
      // Tamanho baseado em tipo e intensidade Claude
      let size = particle.size * intensity;
      if (particle.type === 1) size *= 1.5;
      if (particle.type === 2) size *= 0.7;

      ctx.beginPath();
      
      // Diferentes formas por tipo
      if (particle.type === 0) {
        ctx.arc(particle.x, particle.y, size, 0, Math.PI * 2);
      } else if (particle.type === 1) {
        // Energia - forma de diamante
        ctx.moveTo(particle.x, particle.y - size);
        ctx.lineTo(particle.x + size, particle.y);
        ctx.lineTo(particle.x, particle.y + size);
        ctx.lineTo(particle.x - size, particle.y);
        ctx.closePath();
      } else {
        // Mystical - estrela
        const spikes = 6;
        const outerRadius = size;
        const innerRadius = size * 0.5;
        for (let i = 0; i < spikes * 2; i++) {
          const radius = i % 2 === 0 ? outerRadius : innerRadius;
          const angle = (i * Math.PI) / spikes;
          const x = particle.x + Math.cos(angle) * radius;
          const y = particle.y + Math.sin(angle) * radius;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
      }
      
      ctx.fillStyle = `hsla(${hue}, ${saturation}%, ${lightness}%, ${pulseOpacity})`;
      ctx.fill();
      
      // Glow effect
      if (particle.type === 1) {
        ctx.shadowBlur = 20;
        ctx.shadowColor = `hsla(${hue}, 100%, 60%, 0.5)`;
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    });

    // Conexões entre partículas próximas
    if (visualStyle === 'fibonacci' || currentEmotional.mystery > 0.7) {
      ctx.strokeStyle = `hsla(${currentEmotional.power * 360}, 60%, 40%, 0.1)`;
      ctx.lineWidth = 1;
      
      for (let i = 0; i < particles.length; i += 10) {
        for (let j = i + 1; j < particles.length; j += 10) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 100) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
    }
  };

  // Status colors (mantido)
  const getStatusColor = () => {
    switch (backendStatus) {
      case 'connected': return '#00ff88';
      case 'connecting': return '#ffaa00';
      case 'offline': return '#ff6600';
      default: return '#ffffff';
    }
  };

  const getStatusText = () => {
    switch (backendStatus) {
      case 'connected': return 'Claude IA Real Conectada';
      case 'connecting': return 'Conectando...';
      case 'offline': return 'Modo Local (Backend Offline)';
      default: return 'Status Desconhecido';
    }
  };

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      position: 'relative',
      overflow: 'hidden',
      background: '#0a0a0a',
      cursor: 'none'
    }}>
      {/* Background canvas */}
      <canvas
        ref={backgroundCanvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 1
        }}
      />
      
      {/* Main canvas */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 2
        }}
        onMouseMove={handleMouseMove}
      />

      {/* Enhanced Status Panel */}
      <div style={{
        position: 'fixed',
        top: '15px',
        right: '15px',
        background: 'rgba(0,0,0,0.85)',
        color: 'white',
        padding: '20px',
        borderRadius: '12px',
        fontSize: '13px',
        fontFamily: 'Monaco, Consolas, monospace',
        minWidth: '280px',
        border: `2px solid ${getStatusColor()}`,
        boxShadow: `0 0 20px ${getStatusColor()}33`,
        zIndex: 10
      }}>
        <div style={{ color: getStatusColor(), fontWeight: 'bold', fontSize: '14px' }}>
          🧠 {getStatusText()}
        </div>
        <hr style={{ margin: '8px 0', border: `1px solid ${getStatusColor()}44` }} />
        <div>🖱️ Mouse: {mousePosition.x.toFixed(3)}, {mousePosition.y.toFixed(3)}</div>
        <div>😊 Joy: {currentEmotional.joy.toFixed(3)}</div>
        <div>🔮 Mystery: {currentEmotional.mystery.toFixed(3)}</div>
        <div>⚡ Power: {currentEmotional.power.toFixed(3)}</div>
        {lastAnalysis && (
          <>
            <hr style={{ margin: '8px 0', border: '1px solid #444' }} />
            <div style={{ color: '#88ff88' }}>🎯 Confiança: {lastAnalysis.confidence?.toFixed(3) || 'N/A'}</div>
            <div style={{ color: '#88aaff' }}>🎨 Estilo: {lastAnalysis.recommendations?.visualStyle || 'N/A'}</div>
            <div style={{ color: '#ffaa88' }}>🎵 Áudio: {lastAnalysis.recommendations?.audioScale || 'N/A'}</div>
            <div style={{ color: '#aa88ff' }}>⚡ Intensidade: {lastAnalysis.recommendations?.intensity?.toFixed(2) || 'N/A'}</div>
          </>
        )}
        <hr style={{ margin: '8px 0', border: '1px solid #333' }} />
        <div style={{ fontSize: '11px', opacity: 0.8 }}>
          {isAnalyzing ? '🔄 Analisando Claude...' : '✨ Pronto para análise'}
        </div>
        <div style={{ fontSize: '10px', opacity: 0.6, marginTop: '4px' }}>
          Partículas: {particles.length} | FPS: ~60
        </div>
      </div>
    </div>
  );
};

export default GenesisCore;
