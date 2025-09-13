/**
 * 🎵 AUDIO ENGINE
 * Sistema de áudio responsivo às emoções
 */

import { EmotionalDNA } from '../../core/entities/EmotionalDNA';

export class AudioEngine {
  private audioContext?: AudioContext;
  private masterGain?: GainNode;
  private isInitialized = false;

  initialize(): void {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.masterGain = this.audioContext.createGain();
      this.masterGain.connect(this.audioContext.destination);
      this.masterGain.gain.value = 0.1; // Volume baixo
      this.isInitialized = true;
      console.log('🎵 AudioEngine inicializado');
    } catch (error) {
      console.warn('⚠️ AudioEngine não pôde ser inicializado:', error);
    }
  }

  updateEmotionalState(dna: EmotionalDNA): void {
    if (!this.isInitialized || !this.audioContext || !this.masterGain) return;

    try {
      // Frequência baseada em emoções
      const frequency = 200 + (dna.joy * 300) + (dna.curiosity * 200);
      
      // Criar tom suave
      const oscillator = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();
      
      oscillator.type = 'sine';
      oscillator.frequency.value = frequency;
      
      gain.gain.setValueAtTime(0, this.audioContext.currentTime);
      gain.gain.linearRampToValueAtTime(0.02, this.audioContext.currentTime + 0.1);
      gain.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 0.5);
      
      oscillator.connect(gain);
      gain.connect(this.masterGain);
      
      oscillator.start();
      oscillator.stop(this.audioContext.currentTime + 0.5);
      
    } catch (error) {
      console.warn('⚠️ Erro ao atualizar áudio:', error);
    }
  }

  dispose(): void {
    if (this.audioContext) {
      this.audioContext.close();
      console.log('🧹 AudioEngine disposed');
    }
  }
}
