// ========================================
// GENESIS LUMINAL - MATH UTILITIES
// Status: ✅ IMPLEMENTADO - Funções matemáticas reais
// Versão: 4.0.0
// ========================================

export function sigmoid(x: number): number {
  return 1 / (1 + Math.exp(-x));
}

export function tanh(x: number): number {
  return Math.tanh(x);
}

export function clamp(value: number, min: number = 0, max: number = 1): number {
  return Math.max(min, Math.min(max, value));
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function noise3D(x: number, y: number, z: number): number {
  const n = Math.sin(x * 12.9898 + y * 78.233 + z * 37.719) * 43758.5453;
  return 2.0 * (n - Math.floor(n)) - 1.0;
}

export function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

export function gaussianRandom(seed: number): number {
  const u1 = seededRandom(seed);
  const u2 = seededRandom(seed * 1.1);
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}
