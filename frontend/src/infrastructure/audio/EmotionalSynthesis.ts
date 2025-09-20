/**
 * @fileoverview Sistema de Síntese Emocional de Áudio
 * 
 * Implementa síntese de áudio generativa que responde em tempo real aos
 * estados emocionais do usuário, criando paisagens sonoras únicas e
 * sincronizadas com os elementos visuais.
 * 
 * @version 1.0.0
 * @author Senior Software Engineering Team
 * @since 2024-09-04
 * @license MIT
 */

import * as Tone from 'tone';

interface EmotionalState {
  x: number; // Posição horizontal do mouse (0-1)
  y: number; // Posição vertical do mouse (0-1)
  intensity: number; // Intensidade emocional (0-1)
}

/**
 * Sistema de síntese emocional usando Tone.js
 * Gera música procedural baseada em estados emocionais
 */
export class EmotionalSynthesis {
  private isInitialized: boolean = false;
  private isPlaying: boolean = false;
  
  // Instrumentos principais - inicializados no constructor
  private ambientSynth!: Tone.PolySynth;
  private leadSynth!: Tone.MonoSynth;
  private bassSynth!: Tone.FMSynth;
  private percussionSynth!: Tone.NoiseSynth;
  
  // Efeitos de áudio - inicializados no constructor
  private reverb!: Tone.Reverb;
  private delay!: Tone.FeedbackDelay;
  private filter!: Tone.Filter;
  private compressor!: Tone.Compressor;
  
  // Controle de sequência
  private ambientLoop: Tone.Loop | null = null;
  private percussionLoop: Tone.Loop | null = null;
  private leadSequence: Tone.Sequence<any> | null = null;
  
  // Estado emocional atual
  private currentState: EmotionalState = { x: 0.5, y: 0.5, intensity: 0 };
  
  // Escalas musicais emocionais
  private emotionalScales = {
    calm: ['C4', 'D4', 'E4', 'G4', 'A4'],
    joy: ['C4', 'E4', 'G4', 'C5', 'E5'],
    mystery: ['C4', 'Eb4', 'F4', 'Ab4', 'Bb4'],
    energy: ['C4', 'D4', 'F#4', 'G4', 'A4', 'C5'],
    contemplation: ['C4', 'D4', 'F4', 'G4', 'Bb4'],
    transcendence: ['C4', 'E4', 'F#4', 'A4', 'B4', 'D5']
  };

  constructor() {
    // Inicializar o sistema de áudio de forma assíncrona
    this.initializeAudioSystem().catch(error => {
      console.error('Erro ao inicializar sistema de áudio:', error);
    });
  }

  /**
   * Inicializa o sistema de áudio com todos os instrumentos e efeitos
   */
  private async initializeAudioSystem(): Promise<void> {
    try {
      // Aguardar o contexto de áudio estar pronto
      await Tone.start();
      
      // Configurar instrumentos principais
      this.setupSynthesizers();
      this.setupEffects();
      this.setupRouting();
      
      // Configurar loops e sequências
      this.setupSequences();
      
      this.isInitialized = true;
      console.log('🎵 Sistema de Áudio Emocional inicializado com sucesso');
      
    } catch (error) {
      console.error('❌ Erro ao inicializar sistema de áudio:', error);
    }
  }

  /**
   * Configura os sintetizadores principais
   */
  private setupSynthesizers(): void {
    // Sintetizador ambiente para texturas de fundo
    this.ambientSynth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'sine' },
      envelope: {
        attack: 2,
        decay: 1,
        sustain: 0.4,
        release: 4
      }
    });

    // Sintetizador principal para melodias
    this.leadSynth = new Tone.MonoSynth({
      oscillator: { type: 'sawtooth' },
      envelope: {
        attack: 0.1,
        decay: 0.3,
        sustain: 0.6,
        release: 1
      },
      filter: {
        Q: 6,
        type: 'lowpass',
        rolloff: -24
      }
    });

    // Sintetizador de baixo para fundação harmônica
    this.bassSynth = new Tone.FMSynth({
      harmonicity: 0.25,
      modulationIndex: 2,
      oscillator: { type: 'triangle' },
      envelope: {
        attack: 0.01,
        decay: 0.2,
        sustain: 0.8,
        release: 1.5
      },
      modulation: { type: 'square' },
      modulationEnvelope: {
        attack: 0.5,
        decay: 0.2,
        sustain: 0.1,
        release: 0.5
      }
    });

    // Sintetizador de percussão para texturas rítmicas
    this.percussionSynth = new Tone.NoiseSynth({
      noise: { type: 'white' },
      envelope: {
        attack: 0.005,
        decay: 0.1,
        sustain: 0.0,
        release: 0.1
      }
    });
  }

  /**
   * Configura os efeitos de áudio
   */
  private setupEffects(): void {
    // Reverb para espacialização
    this.reverb = new Tone.Reverb({
      decay: 4,
      preDelay: 0.01,
      wet: 0.3
    });

    // Delay para profundidade temporal
    this.delay = new Tone.FeedbackDelay({
      delayTime: '8n',
      feedback: 0.3,
      wet: 0.2
    });

    // Filtro para controle tonal
    this.filter = new Tone.Filter({
      frequency: 800,
      type: 'lowpass',
      rolloff: -12
    });

    // Compressor para dinâmica
    this.compressor = new Tone.Compressor({
      threshold: -20,
      ratio: 4,
      attack: 0.003,
      release: 0.1
    });
  }

  /**
   * Configura o roteamento de áudio
   */
  private setupRouting(): void {
    // Conectar efeitos em cadeia
    this.filter.connect(this.delay);
    this.delay.connect(this.reverb);
    this.reverb.connect(this.compressor);
    this.compressor.toDestination();

    // Conectar sintetizadores à cadeia de efeitos
    this.ambientSynth.connect(this.filter);
    this.leadSynth.connect(this.filter);
    this.bassSynth.connect(this.filter);
    this.percussionSynth.connect(this.filter);
  }

  /**
   * Configura as sequências musicais
   */
  private setupSequences(): void {
    // Loop ambiente - tons sustentados
    this.ambientLoop = new Tone.Loop((time) => {
      const scale = this.getCurrentScale();
      const chord = [scale[0], scale[2], scale[4]]; // Tríade básica
      
      this.ambientSynth.triggerAttackRelease(chord, '2n', time);
    }, '4n');

    // Loop de percussão sutil
    this.percussionLoop = new Tone.Loop((time) => {
      if (this.currentState.intensity > 0.3) {
        this.percussionSynth.triggerAttackRelease('32n', time);
      }
    }, '8n');

    // Sequência melódica principal
    this.leadSequence = new Tone.Sequence((time, note) => {
      if (note && this.currentState.intensity > 0.1) {
        this.leadSynth.triggerAttackRelease(note, '8n', time);
      }
    }, this.generateMelody(), '8n');
  }

  /**
   * Determina a escala atual baseada no estado emocional
   */
  private getCurrentScale(): string[] {
    const { x, y, intensity } = this.currentState;
    
    if (intensity < 0.2) return this.emotionalScales.calm;
    if (y < 0.3) return this.emotionalScales.contemplation;
    if (x > 0.7 && y > 0.7) return this.emotionalScales.transcendence;
    if (x > 0.6) return this.emotionalScales.joy;
    if (y > 0.6) return this.emotionalScales.energy;
    return this.emotionalScales.mystery;
  }

  /**
   * Gera melodia procedural baseada no estado emocional
   */
  private generateMelody(): string[] {
    const scale = this.getCurrentScale();
    const melody: string[] = [];
    const length = Math.floor(4 + this.currentState.intensity * 4);
    
    for (let i = 0; i < length; i++) {
      if (Math.random() < 0.7) { // 70% chance de ter uma nota
        const noteIndex = Math.floor(Math.random() * scale.length);
        melody.push(scale[noteIndex]);
      } else {
        melody.push(''); // Pausa
      }
    }
    
    return melody;
  }

  /**
   * Atualiza parâmetros de áudio em tempo real
   */
  private updateAudioParameters(): void {
    if (!this.isInitialized) return;
    
    const { x, y, intensity } = this.currentState;
    
    // Atualizar filtro baseado na posição Y
    this.filter.frequency.rampTo(200 + y * 1000, 0.1);
    
    // Atualizar reverb baseado na intensidade
    this.reverb.wet.rampTo(0.1 + intensity * 0.4, 0.5);
    
    // Atualizar delay baseado na posição X
    this.delay.wet.rampTo(x * 0.3, 0.3);
  }

  /**
   * Inicia a reprodução de áudio
   */
  public async start(): Promise<void> {
    if (!this.isInitialized) {
      await this.initializeAudioSystem();
    }
    
    if (this.isPlaying) return;
    
    try {
      await Tone.Transport.start();
      
      this.ambientLoop?.start();
      this.percussionLoop?.start();
      this.leadSequence?.start();
      
      this.isPlaying = true;
      console.log('🎶 Reprodução de áudio iniciada');
      
    } catch (error) {
      console.error('❌ Erro ao iniciar reprodução:', error);
    }
  }

  /**
   * Para a reprodução de áudio
   */
  public stop(): void {
    if (!this.isPlaying) return;
    
    this.ambientLoop?.stop();
    this.percussionLoop?.stop();
    this.leadSequence?.stop();
    
    Tone.Transport.stop();
    this.isPlaying = false;
    
    console.log('⏹️ Reprodução de áudio pausada');
  }

  /**
   * Atualiza estado emocional e ajusta áudio em tempo real
   */
  public updateEmotionalState(x: number, y: number, intensity: number): void {
    this.currentState = { x, y, intensity };
    
    if (this.isPlaying) {
      // Atualizar parâmetros em tempo real
      this.updateAudioParameters();
      
      // Gerar nova melodia se a intensidade mudou significativamente
      if (Math.random() < 0.1) { // 10% chance por frame
        const newMelody = this.generateMelody();
        this.leadSequence?.dispose();
        this.leadSequence = new Tone.Sequence((time, note) => {
          if (note && this.currentState.intensity > 0.1) {
            this.leadSynth.triggerAttackRelease(note, '8n', time);
          }
        }, newMelody, '8n');
        
        if (this.isPlaying) {
          this.leadSequence.start();
        }
      }
    }
  }

  /**
   * Triggera um evento sonoro instantâneo baseado na interação
   */
  public triggerInteractionSound(): void {
    if (!this.isInitialized) return;
    
    const scale = this.getCurrentScale();
    const note = scale[Math.floor(Math.random() * scale.length)];
    
    // Som de interação instantânea
    this.leadSynth.triggerAttackRelease(note, '16n');
    
    // Efeito percussivo sutil
    if (this.currentState.intensity > 0.5) {
      this.percussionSynth.triggerAttackRelease('32n');
    }
  }

  /**
   * Limpa recursos de áudio
   */
  public dispose(): void {
    this.stop();
    
    // Dispose de todos os recursos
    this.ambientSynth?.dispose();
    this.leadSynth?.dispose();
    this.bassSynth?.dispose();
    this.percussionSynth?.dispose();
    this.reverb?.dispose();
    this.delay?.dispose();
    this.filter?.dispose();
    this.compressor?.dispose();
    
    this.ambientLoop?.dispose();
    this.percussionLoop?.dispose();
    this.leadSequence?.dispose();
    
    console.log('🧹 Recursos de áudio liberados');
  }
}
------------------------------------------------------------------------------------------------------------------------