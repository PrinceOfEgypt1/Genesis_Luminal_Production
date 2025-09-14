/**
 * Responsabilidade ÚNICA: Síntese de áudio emocional
 * Implementa SRP para processamento de áudio
 */

import * as Tone from 'tone';

export class EmotionalAudioEngine {
  private synth: Tone.PolySynth | null = null;
  private reverb: Tone.Reverb | null = null;
  private filter: Tone.Filter | null = null;
  private isInitialized = false;

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Configurar cadeia de áudio
      this.reverb = new Tone.Reverb(2);
      this.filter = new Tone.Filter(800, 'lowpass');
      
      this.synth = new Tone.PolySynth(Tone.Synth, {
        oscillator: {
          type: 'sine'
        },
        envelope: {
          attack: 0.1,
          decay: 0.3,
          sustain: 0.8,
          release: 1.2
        }
      });

      // Conectar cadeia de efeitos
      this.synth.chain(this.filter, this.reverb, Tone.Destination);
      
      await this.reverb.generate();
      this.isInitialized = true;
      
      console.log('🎵 EmotionalAudioEngine inicializado');
    } catch (error) {
      console.error('Erro ao inicializar áudio:', error);
    }
  }

  synthesizeEmotion(emotionalDNA: EmotionalDNA): AudioSynthesis {
    if (!this.isInitialized || !this.synth) {
      return { success: false, error: 'Audio engine not initialized' };
    }

    try {
      // Mapear emoções para parâmetros sonoros
      const frequency = this.mapEmotionToFrequency(emotionalDNA);
      const duration = this.mapEmotionToDuration(emotionalDNA);
      const filterFreq = this.mapEmotionToFilter(emotionalDNA);

      // Aplicar filtro emocional
      if (this.filter) {
        this.filter.frequency.setValueAtTime(filterFreq, Tone.now());
      }

      // Sintetizar nota
      this.synth.triggerAttackRelease(frequency, duration);

      return {
        success: true,
        frequency,
        duration,
        filterFreq,
        emotionalMapping: this.getEmotionalMapping(emotionalDNA)
      };
    } catch (error) {
      return { 
        success: false, 
        error: `Synthesis error: ${error}` 
      };
    }
  }

  private mapEmotionToFrequency(dna: EmotionalDNA): number {
    // Joy e Ecstasy -> frequências mais altas
    // Serenity e Nostalgia -> frequências mais baixas
    const baseFreq = 220; // A3
    const emotionalFactor = (dna.joy + dna.ecstasy - dna.serenity - dna.nostalgia) * 0.5;
    return baseFreq * (1 + emotionalFactor);
  }

  private mapEmotionToDuration(dna: EmotionalDNA): string {
    // Mystery e Power -> durações mais longas
    const baseDuration = 0.5;
    const emotionalFactor = (dna.mystery + dna.power) * 0.5;
    return `${baseDuration + emotionalFactor}n`;
  }

  private mapEmotionToFilter(dna: EmotionalDNA): number {
    // Curiosity -> filtro mais aberto, Serenity -> mais fechado
    const baseFilter = 800;
    const emotionalFactor = (dna.curiosity - dna.serenity) * 500;
    return Math.max(200, Math.min(2000, baseFilter + emotionalFactor));
  }

  private getEmotionalMapping(dna: EmotionalDNA): EmotionalMapping {
    return {
      dominant: this.getDominantEmotion(dna),
      intensity: this.getOverallIntensity(dna),
      balance: this.getEmotionalBalance(dna)
    };
  }

  private getDominantEmotion(dna: EmotionalDNA): keyof EmotionalDNA {
    const emotions = Object.entries(dna) as [keyof EmotionalDNA, number][];
    return emotions.reduce((max, current) => 
      current[1] > max[1] ? current : max
    )[0];
  }

  private getOverallIntensity(dna: EmotionalDNA): number {
    const values = Object.values(dna);
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }

  private getEmotionalBalance(dna: EmotionalDNA): string {
    const intense = dna.ecstasy + dna.power;
    const calm = dna.serenity + dna.nostalgia;
    
    if (intense > calm) return 'energetic';
    if (calm > intense) return 'peaceful';
    return 'balanced';
  }

  dispose(): void {
    if (this.synth) {
      this.synth.dispose();
      this.synth = null;
    }
    if (this.reverb) {
      this.reverb.dispose();
      this.reverb = null;
    }
    if (this.filter) {
      this.filter.dispose();
      this.filter = null;
    }
    this.isInitialized = false;
  }
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

export interface AudioSynthesis {
  success: boolean;
  frequency?: number;
  duration?: string;
  filterFreq?: number;
  emotionalMapping?: EmotionalMapping;
  error?: string;
}

export interface EmotionalMapping {
  dominant: keyof EmotionalDNA;
  intensity: number;
  balance: string;
}
