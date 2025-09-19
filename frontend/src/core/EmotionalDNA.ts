/**
 * EmotionalDNA - Core Emotional System
 * Genesis Luminal - Emotional Intelligence Engine
 */

export interface EmotionalState {
  energy: number;    // 0-1
  valence: number;   // 0-1 (negative to positive)
  arousal: number;   // 0-1 (calm to excited)
}

export interface EmotionalInteraction {
  intensity: number;
  confidence: number;
  duration: number;
  type: 'visual' | 'audio' | 'haptic' | 'cognitive';
}

export class EmotionalDNA {
  private state: EmotionalState;
  
  constructor(initialState?: Partial<EmotionalState>) {
    this.state = {
      energy: initialState?.energy ?? Math.random(),
      valence: initialState?.valence ?? Math.random(),
      arousal: initialState?.arousal ?? Math.random()
    };
  }

  // Energy methods
  getEnergy(): number {
    return this.state.energy;
  }

  setEnergy(value: number): void {
    this.state.energy = Math.max(0, Math.min(1, value));
  }

  // Valence methods
  getValence(): number {
    return this.state.valence;
  }

  setValence(value: number): void {
    this.state.valence = Math.max(0, Math.min(1, value));
  }

  // Arousal methods
  getArousal(): number {
    return this.state.arousal;
  }

  setArousal(value: number): void {
    this.state.arousal = Math.max(0, Math.min(1, value));
  }

  // Computed properties
  getEmotionalIntensity(): number {
    return (this.state.energy + this.state.arousal) / 2;
  }

  calculateCoherence(other: EmotionalDNA): number {
    const energyDiff = Math.abs(this.state.energy - other.getEnergy());
    const valenceDiff = Math.abs(this.state.valence - other.getValence());
    const arousalDiff = Math.abs(this.state.arousal - other.getArousal());
    
    const avgDiff = (energyDiff + valenceDiff + arousalDiff) / 3;
    return 1 - avgDiff; // Higher coherence = lower difference
  }

  evolveFromInteraction(interaction: EmotionalInteraction): void {
    const influence = interaction.intensity * interaction.confidence * 0.1;
    
    // Evolve based on interaction type
    switch (interaction.type) {
      case 'visual':
        this.state.arousal += influence;
        break;
      case 'audio':
        this.state.valence += influence;
        break;
      case 'haptic':
        this.state.energy += influence;
        break;
      case 'cognitive':
        this.state.energy += influence * 0.5;
        this.state.valence += influence * 0.3;
        this.state.arousal += influence * 0.2;
        break;
    }

    // Normalize values
    this.state.energy = Math.max(0, Math.min(1, this.state.energy));
    this.state.valence = Math.max(0, Math.min(1, this.state.valence));
    this.state.arousal = Math.max(0, Math.min(1, this.state.arousal));
  }

  toJSON() {
    return {
      energy: this.state.energy,
      valence: this.state.valence,
      arousal: this.state.arousal,
      timestamp: Date.now()
    };
  }

  static fromJSON(data: any): EmotionalDNA {
    return new EmotionalDNA({
      energy: data.energy,
      valence: data.valence,
      arousal: data.arousal
    });
  }
}
