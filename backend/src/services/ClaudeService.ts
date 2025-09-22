import type { EmotionalAnalysisRequest, EmotionalAnalysisResponse } from '../types/emotion';
import { ProviderRouter } from '../providers/ProviderRouter';

function extractText(input: EmotionalAnalysisRequest): string {
  const i: any = input as any;
  const raw = i?.text ?? i?.message ?? i?.prompt ?? '';
  return (typeof raw === 'string' ? raw : String(raw ?? '')).trim();
}

class ClaudeService {
  private router = new ProviderRouter();

  async analyzeEmotionalState(input: EmotionalAnalysisRequest): Promise<EmotionalAnalysisResponse> {
    const text = extractText(input);
    if (!text) {
      return {
        dominant: "curiosity",
        intensity: 0.0,
        timestamp: new Date().toISOString(),
        confidence: 0.0,
        recommendation: 'provide_input',
        emotionalShift: 'stable',
        morphogenicSuggestion: 'fibonacci',
      };
    }
    // Mantém o objeto original para respeitar o contrato do shared
    return this.router.analyze(input);
  }

  status() {
    return this.router.getStatus();
  }
}

const claudeService = new ClaudeService();
export default claudeService;

