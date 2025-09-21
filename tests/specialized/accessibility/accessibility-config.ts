/**
 * GENESIS LUMINAL - ACCESSIBILITY CONFIGURATION
 * Configurações específicas para testes de acessibilidade
 */

export const accessibilityConfig = {
  // Regras WCAG 2.1 AA obrigatórias
  rules: [
    'color-contrast',
    'keyboard',
    'focus-order-semantics',
    'heading-order',
    'aria-valid-attr',
    'aria-valid-attr-value',
    'aria-hidden-body',
    'landmark-one-main',
    'region'
  ],
  
  // Tags de compliance
  tags: ['wcag2a', 'wcag2aa', 'wcag21aa'],
  
  // Configurações específicas para Genesis Luminal
  options: {
    // Ignorar verificações em canvas (aplicação visual)
    exclude: [['.particle-canvas[aria-hidden="true"]']],
    
    // Regras customizadas para aplicação transcendental
    rules: {
      'color-contrast': { 
        // Permitir contraste reduzido em elementos decorativos
        enabled: true 
      }
    }
  }
};

