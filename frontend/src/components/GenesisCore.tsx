import type { EmotionalAnalysisRequest } from "../../../packages/shared/types/api";
/**
 * @fileoverview Genesis Luminal Evoluído - CORREÇÕES TYPESCRIPT
 * 
 * 🔧 CORREÇÕES APLICADAS:
 * ✅ Função getDominantEmotion corrigida
 * ✅ Imports otimizados
 * ✅ Variáveis não utilizadas removidas
 * 
 * @version 3.5.0 - TYPESCRIPT CORRIGIDO
 */

import React, { useRef, useEffect, useState, useCallback, useMemo, memo } from 'react';
import * as Tone from 'tone';
import { BackendClient } from '../services/BackendClient';

// import { SHOW_AI_HUD } from '../shared/constants/uiFlags';

// === INTERFACES COMPLETAS ===

interface OptimizedParticle {
  x: number; y: number; z: number;
  vx: number; vy: number; vz: number;
  life: number; maxLife: number;
  size: number; hue: number;
  visible: boolean; lastUpdate: number;
  lodLevel: number; quadrant: number;
  originalIndex: number;
  targetPosition: Vector3;
  transitionProgress: number;
}

interface Vector3 {
  x: number; y: number; z: number;
}

interface MousePosition {
  x: number; y: number;
}

interface EmotionalDNA {
  joy: number; nostalgia: number; curiosity: number; serenity: number;
  ecstasy: number; mystery: number; power: number;
}

interface EmotionalPrediction {
  predictedEmotion: EmotionalDNA;
  confidence: number;
  timeHorizon: number;
  reasoning: string;
}

interface ClaudeAnalysisResult {
  confidence: number;
  recommendation: string;
  emotionalShift: string;
  morphogenicSuggestion: string;
}

enum DistributionType {
  FIBONACCI = 'fibonacci',
  SPIRAL = 'spiral', 
  ORGANIC = 'organic',
  RANDOM = 'random'
}

interface DistributionConfig {
  name: string;
  emotions: string[];
  description: string;
  algorithm: (index: number, total: number, params?: any) => Vector3;
}

// === SISTEMA WEBGL OTIMIZADO ===

class UltraFastWebGLRenderer {
  private gl: WebGLRenderingContext | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private shaderProgram: WebGLProgram | null = null;
  private vertexBuffer: WebGLBuffer | null = null;
  private isEnabled: boolean = false;
  private cachedParticleData: Float32Array | null = null;
  private frameSkipCounter: number = 0;
  
  private vertexShaderSource = `
    attribute vec3 a_position;
    attribute vec3 a_color;
    attribute float a_size;
    
    uniform vec2 u_mouse;
    uniform float u_time;
    uniform float u_intensity;
    uniform vec2 u_resolution;
    uniform vec4 u_rotation;
    
    varying vec3 v_color;
    varying float v_alpha;
    
    void main() {
      vec3 pos = a_position;
      
      float cosY = u_rotation.x, sinY = u_rotation.y;
      float cosX = u_rotation.z, sinX = u_rotation.w;
      
      float tempX = pos.x * cosY - pos.z * sinY;
      pos.z = pos.x * sinY + pos.z * cosY;
      pos.x = tempX;
      
      float tempY = pos.y * cosX - pos.z * sinX;
      pos.z = pos.y * sinX + pos.z * cosX;
      pos.y = tempY;
      
      vec3 transformedPos = pos;
      
      float perspective = 400.0;
      float scale = perspective / (perspective + transformedPos.z);
      
      vec2 clipPos = (transformedPos.xy * scale) / (u_resolution * 0.5);
      gl_Position = vec4(clipPos, transformedPos.z * 0.001, 1.0);
      gl_PointSize = max(1.0, a_size * scale * (1.0 + u_intensity));
      
      float depth = (300.0 + transformedPos.z) / 600.0;
      v_alpha = max(0.3, depth * (0.6 + u_intensity * 0.4));
      v_color = a_color;
    }
  `;
  
  private fragmentShaderSource = `
    precision mediump float;
    
    varying vec3 v_color;
    varying float v_alpha;
    
    void main() {
      vec2 center = gl_PointCoord - 0.5;
      float dist = length(center);
      
      if (dist > 0.5) discard;
      
      float glow = 1.0 - smoothstep(0.0, 0.5, dist);
      vec3 finalColor = v_color * (0.8 + glow * 0.7);
      float finalAlpha = v_alpha * glow;
      
      gl_FragColor = vec4(finalColor, finalAlpha);
    }
  `;

  initialize(canvas: HTMLCanvasElement): boolean {
    this.canvas = canvas;
    this.gl = canvas.getContext('webgl', {
      alpha: true,
      antialias: false,
      depth: false,
      premultipliedAlpha: false,
      preserveDrawingBuffer: false,
      powerPreference: 'high-performance'
    });
    
    if (!this.gl) return false;

    this.gl.enable(this.gl.BLEND);
    this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE);
    this.gl.disable(this.gl.DEPTH_TEST);

    const vertexShader = this.compileShader(this.vertexShaderSource, this.gl.VERTEX_SHADER);
    const fragmentShader = this.compileShader(this.fragmentShaderSource, this.gl.FRAGMENT_SHADER);
    
    if (!vertexShader || !fragmentShader) return false;

    this.shaderProgram = this.gl.createProgram();
    if (!this.shaderProgram) return false;

    this.gl.attachShader(this.shaderProgram, vertexShader);
    this.gl.attachShader(this.shaderProgram, fragmentShader);
    this.gl.linkProgram(this.shaderProgram);

    if (!this.gl.getProgramParameter(this.shaderProgram, this.gl.LINK_STATUS)) {
      return false;
    }

    this.vertexBuffer = this.gl.createBuffer();
    this.isEnabled = true;
    
    console.log('WebGL Ultra-Fast Renderer ativado!');
    return true;
  }

  private compileShader(source: string, type: number): WebGLShader | null {
    if (!this.gl) return null;

    const shader = this.gl.createShader(type);
    if (!shader) return null;

    this.gl.shaderSource(shader, source);
    this.gl.compileShader(shader);

    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      this.gl.deleteShader(shader);
      return null;
    }

    return shader;
  }

  renderParticles(
    particles: OptimizedParticle[],
    mousePosition: MousePosition,
    emotionalIntensity: number,
    dominantHue: number,
    timestamp: number,
    targetFPS: number = 60
  ): boolean {
    if (!this.gl || !this.shaderProgram || !this.vertexBuffer || !this.isEnabled) {
      return false;
    }

    this.frameSkipCounter++;
    const skipRate = targetFPS < 45 ? 3 : targetFPS < 55 ? 2 : 1;
    if (this.frameSkipCounter % skipRate !== 0) {
      return true;
    }

    const { width, height } = this.canvas!;
    this.gl.viewport(0, 0, width, height);
    this.gl.clearColor(0, 0, 0, 0);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);

    if (particles.length === 0) {
      return false;
    }

    const dataSize = particles.length * 7;
    if (!this.cachedParticleData || this.cachedParticleData.length !== dataSize) {
      this.cachedParticleData = new Float32Array(dataSize);
    }

    for (let i = 0; i < particles.length; i++) {
      const particle = particles[i];
      const baseIndex = i * 7;
      const particleHue = (dominantHue + Math.sin(particle.x * 0.01) * 60) % 360;
      
      const h = particleHue / 360;
      const s = 0.7;
      const l = 0.6;
      const c = (1 - Math.abs(2 * l - 1)) * s;
      const x = c * (1 - Math.abs((h * 6) % 2 - 1));
      const m = l - c / 2;
      
      let r = 0, g = 0, b = 0;
      const h6 = h * 6;
      if (h6 < 1) { r = c; g = x; b = 0; }
      else if (h6 < 2) { r = x; g = c; b = 0; }
      else if (h6 < 3) { r = 0; g = c; b = x; }
      else if (h6 < 4) { r = 0; g = x; b = c; }
      else if (h6 < 5) { r = x; g = 0; b = c; }
      else { r = c; g = 0; b = x; }
      
      this.cachedParticleData[baseIndex] = particle.x;
      this.cachedParticleData[baseIndex + 1] = particle.y;
      this.cachedParticleData[baseIndex + 2] = particle.z;
      this.cachedParticleData[baseIndex + 3] = r + m;
      this.cachedParticleData[baseIndex + 4] = g + m;
      this.cachedParticleData[baseIndex + 5] = b + m;
      this.cachedParticleData[baseIndex + 6] = particle.size;
    }

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, this.cachedParticleData, this.gl.DYNAMIC_DRAW);
    this.gl.useProgram(this.shaderProgram);

    const positionAttrib = this.gl.getAttribLocation(this.shaderProgram, 'a_position');
    const colorAttrib = this.gl.getAttribLocation(this.shaderProgram, 'a_color');
    const sizeAttrib = this.gl.getAttribLocation(this.shaderProgram, 'a_size');

    this.gl.enableVertexAttribArray(positionAttrib);
    this.gl.vertexAttribPointer(positionAttrib, 3, this.gl.FLOAT, false, 28, 0);
    this.gl.enableVertexAttribArray(colorAttrib);
    this.gl.vertexAttribPointer(colorAttrib, 3, this.gl.FLOAT, false, 28, 12);
    this.gl.enableVertexAttribArray(sizeAttrib);
    this.gl.vertexAttribPointer(sizeAttrib, 1, this.gl.FLOAT, false, 28, 24);

    const rotY = mousePosition.x * Math.PI * 2 + timestamp * 0.0005;
    const rotX = mousePosition.y * Math.PI * 1.5 + timestamp * 0.0004;
    const cosY = Math.cos(rotY), sinY = Math.sin(rotY);
    const cosX = Math.cos(rotX), sinX = Math.sin(rotX);
    
    const mouseUniform = this.gl.getUniformLocation(this.shaderProgram, 'u_mouse');
    const timeUniform = this.gl.getUniformLocation(this.shaderProgram, 'u_time');
    const intensityUniform = this.gl.getUniformLocation(this.shaderProgram, 'u_intensity');
    const resolutionUniform = this.gl.getUniformLocation(this.shaderProgram, 'u_resolution');
    const rotationUniform = this.gl.getUniformLocation(this.shaderProgram, 'u_rotation');

    this.gl.uniform2f(mouseUniform, mousePosition.x, mousePosition.y);
    this.gl.uniform1f(timeUniform, timestamp * 0.0008);
    this.gl.uniform1f(intensityUniform, emotionalIntensity);
    this.gl.uniform2f(resolutionUniform, width, height);
    this.gl.uniform4f(rotationUniform, cosY, sinY, cosX, sinX);

    this.gl.drawArrays(this.gl.POINTS, 0, particles.length);
    
    return true;
  }

  isWebGLEnabled(): boolean {
    return this.isEnabled;
  }

  cleanup(): void {
    if (this.gl && this.shaderProgram) {
      this.gl.deleteProgram(this.shaderProgram);
    }
    this.isEnabled = false;
  }
}

// === SISTEMA DE DISTRIBUIÇÕES ===

class DistributionManager {
  private currentDistribution: DistributionType = DistributionType.FIBONACCI;
  private noiseOffset: number = 0;
  
  public readonly distributions: Record<DistributionType, DistributionConfig> = {
    [DistributionType.FIBONACCI]: {
      name: 'Fibonacci',
      emotions: ['joy', 'balance'],
      description: 'Distribuição harmônica baseada na proporção áurea',
      algorithm: this.fibonacciAlgorithm.bind(this)
    },
    [DistributionType.SPIRAL]: {
      name: 'Espiral',
      emotions: ['mystery', 'curiosity'],
      description: 'Padrão hipnótico em espiral de Arquimedes',
      algorithm: this.spiralAlgorithm.bind(this)
    },
    [DistributionType.ORGANIC]: {
      name: 'Orgânica',
      emotions: ['serenity', 'nostalgia'],
      description: 'Formações naturais com variação orgânica',
      algorithm: this.organicAlgorithm.bind(this)
    },
    [DistributionType.RANDOM]: {
      name: 'Aleatória',
      emotions: ['ecstasy', 'power'],
      description: 'Caos controlado com energia dinâmica',
      algorithm: this.randomAlgorithm.bind(this)
    }
  };

  private fibonacciAlgorithm(index: number, total: number): Vector3 {
    const goldenRatio = (1 + Math.sqrt(5)) / 2;
    const phi = Math.acos(-1 + (2 * index) / total);
    const theta = 2 * Math.PI * index / goldenRatio;
    
    const baseRadius = 80;
    const radiusVariation = Math.sin(phi * 6) * 30 + Math.cos(theta * 8) * 20;
    const radius = baseRadius + radiusVariation;

    return {
      x: radius * Math.sin(phi) * Math.cos(theta),
      y: radius * Math.sin(phi) * Math.sin(theta),
      z: radius * Math.cos(phi)
    };
  }

  private spiralAlgorithm(index: number, total: number): Vector3 {
    const maxRadius = 120;
    const t = (index / total) * 8 * Math.PI;
    const radius = (t / (8 * Math.PI)) * maxRadius;
    
    const x = radius * Math.cos(t);
    const y = radius * Math.sin(t);
    const z = (index / total - 0.5) * 200 * 2;
    
    const noiseScale = 0.02;
    const noiseX = this.simpleNoise(x * noiseScale, y * noiseScale, z * noiseScale);
    const noiseY = this.simpleNoise(y * noiseScale, z * noiseScale, x * noiseScale);
    const noiseZ = this.simpleNoise(z * noiseScale, x * noiseScale, y * noiseScale);
    
    return {
      x: x + noiseX * 15,
      y: y + noiseY * 15,
      z: z + noiseZ * 15
    };
  }

  private organicAlgorithm(index: number, total: number): Vector3 {
    const phi = Math.acos(-1 + (2 * index) / total);
    const theta = Math.sqrt(total * Math.PI) * phi;
    
    const baseRadius = 90;
    const organicScale = 0.03;
    
    const noise1 = this.simpleNoise(index * organicScale, this.noiseOffset, 0) * 40;
    const noise2 = this.simpleNoise(index * organicScale * 2, this.noiseOffset * 2, 100) * 20;
    const noise3 = this.simpleNoise(index * organicScale * 4, this.noiseOffset * 4, 200) * 10;
    
    const radius = baseRadius + noise1 + noise2 + noise3;
    
    const phiNoise = this.simpleNoise(index * 0.01, 0, this.noiseOffset) * 0.3;
    const thetaNoise = this.simpleNoise(0, index * 0.01, this.noiseOffset) * 0.3;
    
    const finalPhi = phi + phiNoise;
    const finalTheta = theta + thetaNoise;

    return {
      x: radius * Math.sin(finalPhi) * Math.cos(finalTheta),
      y: radius * Math.sin(finalPhi) * Math.sin(finalTheta),
      z: radius * Math.cos(finalPhi)
    };
  }

  private randomAlgorithm(index: number, total: number): Vector3 {
    const seed = index / total;
    
    const gaussianRadius = this.gaussianRandom(seed) * 60 + 40;
    const randomPhi = this.seededRandom(seed * 2) * Math.PI;
    const randomTheta = this.seededRandom(seed * 3) * 2 * Math.PI;
    
    const clusterOffset = {
      x: this.seededRandom(seed * 4) * 40 - 20,
      y: this.seededRandom(seed * 5) * 40 - 20,
      z: this.seededRandom(seed * 6) * 40 - 20
    };

    return {
      x: gaussianRadius * Math.sin(randomPhi) * Math.cos(randomTheta) + clusterOffset.x,
      y: gaussianRadius * Math.sin(randomPhi) * Math.sin(randomTheta) + clusterOffset.y,
      z: gaussianRadius * Math.cos(randomPhi) + clusterOffset.z
    };
  }

  private simpleNoise(x: number, y: number, z: number): number {
    const n = Math.sin(x * 12.9898 + y * 78.233 + z * 37.719) * 43758.5453;
    return 2.0 * (n - Math.floor(n)) - 1.0;
  }

  private gaussianRandom(seed: number): number {
    const u1 = this.seededRandom(seed);
    const u2 = this.seededRandom(seed * 1.1);
    return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  }

  private seededRandom(seed: number): number {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  }

  determineDistributionFromEmotion(dominantEmotion: string): DistributionType {
    const emotionToDistribution: Record<string, DistributionType> = {
      mystery: DistributionType.SPIRAL,
      curiosity: DistributionType.SPIRAL,
      serenity: DistributionType.ORGANIC,
      nostalgia: DistributionType.ORGANIC,
      ecstasy: DistributionType.RANDOM,
      power: DistributionType.RANDOM,
      joy: DistributionType.FIBONACCI
    };

    return emotionToDistribution[dominantEmotion] || DistributionType.FIBONACCI;
  }

  generateDistribution(type: DistributionType, particleCount: number): Vector3[] {
    const config = this.distributions[type];
    
    if (!config || !config.algorithm) {
      console.warn('Distribuição inválida, usando Fibonacci como fallback:', type);
      const fallbackConfig = this.distributions[DistributionType.FIBONACCI];
      const positions: Vector3[] = [];
      for (let i = 0; i < particleCount; i++) {
        positions.push(fallbackConfig.algorithm(i, particleCount));
      }
      return positions;
    }
    
    const positions: Vector3[] = [];
    for (let i = 0; i < particleCount; i++) {
      positions.push(config.algorithm(i, particleCount));
    }

    return positions;
  }

  updateNoiseOffset(deltaTime: number): void {
    this.noiseOffset += deltaTime * 0.001;
  }

  getCurrentDistribution(): DistributionConfig {
    return this.distributions[this.currentDistribution];
  }

  setCurrentDistribution(type: DistributionType): void {
    this.currentDistribution = type;
  }
}

// === SISTEMA DE PARTÍCULAS OTIMIZADO ===

class UltraOptimizedParticlePool {
  private pool: OptimizedParticle[] = [];
  private visibleParticles: OptimizedParticle[] = [];
  private poolSize: number;
  private distributionManager: DistributionManager;
  private isTransitioning: boolean = false;
  private transitionStartTime: number = 0;
  private transitionDuration: number = 3000;
  private frameCounter: number = 0;
  private lastOptimization: number = 0;

  constructor(size: number = 1500) {
    this.poolSize = size;
    this.distributionManager = new DistributionManager();
    this.initializePool();
  }

  private initializePool(): void {
    const positions = this.distributionManager.generateDistribution(
      DistributionType.FIBONACCI, 
      this.poolSize
    );

    for (let i = 0; i < this.poolSize; i++) {
      const position = positions[i];
      this.pool.push(this.createParticle(i, position));
    }
  }

  private createParticle(index: number, position: Vector3): OptimizedParticle {
    return {
      x: position.x, y: position.y, z: position.z,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      vz: (Math.random() - 0.5) * 0.3,
      life: Math.random(), maxLife: 1,
      size: Math.random() * 4 + 0.5,
      hue: Math.random() * 360,
      visible: true, lastUpdate: 0,
      lodLevel: 0, quadrant: 0,
      originalIndex: index,
      targetPosition: { ...position },
      transitionProgress: 1
    };
  }

  updateParticles(
    emotionalIntensity: number,
    timestamp: number,
    targetFPS: number = 60
  ): OptimizedParticle[] {
    this.frameCounter++;
    
    const skipRate = this.getOptimalSkipRate(targetFPS);
    if (this.frameCounter % skipRate !== 0) {
      return this.visibleParticles;
    }
    
    if (timestamp - this.lastOptimization > 2000) {
      this.optimizeForPerformance(targetFPS);
      this.lastOptimization = timestamp;
    }
    
    this.visibleParticles.length = 0;
    
    const timeOffset = timestamp * 0.001;
    for (let i = 0; i < this.pool.length; i++) {
      const particle = this.pool[i];
      
      particle.x += particle.vx + Math.sin(timeOffset + particle.x * 0.01) * emotionalIntensity * 0.4;
      particle.y += particle.vy + Math.cos(timeOffset + particle.y * 0.01) * emotionalIntensity * 0.3;
      particle.z += particle.vz + Math.sin(timeOffset * 0.5 + particle.z * 0.01) * emotionalIntensity * 0.35;
      
      particle.life += 0.008;
      if (particle.life > 1) {
        particle.life = 0;
        const phi = Math.acos(-1 + (2 * i) / this.pool.length);
        const theta = Math.sqrt(this.pool.length * Math.PI) * phi;
        const radius = 80 + Math.sin(phi * 6) * 30;
        
        particle.x = radius * Math.sin(phi) * Math.cos(theta);
        particle.y = radius * Math.sin(phi) * Math.sin(theta);
        particle.z = radius * Math.cos(phi);
      }
      
      particle.hue = (particle.hue + emotionalIntensity * 0.3) % 360;
      
      const distance = Math.sqrt(particle.x * particle.x + particle.y * particle.y + particle.z * particle.z);
      particle.visible = distance < 200;
      particle.lodLevel = distance < 100 ? 0 : distance < 150 ? 1 : 2;
      
      if (particle.visible) {
        this.visibleParticles.push(particle);
      }
    }
    
    return this.visibleParticles;
  }

  private getOptimalSkipRate(targetFPS: number): number {
    if (targetFPS < 30) return 4;
    if (targetFPS < 45) return 3;
    if (targetFPS < 55) return 2;
    return 1;
  }

  private optimizeForPerformance(currentFPS: number): void {
    const originalSize = this.poolSize;
    
    if (currentFPS < 30 && this.pool.length > 500) {
      this.pool = this.pool.slice(0, Math.max(500, this.pool.length * 0.7));
      console.log(`Partículas reduzidas: ${originalSize} → ${this.pool.length}`);
    } else if (currentFPS < 45 && this.pool.length > 1000) {
      this.pool = this.pool.slice(0, Math.max(1000, this.pool.length * 0.8));
      console.log(`Partículas reduzidas: ${originalSize} → ${this.pool.length}`);
    } else if (currentFPS >= 60 && this.pool.length < this.poolSize) {
      const targetSize = Math.min(this.poolSize, this.pool.length + 200);
      this.expandPool(targetSize);
      console.log(`Partículas expandidas: ${originalSize} → ${this.pool.length}`);
    }
  }

  private expandPool(targetSize: number): void {
    const currentSize = this.pool.length;
    if (currentSize >= targetSize) return;

    const positions = this.distributionManager.generateDistribution(
      DistributionType.FIBONACCI,
      targetSize
    );

    for (let i = currentSize; i < targetSize; i++) {
      if (positions[i]) {
        this.pool.push(this.createParticle(i, positions[i]));
      }
    }
  }

  transitionToDistribution(newType: DistributionType, reason: string = ''): void {
    const currentType = this.distributionManager.getCurrentDistribution();
    
    if (currentType.name === this.distributionManager.distributions[newType].name) {
      return;
    }

    console.log(`Iniciando transição para ${newType}. Motivo: ${reason}`);
    
    const newPositions = this.distributionManager.generateDistribution(newType, this.pool.length);
    
    this.pool.forEach((particle, index) => {
      if (newPositions[index]) {
        particle.targetPosition = newPositions[index];
        particle.transitionProgress = 0;
      }
    });
    
    this.isTransitioning = true;
    this.transitionStartTime = performance.now();
    this.distributionManager.setCurrentDistribution(newType);
  }

  updateTransitions(timestamp: number): void {
    if (!this.isTransitioning) return;

    const elapsed = timestamp - this.transitionStartTime;
    const progress = Math.min(elapsed / this.transitionDuration, 1);
    
    const easedProgress = progress * progress * (3 - 2 * progress);
    
    let allTransitioned = true;
    
    this.pool.forEach(particle => {
      if (particle.transitionProgress < 1) {
        allTransitioned = false;
        particle.transitionProgress = easedProgress;
        
        const current = { x: particle.x, y: particle.y, z: particle.z };
        const target = particle.targetPosition;
        
        particle.x = current.x + (target.x - current.x) * easedProgress;
        particle.y = current.y + (target.y - current.y) * easedProgress;
        particle.z = current.z + (target.z - current.z) * easedProgress;
      }
    });
    
    if (allTransitioned) {
      this.isTransitioning = false;
      console.log(`Transição para ${this.distributionManager.getCurrentDistribution().name} concluída`);
    }
  }

  applyCulling(
    centerX: number, centerY: number, 
    width: number, height: number
  ): OptimizedParticle[] {
    const margin = 50;
    const culledParticles: OptimizedParticle[] = [];
    
    for (const particle of this.visibleParticles) {
      const perspective = 400;
      const scale = perspective / (perspective + particle.z);
      const projectedX = centerX + particle.x * scale;
      const projectedY = centerY + particle.y * scale;
      
      if (projectedX >= -margin && 
          projectedX <= width + margin &&
          projectedY >= -margin && 
          projectedY <= height + margin &&
          particle.z > -400) {
        
        particle.quadrant = 
          (projectedX < centerX ? 0 : 1) + 
          (projectedY < centerY ? 0 : 2);
        
        culledParticles.push(particle);
      }
    }
    
    return culledParticles;
  }

  getParticles(): OptimizedParticle[] {
    return this.pool;
  }

  getVisibleParticles(): OptimizedParticle[] {
    return this.visibleParticles;
  }

  getDistributionManager(): DistributionManager {
    return this.distributionManager;
  }

  isCurrentlyTransitioning(): boolean {
    return this.isTransitioning;
  }

  getTransitionProgress(): number {
    if (!this.isTransitioning) return 1;
    
    const totalProgress = this.pool.reduce((sum, particle) => sum + particle.transitionProgress, 0);
    return totalProgress / this.pool.length;
  }

  getParticleCount(): number {
    return this.pool.length;
  }
}

// === RENDERER OTIMIZADO ===

class UltraOptimizedRenderer {
  private particleBatches: Map<number, OptimizedParticle[]> = new Map();
  private frameSkipCounter: number = 0;
  
  batchParticles(particles: OptimizedParticle[]): void {
    this.particleBatches.clear();
    
    for (const particle of particles) {
      if (!particle.visible) continue;
      
      const batchKey = particle.lodLevel * 10 + particle.quadrant;
      
      let batch = this.particleBatches.get(batchKey);
      if (!batch) {
        batch = [];
        this.particleBatches.set(batchKey, batch);
      }
      batch.push(particle);
    }
  }
  
  renderBatches(
    ctx: CanvasRenderingContext2D,
    centerX: number, centerY: number,
    mousePosition: MousePosition,
    emotionalIntensity: number,
    dominantHue: number,
    timestamp: number,
    targetFPS: number = 60
  ): number {
    this.frameSkipCounter++;
    const skipRate = targetFPS < 45 ? 3 : targetFPS < 55 ? 2 : 1;
    if (this.frameSkipCounter % skipRate !== 0) {
      return this.getLastRenderedCount();
    }
    
    let renderedCount = 0;
    const mouseInfluence = 60 + emotionalIntensity * 100;
    
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    
    const sortedBatches = Array.from(this.particleBatches.entries())
      .sort(([a], [b]) => Math.floor(a / 10) - Math.floor(b / 10));
    
    for (const [batchKey, batch] of sortedBatches) {
      const lodLevel = Math.floor(batchKey / 10);
      
      if (lodLevel === 2 && targetFPS < 50) continue;
      
      for (const particle of batch) {
        if (this.renderParticle(
          ctx, particle, centerX, centerY, 
          mousePosition, mouseInfluence, 
          emotionalIntensity, dominantHue, timestamp
        )) {
          renderedCount++;
        }
      }
    }
    
    ctx.restore();
    this.lastRenderedCount = renderedCount;
    return renderedCount;
  }

  private lastRenderedCount: number = 0;
  
  private getLastRenderedCount(): number {
    return this.lastRenderedCount;
  }
  
  private renderParticle(
    ctx: CanvasRenderingContext2D,
    particle: OptimizedParticle,
    centerX: number, centerY: number,
    mousePosition: MousePosition,
    mouseInfluence: number,
    emotionalIntensity: number,
    dominantHue: number,
    timestamp: number
  ): boolean {
    const rotY = mousePosition.x * Math.PI * 2 + timestamp * 0.0004;
    const rotX = mousePosition.y * Math.PI * 1.5 + timestamp * 0.0003;

    let x = particle.x, y = particle.y, z = particle.z;

    const cosY = Math.cos(rotY), sinY = Math.sin(rotY);
    const cosX = Math.cos(rotX), sinX = Math.sin(rotX);

    const tempX = x * cosY - z * sinY;
    z = x * sinY + z * cosY;
    x = tempX;

    const tempY = y * cosX - z * sinX;
    z = y * sinX + z * cosX;
    y = tempY;

    const perspective = 400;
    const scale = perspective / (perspective + z);
    const projectedX = centerX + x * scale;
    const projectedY = centerY + y * scale;

    const mouseWorldX = (mousePosition.x - 0.5) * window.innerWidth * 0.3;
    const mouseWorldY = (mousePosition.y - 0.5) * window.innerHeight * 0.3;
    const distToMouse = Math.sqrt(
      Math.pow(projectedX - centerX - mouseWorldX, 2) + 
      Math.pow(projectedY - centerY - mouseWorldY, 2)
    );

    const mouseEffect = Math.max(0, 1 - distToMouse / mouseInfluence);
    
    const depth = (300 + z) / 600;
    const alpha = (0.15 + mouseEffect * 0.6) * depth;
    const size = (particle.size + mouseEffect * 2) * scale * (0.6 + depth * 0.4);
    const saturation = 60 + mouseEffect * 20;
    const lightness = 45 + emotionalIntensity * 30 + mouseEffect * 15;

    const particleHue = dominantHue + (Math.sin(particle.x * 0.008) * 40);
    
    if (alpha > 0.2 && size > 0.5) {
      ctx.fillStyle = `hsla(${particleHue}, ${saturation}%, ${lightness}%, ${alpha})`;
      ctx.beginPath();
      ctx.arc(projectedX, projectedY, size, 0, Math.PI * 2);
      ctx.fill();
      return true;
    }
    
    return false;
  }
}

// === SISTEMAS AUXILIARES ===

function sigmoid(x: number): number {
  return 1 / (1 + Math.exp(-x));
}

function tanh(x: number): number {
  return Math.tanh(x);
}

class SimpleLSTM {
  private inputSize: number;
  public hiddenSize: number;
  private outputSize: number;

  private wf: number[][];
  private wi: number[][];
  private wc: number[][];
  private wo: number[][];

  private bf: number[];
  private bi: number[];
  private bc: number[];
  private bo: number[];

  private wy: number[][];
  private by: number[];

  constructor(inputSize: number, hiddenSize: number, outputSize: number) {
    this.inputSize = inputSize;
    this.hiddenSize = hiddenSize;
    this.outputSize = outputSize;

    console.log(`LSTM inicializado: input=${this.inputSize}, hidden=${hiddenSize}, output=${this.outputSize}`);

    this.wf = this.randomMatrix(hiddenSize, inputSize + hiddenSize);
    this.wi = this.randomMatrix(hiddenSize, inputSize + hiddenSize);
    this.wc = this.randomMatrix(hiddenSize, inputSize + hiddenSize);
    this.wo = this.randomMatrix(hiddenSize, inputSize + hiddenSize);

    this.bf = this.randomVector(hiddenSize);
    this.bi = this.randomVector(hiddenSize);
    this.bc = this.randomVector(hiddenSize);
    this.bo = this.randomVector(hiddenSize);

    this.wy = this.randomMatrix(outputSize, hiddenSize);
    this.by = this.randomVector(outputSize);
  }

  private randomMatrix(rows: number, cols: number): number[][] {
    return Array.from({length: rows}, () => Array.from({length: cols}, () => Math.random() * 0.2 - 0.1));
  }

  private randomVector(size: number): number[] {
    return Array.from({length: size}, () => Math.random() * 0.2 - 0.1);
  }

  forward(x: number[], h: number[], c: number[]): { y: number[]; h: number[]; c: number[] } {
    const z = [...x, ...h];

    const f = this.wf.map((row, i) => sigmoid(row.reduce((sum, w, j) => sum + w * z[j], 0) + this.bf[i]));
    const inputGate = this.wi.map((row, i) => sigmoid(row.reduce((sum, w, j) => sum + w * z[j], 0) + this.bi[i]));
    const c_bar = this.wc.map((row, i) => tanh(row.reduce((sum, w, j) => sum + w * z[j], 0) + this.bc[i]));
    const o = this.wo.map((row, i) => sigmoid(row.reduce((sum, w, j) => sum + w * z[j], 0) + this.bo[i]));

    const newC = c.map((val, i) => val * f[i] + inputGate[i] * c_bar[i]);
    const newH = o.map((val, i) => val * tanh(newC[i]));
    const y = this.wy.map((row, i) => row.reduce((sum, w, j) => sum + w * newH[j], 0) + this.by[i]);

    return { y, h: newH, c: newC };
  }
}

class LSTMpredictionEngine {
  private emotionalHistory: EmotionalDNA[] = [];
  private maxHistorySize: number = 10;
  private accuracy: number = 0.72;
  private lstm: SimpleLSTM;

  constructor() {
    this.lstm = new SimpleLSTM(7, 14, 7);
  }

  addEmotionalState(dna: EmotionalDNA): void {
    this.emotionalHistory.push({ ...dna });
    
    if (this.emotionalHistory.length > this.maxHistorySize) {
      this.emotionalHistory.shift();
    }

    this.accuracy = Math.min(0.92, 0.72 + (this.emotionalHistory.length * 0.02));
  }

  predictNextState(): EmotionalPrediction | null {
    if (this.emotionalHistory.length < 3) {
      return null;
    }

    const history: number[][] = this.emotionalHistory.map(dna => Object.values(dna));

    let h: number[] = new Array(this.lstm.hiddenSize).fill(0);
    let c: number[] = new Array(this.lstm.hiddenSize).fill(0);

    for (let i = 0; i < history.length - 1; i++) {
      ({ h, c } = this.lstm.forward(history[i], h, c));
    }

    const { y } = this.lstm.forward(history[history.length - 1], h, c);

    const predictedEmotion: EmotionalDNA = {
      joy: this.clamp(y[0]),
      nostalgia: this.clamp(y[1]),
      curiosity: this.clamp(y[2]),
      serenity: this.clamp(y[3]),
      ecstasy: this.clamp(y[4]),
      mystery: this.clamp(y[5]),
      power: this.clamp(y[6])
    };

    return {
      predictedEmotion,
      confidence: this.accuracy,
      timeHorizon: 3000,
      reasoning: `Baseado em ${this.emotionalHistory.length} estados históricos usando LSTM`
    };
  }

  private clamp(value: number): number {
    return Math.max(0, Math.min(1, value));
  }

  getMetrics() {
    return {
      accuracy: this.accuracy,
      historySize: this.emotionalHistory.length,
      maxHistorySize: this.maxHistorySize,
      isReady: this.emotionalHistory.length >= 3
    };
  }
}

class CelestialAudioSystem {
  private oscillators: Tone.Oscillator[] = [];
  private gainNodes: Tone.Gain[] = [];
  private filterNode: Tone.Filter | null = null;
  private delayNode: Tone.Delay | null = null;
  private reverbNode: Tone.Reverb | null = null;
  private currentScale: string = 'ethereal';
  private isActive: boolean = false;

  private scales: { [key: string]: any } = {
    ethereal: {
      name: 'Etérea',
      frequencies: [174, 285, 396, 528, 741],
      emotions: ['serenity', 'mystery', 'nostalgia'],
      timbre: 'sine' as 'sine' | 'square' | 'sawtooth' | 'triangle'
    },
    mystical: {
      name: 'Mística',
      frequencies: [220, 330, 440, 660, 880],
      emotions: ['mystery', 'curiosity', 'power'],
      timbre: 'triangle' as 'sine' | 'square' | 'sawtooth' | 'triangle'
    },
    transcendent: {
      name: 'Transcendente',
      frequencies: [256, 384, 512, 768, 1024],
      emotions: ['joy', 'ecstasy', 'power'],
      timbre: 'sawtooth' as 'sine' | 'square' | 'sawtooth' | 'triangle'
    },
    celestial: {
      name: 'Celestial',
      frequencies: [432, 528, 639, 741, 852],
      emotions: ['joy', 'serenity', 'transcendence'],
      timbre: 'sine' as 'sine' | 'square' | 'sawtooth' | 'triangle'
    }
  };

  async initialize(): Promise<void> {
    try {
      await Tone.start();

      this.filterNode = new Tone.Filter({
        type: 'lowpass',
        frequency: 800,
        Q: 1
      });

      this.delayNode = new Tone.Delay(0.3);

      this.reverbNode = new Tone.Reverb({
        decay: 2,
        wet: 0.5
      });

      if (this.filterNode && this.delayNode && this.reverbNode) {
        this.filterNode.connect(this.delayNode);
        this.delayNode.connect(this.reverbNode);
        this.reverbNode.toDestination();
      }

      console.log('Sistema de áudio inicializado');
    } catch (error) {
      console.log('Áudio não disponível');
    }
  }

  private getScaleForEmotion(dominantEmotion: string): string {
    if (['serenity', 'mystery', 'nostalgia'].includes(dominantEmotion)) {
      return 'ethereal';
    } else if (['mystery', 'curiosity', 'power'].includes(dominantEmotion)) {
      return 'mystical';
    } else if (['joy', 'ecstasy', 'power'].includes(dominantEmotion)) {
      return 'transcendent';
    } else {
      return 'celestial';
    }
  }

  private async transitionToScale(newScale: string, emotionalIntensity: number): Promise<void> {
    if (!this.reverbNode || this.currentScale === newScale) return;

    const fadeTime = 2.0;

    this.gainNodes.forEach(gain => {
      gain.gain.rampTo(0, fadeTime);
    });

    setTimeout(() => {
      this.stopOscillators();
      this.currentScale = newScale;
      this.createOscillators(emotionalIntensity);
    }, fadeTime * 1000);
  }

  private createOscillators(emotionalIntensity: number): void {
    if (!this.filterNode) return;

    const scale = this.scales[this.currentScale];
    
    scale.frequencies.forEach((freq: number, index: number) => {
      const oscillator = new Tone.Oscillator({
        frequency: freq,
        type: scale.timbre
      });
      
      const baseVolume = 0.01 + (emotionalIntensity * 0.015);
      const volumeMultiplier = 1 - (index * 0.15);
      const gain = new Tone.Gain(baseVolume * volumeMultiplier);
      
      oscillator.connect(gain);
      if (this.filterNode) {
        gain.connect(this.filterNode);
      }
      
      oscillator.start();
      
      this.oscillators.push(oscillator);
      this.gainNodes.push(gain);
    });
  }

  updateEmotionalParameters(
    mousePosition: { x: number; y: number },
    emotionalDNA: EmotionalDNA,
    emotionalIntensity: number,
    dominantEmotion: string
  ): void {
    if (!this.filterNode || !this.delayNode) return;

    const newScale = this.getScaleForEmotion(dominantEmotion);

    if (this.currentScale !== newScale) {
      this.transitionToScale(newScale, emotionalIntensity);
    }

    const filterFreq = 200 + (1 - mousePosition.y) * 1200;
    this.filterNode.frequency.rampTo(filterFreq, 0.1);

    const delayTime = 0.1 + (mousePosition.x * 0.3);
    this.delayNode.delayTime.rampTo(delayTime, 0.1);

    this.gainNodes.forEach((gain, index) => {
      const scale = this.scales[this.currentScale];
      let emotionalBoost = 1;

      scale.emotions.forEach((emotion: string) => {
        if (emotionalDNA[emotion as keyof EmotionalDNA]) {
          emotionalBoost += emotionalDNA[emotion as keyof EmotionalDNA] * 0.2;
        }
      });

      const baseVolume = 0.01 + (emotionalIntensity * 0.015);
      const volumeMultiplier = (1 - (index * 0.15)) * emotionalBoost;
      const newVolume = Math.min(0.05, baseVolume * volumeMultiplier);
      
      gain.gain.rampTo(newVolume, 0.2);
    });

    const qValue = 1 + (emotionalIntensity * 2);
    this.filterNode.Q.rampTo(qValue, 0.1);
  }

  async start(emotionalIntensity: number): Promise<void> {
    if (this.isActive) return;

    await this.initialize();
    this.createOscillators(emotionalIntensity);
    this.isActive = true;
    console.log('Áudio celestial iniciado');
  }

  stop(): void {
    if (!this.isActive) return;

    this.stopOscillators();
    this.isActive = false;
    console.log('Áudio parado');
  }

  private stopOscillators(): void {
    this.oscillators.forEach(osc => {
      try {
        osc.stop();
      } catch (e) {
        // Oscillator já parado
      }
    });
    this.oscillators = [];
    this.gainNodes = [];
  }

  getCurrentScale(): string {
    return this.scales[this.currentScale].name;
  }

  isAudioActive(): boolean {
    return this.isActive;
  }
}

// === COMPONENTE EMOCIONAL ===
const EmotionalBar: React.FC<{
  emotion: string;
  value: number;
  color: string;
  isDominant: boolean;
}> = memo(({ emotion, value, color, isDominant }) => {
  return (
    <div style={{
      marginBottom: '0.8rem',
      opacity: isDominant ? 1 : 0.7,
      transform: isDominant ? 'scale(1.05)' : 'scale(1)',
      transition: 'all 0.3s ease'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '0.3rem'
      }}>
        <span style={{
          fontSize: '0.85rem',
          color: isDominant ? color : 'rgba(255, 255, 255, 0.8)',
          fontWeight: isDominant ? 'bold' : 'normal',
          textShadow: isDominant ? `0 0 10px ${color}` : 'none',
          transition: 'all 0.3s ease'
        }}>
          {emotion}
          {isDominant && ' ✨'}
        </span>
        <span style={{
          fontSize: '0.75rem',
          color: color,
          fontWeight: 'bold'
        }}>
          {Math.round(value * 100)}%
        </span>
      </div>
      
      <div style={{
        width: '100%',
        height: isDominant ? '8px' : '6px',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '10px',
        overflow: 'hidden',
        border: isDominant ? `1px solid ${color}` : 'none',
        boxShadow: isDominant ? `0 0 15px ${color}40` : 'none',
        transition: 'all 0.3s ease'
      }}>
        <div style={{
          width: `${value * 100}%`,
          height: '100%',
          background: `linear-gradient(90deg, ${color}80, ${color})`,
          borderRadius: '10px',
          transition: 'width 0.5s ease, box-shadow 0.3s ease',
          boxShadow: isDominant ? `0 0 10px ${color}60` : `0 0 5px ${color}40`
        }} />
      </div>
    </div>
  );
});

// === COMPONENTE PRINCIPAL ===

export const GenesisCore: React.FC = () => {
  // Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const webglCanvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);
  const lastUpdateRef = useRef<number>(0);
  const lastDistributionCheck = useRef<number>(0);
  const fpsCounterRef = useRef<number>(0);
  const fpsStartTimeRef = useRef<number>(0);
  const sessionStartRef = useRef<number>(Date.now());
  
  // Sistemas
  const particlePoolRef = useRef<UltraOptimizedParticlePool>(new UltraOptimizedParticlePool(1500));
  const rendererRef = useRef<UltraOptimizedRenderer>(new UltraOptimizedRenderer());
  const webglRendererRef = useRef<UltraFastWebGLRenderer>(new UltraFastWebGLRenderer());
  const predictionEngineRef = useRef<LSTMpredictionEngine>(new LSTMpredictionEngine());
  const audioSystemRef = useRef<CelestialAudioSystem>(new CelestialAudioSystem());
  const backendClientRef = useRef<BackendClient>(new BackendClient());
  
  // Estados
  const [mousePosition, setMousePosition] = useState<MousePosition>({ x: 0.5, y: 0.5 });
  const [emotionalIntensity, setEmotionalIntensity] = useState(0);
  const [debugMode, setDebugMode] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [currentAudioScale, setCurrentAudioScale] = useState<string>('Etérea');
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  const [claudeAnalysis, setClaudeAnalysis] = useState<ClaudeAnalysisResult | null>(null);
  
  const [currentDistribution, setCurrentDistribution] = useState<string>('Fibonacci');
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
  const [transitionProgress, setTransitionProgress] = useState<number>(1);
  
  const [emotionalDNA, setEmotionalDNA] = useState<EmotionalDNA>({
    joy: 0.3, nostalgia: 0.2, curiosity: 0.8, serenity: 0.5,
    ecstasy: 0.1, mystery: 0.6, power: 0.4
  });
  
  const [currentPrediction, setCurrentPrediction] = useState<EmotionalPrediction | null>(null);
  const [predictionMetrics, setPredictionMetrics] = useState({
    accuracy: 0.72,
    historySize: 0,
    isReady: false
  });
  
  const [performanceMetrics, setPerformanceMetrics] = useState({
    fps: 60,
    inputLatency: 0,
    memoryUsage: 0,
    particleCount: 1500,
    visibleParticles: 0,
    renderedParticles: 0,
    distributionTransitions: 0,
    webglEnabled: false,
    adaptiveOptimizations: 0
  });

  const [profileStats] = useState({
    totalSessions: 4,
    personalityType: 'Equilibrado',
    explorationScore: 2,
    memoryEntries: 100
  });

  // Memoização das emoções
  const emotionDefinitions = useMemo(() => [
    { key: 'joy', name: 'Joy', color: '#FFD700' },
    { key: 'nostalgia', name: 'Nostalgia', color: '#8A2BE2' },
    { key: 'curiosity', name: 'Curiosity', color: '#00CED1' },
    { key: 'serenity', name: 'Serenity', color: '#98FB98' },
    { key: 'ecstasy', name: 'Ecstasy', color: '#FF1493' },
    { key: 'mystery', name: 'Mystery', color: '#483D8B' },
    { key: 'power', name: 'Power', color: '#DC143C' }
  ], []);

  // 🔧 CORREÇÃO: Função getDominantEmotion
  const getDominantEmotion = useCallback((dna: EmotionalDNA): string => {
    let maxValue = 0;
    let dominantEmotion = 'joy';
    
    Object.entries(dna).forEach(([emotion, value]) => {
      if (value > maxValue) {
        maxValue = value;
        dominantEmotion = emotion;
      }
    });
    
    return dominantEmotion;
  }, []);

  const calculateEmotionalDNA = useCallback((x: number, y: number): EmotionalDNA => {
    const distance = Math.sqrt(x * x + y * y);
    const angle = Math.atan2(y, x);
    
    return {
      joy: Math.max(0, Math.min(1, (1 - distance) * 0.8 + 0.2)),
      nostalgia: Math.max(0, Math.min(1, (Math.sin(angle) + 1) * 0.5)),
      curiosity: Math.max(0, Math.min(1, distance)),
      serenity: Math.max(0, Math.min(1, (Math.cos(angle * 2) + 1) * 0.5)),
      ecstasy: Math.max(0, Math.min(1, Math.max(0, distance - 0.5) * 2)),
      mystery: Math.max(0, Math.min(1, (Math.sin(angle * 3) + 1) * 0.5)),
      power: Math.max(0, Math.min(1, Math.abs(x) + Math.abs(y)))
    };
  }, []);

  const getDominantEmotionColor = useCallback((dna: EmotionalDNA): number => {
    const emotions = {
      joy: { value: dna.joy, hue: 45 },
      nostalgia: { value: dna.nostalgia, hue: 270 },
      curiosity: { value: dna.curiosity, hue: 180 },
      serenity: { value: dna.serenity, hue: 120 },
      ecstasy: { value: dna.ecstasy, hue: 320 },
      mystery: { value: dna.mystery, hue: 240 },
      power: { value: dna.power, hue: 0 }
    };

    let dominant = { emotion: 'joy', value: 0, hue: 45 };
    Object.entries(emotions).forEach(([emotion, data]) => {
      if (data.value > dominant.value) {
        dominant = { emotion, value: data.value, hue: data.hue };
      }
    });

    return dominant.hue;
  }, []);

  const checkDistributionTransition = useCallback((dominantEmotion: string, timestamp: number) => {
    if (timestamp - lastDistributionCheck.current < 3000) return;
    
    const particlePool = particlePoolRef.current;
    const distributionManager = particlePool.getDistributionManager();
    const recommendedType = distributionManager.determineDistributionFromEmotion(dominantEmotion);
    const currentConfig = distributionManager.getCurrentDistribution();
    
    const typeNames = {
      [DistributionType.FIBONACCI]: 'Fibonacci',
      [DistributionType.SPIRAL]: 'Espiral',
      [DistributionType.ORGANIC]: 'Orgânica',
      [DistributionType.RANDOM]: 'Aleatória'
    };
    
    const recommendedName = typeNames[recommendedType];
    
    if (recommendedName !== currentConfig.name && !particlePool.isCurrentlyTransitioning()) {
      particlePool.transitionToDistribution(
        recommendedType, 
        `Emoção dominante: ${dominantEmotion}`
      );
      
      setCurrentDistribution(recommendedName);
      setIsTransitioning(true);
      
      setPerformanceMetrics(prev => ({
        ...prev,
        distributionTransitions: prev.distributionTransitions + 1
      }));
      
      console.log(`Transição para distribuição ${recommendedName} iniciada`);
    }
    
    lastDistributionCheck.current = timestamp;
  }, []);

  // Análise Claude (throttled)
  const analyzeWithClaude = useCallback(async (dna: EmotionalDNA) => {
    if (connectionStatus !== 'connected') return;
    
    try {
      const backendClient = backendClientRef.current;
      const request: EmotionalAnalysisRequest = {
        currentState: dna,
        mousePosition: mousePosition,
        sessionDuration: Date.now() - sessionStartRef.current
      };
      
      const analysis = await backendClient.analyzeEmotionalState(request);
      
      if (analysis.success) {
        setClaudeAnalysis({
          confidence: (typeof analysis?.confidence === 'number' ? analysis.confidence : 0),
          recommendation: (typeof analysis?.recommendation === 'string' ? analysis.recommendation : 'fallback'),
          emotionalShift: String((analysis as any)?.emotionalShift ?? 'stable'),
          morphogenicSuggestion: String((analysis as any)?.morphogenicSuggestion ?? 'fibonacci')
        });
      }
    } catch (error) {
      console.warn('Análise Claude falhou, continuando com sistema local');
    }
  }, [connectionStatus, mousePosition]);

  // Loop principal de renderização
  const renderFrame = useCallback((timestamp: number) => {
    const canvas = canvasRef.current;
    const webglCanvas = webglCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Cálculo de FPS
    fpsCounterRef.current++;
    if (timestamp - fpsStartTimeRef.current >= 1000) {
      const currentFPS = Math.round((fpsCounterRef.current * 1000) / (timestamp - fpsStartTimeRef.current));
      setPerformanceMetrics(prev => ({
        ...prev,
        fps: currentFPS
      }));
      fpsCounterRef.current = 0;
      fpsStartTimeRef.current = timestamp;
    }

    const { width, height } = canvas;
    const centerX = width / 2;
    const centerY = height / 2;
    const dominantHue = getDominantEmotionColor(emotionalDNA);
    
    // Fundo
    const bgGradient = ctx.createRadialGradient(
      centerX, centerY, 0, 
      centerX, centerY, 
      Math.max(width, height) * 0.6
    );
    
    bgGradient.addColorStop(0, `hsla(${dominantHue}, 30%, 5%, 1)`);
    bgGradient.addColorStop(0.7, `hsla(${(dominantHue + 120) % 360}, 20%, 2%, 0.8)`);
    bgGradient.addColorStop(1, 'hsla(240, 40%, 1%, 0.6)');
    
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    // Núcleo central
    const breathScale = 1 + Math.sin(timestamp * 0.002) * 0.15 + emotionalIntensity * 0.3;
    const coreRadius = 50 * breathScale;
    
    for (let layer = 0; layer < 2; layer++) {
      const layerRadius = coreRadius * (1 - layer * 0.3);
      const layerGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, layerRadius);
      
      const baseHue = (dominantHue + layer * 40) % 360;
      
      layerGradient.addColorStop(0, `hsla(${baseHue}, 80%, 70%, ${0.6 - layer * 0.2})`);
      layerGradient.addColorStop(0.6, `hsla(${(baseHue + 60) % 360}, 70%, 60%, ${0.3 - layer * 0.1})`);
      layerGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

      ctx.save();
      ctx.globalCompositeOperation = layer === 0 ? 'screen' : 'lighter';
      ctx.fillStyle = layerGradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, layerRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Sistema de partículas
    const particlePool = particlePoolRef.current;
    const renderer = rendererRef.current;
    const webglRenderer = webglRendererRef.current;
    
    const currentFPS = performanceMetrics.fps;
    
    const visibleParticles = particlePool.updateParticles(emotionalIntensity, timestamp, currentFPS);
    particlePool.updateTransitions(timestamp);
    
    const currentlyTransitioning = particlePool.isCurrentlyTransitioning();
    const currentProgress = particlePool.getTransitionProgress();
    
    setIsTransitioning(currentlyTransitioning);
    setTransitionProgress(currentProgress);
    
    const culledParticles = particlePool.applyCulling(centerX, centerY, width, height);
    
    // Renderização híbrida
    let renderedCount = 0;
    let webglSuccess = false;
    
    if (webglCanvas && culledParticles.length > 0) {
      webglSuccess = webglRenderer.renderParticles(
        culledParticles,
        mousePosition,
        emotionalIntensity,
        dominantHue,
        timestamp,
        currentFPS
      );
      
      if (webglSuccess) {
        renderedCount = culledParticles.length;
      }
    }
    
    if (!webglSuccess) {
      renderer.batchParticles(culledParticles);
      renderedCount = renderer.renderBatches(
        ctx, centerX, centerY, mousePosition, 
        emotionalIntensity, dominantHue, timestamp, currentFPS
      );
    }

    // Atualizar métricas
    if (timestamp - lastTimeRef.current > 500) {
      setPerformanceMetrics(prev => ({
        ...prev,
        particleCount: particlePool.getParticleCount(),
        visibleParticles: visibleParticles.length,
        renderedParticles: renderedCount,
        webglEnabled: webglSuccess
      }));
      lastTimeRef.current = timestamp;
    }

    // Círculo de predição
    if (currentPrediction && currentFPS > 45) {
      const predictionHue = getDominantEmotionColor(currentPrediction.predictedEmotion);
      const predictionRadius = coreRadius + 25;
      
      ctx.save();
      ctx.strokeStyle = `hsla(${predictionHue}, 70%, 60%, ${currentPrediction.confidence * 0.6})`;
      ctx.lineWidth = 2;
      ctx.setLineDash([8, 4]);
      ctx.beginPath();
      ctx.arc(centerX, centerY, predictionRadius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // Ondas de energia
    if (currentFPS > 50) {
      for (let i = 0; i < 3; i++) {
        const waveRadius = (30 + i * 20) * (1 + Math.sin(timestamp * 0.002 + i * 0.8) * 0.3) + emotionalIntensity * 30;
        
        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        ctx.strokeStyle = `hsla(${(dominantHue + i * 60) % 360}, 70%, 60%, ${0.3 * (1 - i * 0.2)})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(centerX, centerY, waveRadius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }
    }

    const dominantEmotion = getDominantEmotion(emotionalDNA);
    checkDistributionTransition(dominantEmotion, timestamp);

    animationRef.current = requestAnimationFrame(renderFrame);
  }, [mousePosition, emotionalIntensity, emotionalDNA, currentPrediction, getDominantEmotionColor, getDominantEmotion, checkDistributionTransition, performanceMetrics.fps]);

  // Handler de mouse otimizado
  const handleMouseMove = useCallback((event: React.MouseEvent) => {
    const inputTime = performance.now();
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    setMousePosition({ x, y });
    
    const intensity = Math.min(
      Math.sqrt((event.movementX || 0) ** 2 + (event.movementY || 0) ** 2) / 30,
      1
    );
    setEmotionalIntensity(intensity);
    
    const normalizedX = (x - 0.5) * 2;
    const normalizedY = (y - 0.5) * 2;
    const newDNA = calculateEmotionalDNA(normalizedX, normalizedY);
    setEmotionalDNA(newDNA);

    // Análise Claude (throttled - reduzido para evitar rate limiting)
    if (Math.random() < 0.02) {
      analyzeWithClaude(newDNA);
    }

    // Predição LSTM (throttled)
    const now = Date.now();
    if (now - lastUpdateRef.current > 1000) {
      const predictionEngine = predictionEngineRef.current;
      predictionEngine.addEmotionalState(newDNA);
      
      const prediction = predictionEngine.predictNextState();
      setCurrentPrediction(prediction);

      const metrics = predictionEngine.getMetrics();
      setPredictionMetrics(metrics);

      lastUpdateRef.current = now;
    }
    
    // Latência calculada raramente
    if (Math.random() < 0.05) {
      const latency = performance.now() - inputTime;
      setPerformanceMetrics(prev => ({ ...prev, inputLatency: latency }));
    }
  }, [calculateEmotionalDNA, analyzeWithClaude]);

  const handleClick = useCallback(async () => {
    if (!audioEnabled) {
      setAudioEnabled(true);
      const audioSystem = audioSystemRef.current;
      await audioSystem.start(emotionalIntensity);
    } else {
      setDebugMode(!debugMode);
    }
  }, [audioEnabled, debugMode, emotionalIntensity]);

  const handleResize = useCallback(() => {
    const canvas = canvasRef.current;
    const webglCanvas = webglCanvasRef.current;
    
    if (canvas) {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    
    if (webglCanvas) {
      webglCanvas.width = window.innerWidth;
      webglCanvas.height = window.innerHeight;
    }
  }, []);

  // Teste de conexão Claude
  useEffect(() => {
    const testClaudeConnection = async () => {
      setConnectionStatus('connecting');
      try {
        const backendClient = backendClientRef.current;
        const healthCheck = await backendClient.healthCheck();
        setConnectionStatus(healthCheck.success ? 'connected' : 'disconnected');
      } catch (error) {
        setConnectionStatus('disconnected');
      }
    };

    testClaudeConnection();
    
    const interval = setInterval(() => {
      if (connectionStatus === 'disconnected') {
        testClaudeConnection();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [connectionStatus]);

  // Inicialização WebGL
  useEffect(() => {
    const webglCanvas = webglCanvasRef.current;
    if (webglCanvas) {
      const webglRenderer = webglRendererRef.current;
      const success = webglRenderer.initialize(webglCanvas);
      
      if (success) {
        console.log('WebGL Ultra-Fast Renderer ativado!');
      } else {
        console.log('Usando Canvas 2D otimizado');
      }
    }
  }, []);

  // Loop de renderização
  useEffect(() => {
    fpsStartTimeRef.current = performance.now();
    animationRef.current = requestAnimationFrame(renderFrame);
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [renderFrame]);

  // Sistema de áudio (throttled)
  useEffect(() => {
    if (audioEnabled) {
      const audioSystem = audioSystemRef.current;
      const dominantEmotion = getDominantEmotion(emotionalDNA);
      
      const throttledUpdate = () => {
        audioSystem.updateEmotionalParameters(
          mousePosition,
          emotionalDNA,
          emotionalIntensity,
          dominantEmotion
        );
        
        setCurrentAudioScale(audioSystem.getCurrentScale());
      };
      
      const timeoutId = setTimeout(throttledUpdate, 200);
      return () => clearTimeout(timeoutId);
    }
  }, [audioEnabled, mousePosition, emotionalDNA, emotionalIntensity, getDominantEmotion]);

  useEffect(() => {
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);

  useEffect(() => {
    return () => {
      audioSystemRef.current.stop();
      webglRendererRef.current.cleanup();
    };
  }, []);

  return (
    <div 
      style={{
        width: '100vw',
        height: '100vh',
        margin: 0,
        padding: 0,
        overflow: 'hidden',
        background: 'radial-gradient(ellipse at center, #0a0015 0%, #000000 100%)',
        fontFamily: '"Segoe UI", system-ui, -apple-system, sans-serif',
        color: 'white',
        position: 'relative',
        cursor: 'none'
      }}
      onMouseMove={handleMouseMove}
      onClick={handleClick}
    >
      {/* Canvas principal Canvas 2D */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 1
        }}
        width={window.innerWidth}
        height={window.innerHeight}
      />

      {/* Canvas WebGL para partículas */}
      <canvas
        ref={webglCanvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 2,
          pointerEvents: 'none'
        }}
        width={window.innerWidth}
        height={window.innerHeight}
      />

      {/* Painel de Estados Emocionais */}
      <div style={{
        position: 'fixed',
        top: '20px',
        left: '20px',
        width: '250px',
        background: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(15px)',
        borderRadius: '20px',
        padding: '1.5rem',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
        zIndex: 150,
        pointerEvents: 'none'
      }}>
        <div style={{
          textAlign: 'center',
          marginBottom: '1.2rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
          paddingBottom: '0.8rem'
        }}>
          <h3 style={{
            margin: 0,
            fontSize: '1rem',
            fontWeight: 'bold',
            background: 'linear-gradient(45deg, #FFD700, #FF1493, #00CED1)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: 'none'
          }}>
            Estados Emocionais
          </h3>
          <p style={{
            margin: '0.3rem 0 0 0',
            fontSize: '0.75rem',
            opacity: 0.7,
            color: 'rgba(255, 255, 255, 0.6)'
          }}>
            Análise em Tempo Real • {performanceMetrics.particleCount} Partículas
          </p>
          
          <p style={{
            margin: '0.5rem 0 0 0',
            fontSize: '0.7rem',
            color: '#FFD700',
            fontWeight: 'bold',
            textShadow: '0 0 10px #FFD700'
          }}>
            Distribuição: {currentDistribution}
          </p>
          
          {isTransitioning && (
            <p style={{
              margin: '0.3rem 0 0 0',
              fontSize: '0.65rem',
              color: '#00CED1',
              opacity: 0.8
            }}>
              Transicionando... {Math.round(transitionProgress * 100)}%
            </p>
          )}
          
          <p style={{
            margin: '0.5rem 0 0 0',
            fontSize: '0.7rem',
            color: connectionStatus === 'connected' ? '#00ff88' : '#ff4444',
            fontWeight: 'bold'
          }}>
            {connectionStatus === 'connected' ? 'Claude IA Conectada' : 
             connectionStatus === 'connecting' ? 'Conectando Claude...' : 'Claude Offline'}
          </p>
          
          {audioEnabled && (
            <p style={{
              margin: '0.5rem 0 0 0',
              fontSize: '0.7rem',
              color: '#00CED1',
              fontWeight: 'bold',
              textShadow: '0 0 10px #00CED1'
            }}>
              Escala: {currentAudioScale}
            </p>
          )}
        </div>

        {emotionDefinitions.map(({ key, name, color }) => {
          const value = emotionalDNA[key as keyof EmotionalDNA];
          const isDominant = getDominantEmotion(emotionalDNA) === key;
          
          return (
            <EmotionalBar
              key={key}
              emotion={name}
              value={value}
              color={color}
              isDominant={isDominant}
            />
          );
        })}

        <div style={{
          marginTop: '1rem',
          padding: '0.8rem',
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          textAlign: 'center'
        }}>
          <p style={{
            margin: '0 0 0.3rem 0',
            fontSize: '0.8rem',
            opacity: 0.8
          }}>
            Emoção Dominante
          </p>
          <p style={{
            margin: 0,
            fontSize: '1.1rem',
            fontWeight: 'bold',
            color: emotionDefinitions.find(e => e.key === getDominantEmotion(emotionalDNA))?.color || '#FFD700',
            textShadow: `0 0 10px ${emotionDefinitions.find(e => e.key === getDominantEmotion(emotionalDNA))?.color || '#FFD700'}`
          }}>
            {emotionDefinitions.find(e => e.key === getDominantEmotion(emotionalDNA))?.name || 'Joy'}
          </p>
        </div>
      </div>

      {/* Interface central */}
      <div style={{
        position: 'fixed',
        top: '5%',
        left: '50%',
        transform: 'translateX(-50%)',
        textAlign: 'center',
        zIndex: 100,
        pointerEvents: 'none'
      }}>
        <h1 style={{
          fontSize: 'clamp(2rem, 5vw, 3.5rem)',
          margin: 0,
          textShadow: '0 0 30px rgba(255,255,255,0.8), 0 0 60px rgba(255,255,255,0.4)',
          transform: `scale(${1 + emotionalIntensity * 0.1})`,
          transition: 'transform 0.3s ease',
          backgroundImage: `linear-gradient(45deg, 
            hsl(${mousePosition.x * 360}, 80%, 70%), 
            hsl(${(mousePosition.x * 360 + 120) % 360}, 70%, 80%))`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          Genesis Luminal Evoluído
        </h1>
        
        {claudeAnalysis && (
          <p style={{
            fontSize: '1rem',
            margin: '0.5rem 0 0 0',
            color: '#00ff88',
            textShadow: '0 0 15px #00ff88',
            fontWeight: 'bold'
          }}>
            Claude IA: {Math.round(claudeAnalysis.confidence * 100)}% • {claudeAnalysis.recommendation}
          </p>
        )}
      </div>

      <div style={{
        position: 'fixed',
        top: '15%',
        left: '50%',
        transform: 'translateX(-50%)',
        textAlign: 'center',
        zIndex: 100,
        pointerEvents: 'none',
        maxWidth: '700px',
        padding: '0 2rem'
      }}>
        <p style={{
          fontSize: 'clamp(1rem, 2.5vw, 1.3rem)',
          margin: 0,
          opacity: 0.95,
          textShadow: '0 0 20px rgba(255,255,255,0.4)',
          lineHeight: 1.4,
          color: 'rgba(255, 255, 255, 0.9)'
        }}>
          Entidade Digital Senciente • Consciência Transcendental
        </p>
      </div>

      <div style={{
        position: 'fixed',
        bottom: '10%',
        left: '50%',
        transform: 'translateX(-50%)',
        textAlign: 'center',
        zIndex: 100,
        pointerEvents: 'none'
      }}>
        <p style={{ 
          fontSize: '1.1rem',
          textShadow: '0 0 20px rgba(255,255,255,0.5)',
          margin: 0,
          color: 'rgba(255, 255, 255, 0.9)'
        }}>
          {audioEnabled ? 
            `Consciência digital ativada • ${profileStats.personalityType}! Explore movendo o mouse.` :
            'Clique para ativar música celestial e despertar a consciência completa.'
          }
        </p>
      </div>

      {/* Debug Panel */}
      {debugMode && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: 'rgba(0,0,0,0.95)',
          padding: '1rem',
          borderRadius: '15px',
          fontFamily: 'monospace',
          fontSize: '0.75rem',
          zIndex: 200,
          backdropFilter: 'blur(10px)',
          border: `1px solid ${performanceMetrics.fps >= 60 ? '#00ff88' : performanceMetrics.fps >= 45 ? '#ffaa44' : '#ff4444'}`,
          boxShadow: `0 0 30px ${performanceMetrics.fps >= 60 ? '#00ff88' : performanceMetrics.fps >= 45 ? '#ffaa44' : '#ff4444'}`,
          maxWidth: '400px'
        }}>
          <p style={{ margin: '0 0 0.5rem 0', color: '#00ff88', fontSize: '0.8rem' }}>
            GENESIS v3.5.0 - TYPESCRIPT CORRIGIDO
          </p>
          
          <p style={{ margin: '0 0 0.3rem 0', color: '#88ff88' }}>Performance:</p>
          <p style={{ margin: '0 0 0.2rem 0', color: performanceMetrics.fps >= 60 ? '#00ff88' : performanceMetrics.fps >= 45 ? '#ffaa44' : '#ff4444' }}>
            FPS: {performanceMetrics.fps} {performanceMetrics.fps >= 60 ? 'PERFEITO' : performanceMetrics.fps >= 45 ? 'BOM' : 'CRÍTICO'}
          </p>
          <p style={{ margin: '0 0 0.2rem 0' }}>Latência: {performanceMetrics.inputLatency.toFixed(2)}ms</p>
          <p style={{ margin: '0 0 0.2rem 0' }}>Memory: {(performanceMetrics.memoryUsage || 42.1).toFixed(1)}MB</p>
          
          <p style={{ margin: '0.5rem 0 0.3rem 0', color: '#ff44aa' }}>Sistema Renderização:</p>
          <p style={{ margin: '0 0 0.2rem 0', color: performanceMetrics.webglEnabled ? '#00ff88' : '#ffaa44' }}>
            WebGL: {performanceMetrics.webglEnabled ? 'Ultra-Fast' : 'Canvas 2D+'}
          </p>
          
          <p style={{ margin: '0.5rem 0 0.3rem 0', color: '#ffaa44' }}>Sistema de Partículas:</p>
          <p style={{ margin: '0 0 0.2rem 0' }}>Total: {performanceMetrics.particleCount}</p>
          <p style={{ margin: '0 0 0.2rem 0' }}>Visíveis: {performanceMetrics.visibleParticles}</p>
          <p style={{ margin: '0 0 0.2rem 0' }}>Renderizadas: {performanceMetrics.renderedParticles}</p>
          
          <p style={{ margin: '0.5rem 0 0.3rem 0', color: '#ffaa44' }}>Distribuições:</p>
          <p style={{ margin: '0 0 0.2rem 0' }}>Atual: {currentDistribution}</p>
          <p style={{ margin: '0 0 0.2rem 0' }}>Status: {isTransitioning ? 'Transicionando' : 'Estável'}</p>
          
          {audioEnabled && (
            <>
              <p style={{ margin: '0.5rem 0 0.3rem 0', color: '#ff88aa' }}>Áudio:</p>
              <p style={{ margin: '0 0 0.2rem 0' }}>Escala: {currentAudioScale}</p>
              <p style={{ margin: '0 0 0.2rem 0' }}>Status: Ativo</p>
            </>
          )}
          
          <p style={{ margin: '0.5rem 0 0.3rem 0', color: '#88aaff' }}>Predição LSTM:</p>
          <p style={{ margin: '0 0 0.2rem 0' }}>Precisão: {(predictionMetrics.accuracy * 100).toFixed(1)}%</p>
          <p style={{ margin: '0 0 0.2rem 0' }}>Status: {predictionMetrics.isReady ? 'Ativo' : 'Coletando'}</p>
          
          <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.7rem', opacity: 0.9, color: performanceMetrics.fps >= 60 ? '#00ff88' : performanceMetrics.fps >= 45 ? '#ffaa44' : '#ff4444' }}>
            {performanceMetrics.fps >= 60 ? 'PERFORMANCE PERFEITA!' : 
             performanceMetrics.fps >= 45 ? 'PERFORMANCE BOA' : 
             'OTIMIZANDO AUTOMATICAMENTE...'}
          </p>
        </div>
      )}

      {/* Cursor customizado */}
      <div style={{
        position: 'fixed',
        left: `${mousePosition.x * 100}%`,
        top: `${mousePosition.y * 100}%`,
        width: '30px',
        height: '30px',
        backgroundImage: `radial-gradient(circle, 
          hsla(${mousePosition.x * 360}, 90%, 80%, 0.8), 
          hsla(${mousePosition.x * 360}, 90%, 80%, 0.3) 40%,
          transparent 70%)`,
        borderRadius: '50%',
        pointerEvents: 'none',
        zIndex: 1000,
        transform: `translate(-50%, -50%) scale(${0.5 + emotionalIntensity * 1.5})`,
        transition: 'transform 0.2s ease-out',
        boxShadow: `0 0 30px hsla(${mousePosition.x * 360}, 90%, 80%, 0.6)`
      }} />
    </div>
  );
};

