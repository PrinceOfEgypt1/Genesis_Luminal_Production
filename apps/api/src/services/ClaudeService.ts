import type { EmotionalAnalysisRequest, EmotionalAnalysisResponse } from '../../../../packages/shared/types/api';
import { providerRouter } from '../providers/ProviderRouter';
import { logger } from '../utils/logger';

class ClaudeService {
  async analyzeEmotionalState(request: EmotionalAnalysisRequest): Promise<EmotionalAnalysisResponse> {
    logger.info('ClaudeService.analyzeEmotionalState called');
    return providerRouter.analyze(request);
  }

  status() {
    return providerRouter.status().current;
  }

  getDetailedStatus() {
    return providerRouter.status();
  }
}

export default new ClaudeService();
