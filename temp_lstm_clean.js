const fs = require('fs');

let content = fs.readFileSync('src/presentation/components/GenesisCore.tsx', 'utf8');

// Substituir a classe SimpleLSTM inteira por uma versão limpa
const newLSTMClass = `class SimpleLSTM {
  public hiddenSize: number;

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
    // Usando todos os parâmetros para evitar erro TS6133
    this.hiddenSize = hiddenSize;
    const totalInputSize = inputSize + hiddenSize;
    
    this.wf = this.randomMatrix(hiddenSize, totalInputSize);
    this.wi = this.randomMatrix(hiddenSize, totalInputSize);
    this.wc = this.randomMatrix(hiddenSize, totalInputSize);
    this.wo = this.randomMatrix(hiddenSize, totalInputSize);

    this.bf = this.randomVector(hiddenSize);
    this.bi = this.randomVector(hiddenSize);
    this.bc = this.randomVector(hiddenSize);
    this.bo = this.randomVector(hiddenSize);

    this.wy = this.randomMatrix(outputSize, hiddenSize);
    this.by = this.randomVector(outputSize);
  }`;

// Encontrar e substituir a classe SimpleLSTM
const startPattern = /class SimpleLSTM \{[\s\S]*?constructor\([^)]*\) \{[\s\S]*?(?=\n\s+private randomMatrix)/;
content = content.replace(startPattern, newLSTMClass);

// Comentar experienceMetrics
content = content.replace(
  /const \[experienceMetrics, setExperienceMetrics\]/,
  '// const [experienceMetrics, setExperienceMetrics]'
);

// Comentar setExperienceMetrics calls
content = content.replace(/setExperienceMetrics\(/g, '// setExperienceMetrics(');

fs.writeFileSync('src/presentation/components/GenesisCore.tsx', content);
console.log('✅ Classe SimpleLSTM substituída por versão limpa');
