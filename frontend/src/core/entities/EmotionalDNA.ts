/* eslint-disable @typescript-eslint/no-unsafe-declaration-merging */
/**
 * 🧬 EMOTIONAL DNA - ESTRUTURA BÁSICA
 * Definição dos tipos emocionais para compatibilidade
 */

export interface EmotionalDNA {
  joy: number;
  nostalgia: number;
  curiosity: number;
  serenity: number;
  ecstasy: number;
  mystery: number;
  power: number;
}

export class EmotionalDNA {
  constructor(
    public joy: number = 0.5,
    public nostalgia: number = 0.5,
    public curiosity: number = 0.5,
    public serenity: number = 0.5,
    public ecstasy: number = 0.5,
    public mystery: number = 0.5,
    public power: number = 0.5
  ) {}

  static random(): EmotionalDNA {
    return new EmotionalDNA(
      Math.random(),
      Math.random(),
      Math.random(),
      Math.random(),
      Math.random(),
      Math.random(),
      Math.random()
    );
  }

  clone(): EmotionalDNA {
    return new EmotionalDNA(
      this.joy,
      this.nostalgia,
      this.curiosity,
      this.serenity,
      this.ecstasy,
      this.mystery,
      this.power
    );
  }
}

