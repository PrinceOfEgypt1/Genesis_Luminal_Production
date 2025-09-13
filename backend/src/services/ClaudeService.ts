import { logger } from '../utils/logger';
import type { EmotionalAnalysisRequest, EmotionalAnalysisResponse } from '../../../shared/types/api';

export class ClaudeService {
  private apiKey: string | undefined;
  private model: string;
  private apiUrl = 'https://api.anthropic.com/v1/messages';
  private version = '2023-06-01';

  constructor() {
    // aceita os dois nomes
    this.apiKey = process.env.CLAUDE_API_KEY || process.env.ANTHROPIC_API_KEY;
    this.model  = process.env.CLAUDE_MODEL  || process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20240620';
  }

  async analyzeEmotionalState(input: EmotionalAnalysisRequest): Promise<EmotionalAnalysisResponse> {
    const text = (input as any)?.text ?? '';
    const prompt = typeof text === 'string' && text.trim() ? text.trim() : 'Entrada vazia. Responda neutro.';

    if (!this.apiKey) {
      logger.warn('Claude API key ausente; usando fallback.');
      return this.synthetic();
    }

    try {
      const data = await this.callClaude(prompt);
      return this.parseClaude(data);
    } catch (e: any) {
      logger.error(`Claude API error: ${e?.message || e}`);
      return this.synthetic();
    }
  }

  private async callClaude(prompt: string): Promise<any> {
    const resp = await fetch(this.apiUrl, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': String(this.apiKey),
        'anthropic-version': this.version
      },
      body: JSON.stringify({
        model: this.model,
        max_tokens: 256,
        temperature: 0.2,
        system: 'Você é um analisador emocional conciso. Responda em JSON {intensity:number, dominantAffect:string, confidence:number, recommendation:string}.',
        messages: [{ role: 'user', content: [{ type: 'text', text: `Analise o estado emocional:\n\n${prompt}` }] }]
      })
    });

    if (!resp.ok) {
      const detail = await resp.text().catch(()=>'');
      throw new Error(`HTTP ${resp.status} ${resp.statusText} - ${detail}`);
    }
    return resp.json();
  }

  private parseClaude(apiResult: any): EmotionalAnalysisResponse {
    const textBlock = Array.isArray(apiResult?.content) ? apiResult.content.find((b: any) => b?.type === 'text') : null;
    const raw = textBlock?.text ?? '';

    let parsed: any;
    if (typeof raw === 'string') {
      const m = raw.match(/\{[\s\S]*\}$/);
      if (m) { try { parsed = JSON.parse(m[0]); } catch {} }
    }

    const out: EmotionalAnalysisResponse = {
      intensity: this.clamp01(Number(parsed?.intensity ?? 0.5)),
      dominantAffect: String(parsed?.dominantAffect ?? 'neutral'),
      timestamp: new Date().toISOString(),
      confidence: this.clamp01(Number(parsed?.confidence ?? 0.5)),
      recommendation: String(parsed?.recommendation ?? 'continue'),
      emotionalShift: 'stable',
      morphogenicSuggestion: 'fibonacci'
    } as EmotionalAnalysisResponse;

    return out;
  }

  private synthetic(): EmotionalAnalysisResponse {
    return {
      intensity: 0.5,
      dominantAffect: 'neutral',
      timestamp: new Date().toISOString(),
      confidence: 0.5,
      recommendation: 'continue',
      emotionalShift: 'stable',
      morphogenicSuggestion: 'fibonacci'
    } as any;
  }

  private clamp01(n: number): number {
    if (!Number.isFinite(n)) return 0.5;
    return Math.max(0, Math.min(1, n));
  }
}
