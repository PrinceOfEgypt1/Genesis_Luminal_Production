/**
 * @fileoverview LSTM Real com TensorFlow.js
 * 
 * SUBSTITUIÇÃO da simulação SimpleLSTM por implementação GENUÍNA
 * usando TensorFlow.js com tf.layers.lstm() real.
 * 
 * STATUS: ✅ IMPLEMENTAÇÃO REAL (não simulação)
 */

import * as tf from '@tensorflow/tfjs';

interface EmotionalDNA {
  joy: number; nostalgia: number; curiosity: number; serenity: number;
  ecstasy: number; mystery: number; power: number;
}

interface EmotionalPrediction {
  predictedEmotion: EmotionalDNA;
  confidence: number;
  timeHorizon: number;
  reasoning: string;
  isRealML: boolean;
}

interface ModelMetrics {
  accuracy: number;
  loss: number;
  valAccuracy: number;
  valLoss: number;
  epochs: number;
  isRealML: boolean;
}

/**
 * LSTM REAL usando TensorFlow.js
 */
export class RealLSTMEngine {
  private model: tf.LayersModel | null = null;
  private isModelTrained: boolean = false;
  private emotionalHistory: EmotionalDNA[] = [];
  private trainingData: tf.Tensor | null = null;
  private trainingLabels: tf.Tensor | null = null;
  private realMetrics: ModelMetrics = {
    accuracy: 0,
    loss: 0,
    valAccuracy: 0,
    valLoss: 0,
    epochs: 0,
    isRealML: true
  };

  constructor() {
    this.initializeModel();
    console.log('🧠 LSTM REAL inicializado com TensorFlow.js');
  }

  private initializeModel(): void {
    try {
      this.model = tf.sequential({
        layers: [
          tf.layers.inputLayer({ inputShape: [5, 7] }),
          tf.layers.lstm({
            units: 32,
            returnSequences: true,
            dropout: 0.2,
            recurrentDropout: 0.2
          }),
          tf.layers.lstm({
            units: 16,
            dropout: 0.2,
            recurrentDropout: 0.2
          }),
          tf.layers.dense({
            units: 14,
            activation: 'relu'
          }),
          tf.layers.dense({
            units: 7,
            activation: 'sigmoid'
          })
        ]
      });

      this.model.compile({
        optimizer: tf.train.adam(0.001),
        loss: 'meanSquaredError',
        metrics: ['accuracy', 'mse']
      });

      console.log('✅ Modelo LSTM real compilado');
      
    } catch (error) {
      console.error('❌ Erro ao inicializar LSTM real:', error);
    }
  }

  addEmotionalState(dna: EmotionalDNA): void {
    this.emotionalHistory.push({ ...dna });
    
    if (this.emotionalHistory.length > 100) {
      this.emotionalHistory.shift();
    }

    if (this.emotionalHistory.length >= 10 && !this.isModelTrained) {
      this.trainModel();
    }
  }

  /**
   * 🔧 CORREÇÃO: Usar history para extrair métricas finais
   */
  private async trainModel(): Promise<void> {
    if (!this.model || this.emotionalHistory.length < 10) {
      return;
    }

    try {
      console.log('🎯 Iniciando treinamento REAL do modelo LSTM...');
      
      const { features, labels } = this.prepareTrainingData();
      
      if (!features || !labels) {
        console.warn('⚠️ Dados insuficientes para treinamento');
        return;
      }

      this.trainingData = features;
      this.trainingLabels = labels;

      // 🔧 CORREÇÃO: Capturar history para usar as métricas
      const trainingHistory = await this.model.fit(features, labels, {
        epochs: 50,
        batchSize: 8,
        validationSplit: 0.2,
        shuffle: true,
        callbacks: {
          onEpochEnd: (epoch, logs) => {
            if (logs) {
              this.realMetrics = {
                accuracy: logs.accuracy || 0,
                loss: logs.loss || 0,
                valAccuracy: logs.val_accuracy || 0,
                valLoss: logs.val_loss || 0,
                epochs: epoch + 1,
                isRealML: true
              };
              
              if (epoch % 10 === 0) {
                console.log(`📈 Época ${epoch + 1}: Loss=${logs.loss?.toFixed(4)}, Acc=${logs.accuracy?.toFixed(4)}`);
              }
            }
          }
        }
      });

      // 🔧 USAR trainingHistory para métricas finais
      const finalMetrics = trainingHistory.history;
      if (finalMetrics.loss && finalMetrics.loss.length > 0) {
        const lastEpoch = finalMetrics.loss.length - 1;
        this.realMetrics.loss = finalMetrics.loss[lastEpoch] as number;
        this.realMetrics.accuracy = finalMetrics.accuracy ? finalMetrics.accuracy[lastEpoch] as number : 0;
        console.log('📊 Métricas finais extraídas do histórico de treinamento');
      }

      this.isModelTrained = true;
      console.log('✅ Modelo treinado com sucesso!');
      
      features.dispose();
      labels.dispose();
      
    } catch (error) {
      console.error('❌ Erro durante treinamento:', error);
    }
  }

  private prepareTrainingData(): { features: tf.Tensor | null; labels: tf.Tensor | null } {
    if (this.emotionalHistory.length < 10) {
      return { features: null, labels: null };
    }

    try {
      const sequences: number[][][] = [];
      const nextStates: number[][] = [];

      for (let i = 0; i <= this.emotionalHistory.length - 6; i++) {
        const sequence = this.emotionalHistory.slice(i, i + 5).map(this.dnaToArray);
        const nextState = this.dnaToArray(this.emotionalHistory[i + 5]);
        
        sequences.push(sequence);
        nextStates.push(nextState);
      }

      if (sequences.length === 0) {
        return { features: null, labels: null };
      }

      const features = tf.tensor3d(sequences);
      const labels = tf.tensor2d(nextStates);

      return { features, labels };
      
    } catch (error) {
      console.error('❌ Erro ao preparar dados:', error);
      return { features: null, labels: null };
    }
  }

  private dnaToArray(dna: EmotionalDNA): number[] {
    return [dna.joy, dna.nostalgia, dna.curiosity, dna.serenity, dna.ecstasy, dna.mystery, dna.power];
  }

  private arrayToDNA(array: number[]): EmotionalDNA {
    return {
      joy: Math.max(0, Math.min(1, array[0])),
      nostalgia: Math.max(0, Math.min(1, array[1])),
      curiosity: Math.max(0, Math.min(1, array[2])),
      serenity: Math.max(0, Math.min(1, array[3])),
      ecstasy: Math.max(0, Math.min(1, array[4])),
      mystery: Math.max(0, Math.min(1, array[5])),
      power: Math.max(0, Math.min(1, array[6]))
    };
  }

  async predictNextState(): Promise<EmotionalPrediction | null> {
    if (!this.model || !this.isModelTrained || this.emotionalHistory.length < 5) {
      return null;
    }

    try {
      const recentStates = this.emotionalHistory.slice(-5).map(this.dnaToArray);
      const inputTensor = tf.tensor3d([recentStates]);

      const prediction = this.model.predict(inputTensor) as tf.Tensor;
      const predictionData = await prediction.data();

      const predictedEmotion = this.arrayToDNA(Array.from(predictionData));

      const confidence = Math.max(0, Math.min(1, 1 - this.realMetrics.valLoss));

      inputTensor.dispose();
      prediction.dispose();

      return {
        predictedEmotion,
        confidence,
        timeHorizon: 3000,
        reasoning: `LSTM real treinado com ${this.emotionalHistory.length} estados. Épocas: ${this.realMetrics.epochs}`,
        isRealML: true
      };

    } catch (error) {
      console.error('❌ Erro na predição:', error);
      return null;
    }
  }

  getMetrics(): ModelMetrics & { historySize: number; isReady: boolean } {
    return {
      ...this.realMetrics,
      historySize: this.emotionalHistory.length,
      isReady: this.isModelTrained
    };
  }

  dispose(): void {
    if (this.model) {
      this.model.dispose();
    }
    if (this.trainingData) {
      this.trainingData.dispose();
    }
    if (this.trainingLabels) {
      this.trainingLabels.dispose();
    }
    console.log('🧹 Recursos TensorFlow.js liberados');
  }
}
