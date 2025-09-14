import type { EmotionalAnalysisRequest, EmotionalAnalysisResponse } from '../../../../packages/shared/types/api';
import { ProviderRouter } from '../providers/ProviderRouter';
import { extractTextFromRequest } from '../providers/AIProvider';

class ClaudeService {
  private router = new ProviderRouter();

  async analyzeEmotionalState(input: EmotionalAnalysisRequest): Promise<EmotionalAnalysisResponse> {
    // ✅ CORREÇÃO: Usar função segura de extração de texto
    const text = extractTextFromRequest(input);
    
    if (!text && !('currentState' in input)) {
      return {
        intensity: 0.0,
        dominantAffect: 'curiosity',
        timestamp: new Date().toISOString(),
        confidence: 0.0,
        recommendation: 'provide_input',
        emotionalShift: 'stable',
        morphogenicSuggestion: 'fibonacci',
      };
    }

    // Manter o objeto original para respeitar o contrato do shared
    return this.router.analyze(input);
  }

  status() {
    return this.router.getStatus();
  }

  getCurrentProvider(): string {
    return this.router.getCurrentProvider();
  }

  switchToFallback(): void {
    return this.router.switchToFallback();
  }
}

const claudeService = new ClaudeService();
export default claudeService;
