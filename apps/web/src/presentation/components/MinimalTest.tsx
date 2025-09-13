import React, { useRef, useEffect } from 'react';

export const MinimalTest: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  let frameCount = 0;
  let lastTime = 0;
  
  const render = (timestamp: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d')!;
    
    // Limpar tela
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Desenhar apenas um círculo simples
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(400, 300, 50, 0, 6.28);
    ctx.fill();
    
    // Calcular FPS
    frameCount++;
    if (timestamp - lastTime > 1000) {
      console.log('FPS MINIMAL:', frameCount);
      frameCount = 0;
      lastTime = timestamp;
    }
    
    requestAnimationFrame(render);
  };
  
  useEffect(() => {
    requestAnimationFrame(render);
  }, []);
  
  return <canvas ref={canvasRef} width={800} height={600} style={{border: '1px solid white'}} />;
};
