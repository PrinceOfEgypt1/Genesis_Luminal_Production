import { AnthropicProvider } from '../../../providers/AnthropicProvider';

describe('AnthropicProvider - Basic Tests', () => {
  let provider: AnthropicProvider;
  
  beforeEach(() => {
    provider = new AnthropicProvider();
  });

  it('should create provider instance', () => {
    expect(provider).toBeInstanceOf(AnthropicProvider);
  });

  it('should have analyze method', () => {
    expect(typeof provider.analyze).toBe('function');
  });

  it('should handle basic analyze call', async () => {
    const mockRequest = {
      currentState: {
        joy: 0.8,
        nostalgia: 0.2,
        curiosity: 0.7,
        serenity: 0.4,
        ecstasy: 0.1,
        mystery: 0.3,
        power: 0.5
      },
      mousePosition: { x: 100, y: 100 },
      sessionDuration: 1000
    };

    const result = await provider.analyze(mockRequest);

    // Só testa que retorna algo
    expect(result).toBeDefined();
    expect(typeof result).toBe('object');
  });
});
