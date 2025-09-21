/**
 * @fileoverview EmotionAnalyzer Storybook Stories
 * @version 1.0.0
 * @author Genesis Luminal Team
 */

import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import { EmotionAnalyzer } from './EmotionAnalyzer';

const meta = {
  title: 'Components/EmotionAnalyzer',
  component: EmotionAnalyzer,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
# EmotionAnalyzer Component

Componente principal para análise de emoções em texto.

## Funcionalidades

- 🔴 **[SIMULATION]** Análise baseada em heurísticas simples
- ✅ **[IMPLEMENTED]** Interface React funcional  
- ✅ **[IMPLEMENTED]** Validação de entrada
- ✅ **[IMPLEMENTED]** Estados de loading e error

## Limitações Atuais

- Não usa machine learning real
- Baseado em palavras-chave predefinidas
- Precisão limitada para textos complexos
- Apenas para demonstração
        `
      }
    }
  },
  tags: ['autodocs'],
  argTypes: {
    onAnalyze: { action: 'analyze' },
    placeholder: { control: 'text' },
    disabled: { control: 'boolean' },
    showDisclaimer: { control: 'boolean' }
  },
  args: {
    onAnalyze: fn()
  }
} satisfies Meta<typeof EmotionAnalyzer>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Estado padrão do componente
 */
export const Default: Story = {
  args: {}
};

/**
 * Com texto de exemplo preenchido
 */
export const WithText: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    // Simular interação do usuário
    const canvas = within(canvasElement);
    const input = canvas.getByRole('textbox');
    
    await userEvent.type(input, 'I am feeling absolutely wonderful today!');
  }
};

/**
 * Estado de loading
 */
export const Loading: Story = {
  args: {},
  parameters: {
    mockData: [
      {
        url: '/api/analyze',
        method: 'POST',
        status: 200,
        delay: 2000,
        response: {
          intensity: 0.9,
          dominantAffect: 'joy',
          confidence: 0.95
        }
      }
    ]
  }
};

/**
 * Estado de erro
 */
export const Error: Story = {
  args: {},
  parameters: {
    mockData: [
      {
        url: '/api/analyze',
        method: 'POST',
        status: 500,
        response: {
          error: 'Internal server error'
        }
      }
    ]
  }
};

/**
 * Com disclaimer de simulação
 */
export const WithDisclaimer: Story = {
  args: {
    showDisclaimer: true
  },
  parameters: {
    docs: {
      description: {
        story: 'Versão que exibe o banner de transparência sobre simulação.'
      }
    }
  }
};

/**
 * Responsivo - Mobile
 */
export const Mobile: Story = {
  args: {},
  parameters: {
    viewport: {
      defaultViewport: 'mobile'
    }
  }
};

/**
 * Responsivo - Tablet  
 */
export const Tablet: Story = {
  args: {},
  parameters: {
    viewport: {
      defaultViewport: 'tablet'
    }
  }
};

/**
 * Teste de Acessibilidade
 */
export const AccessibilityTest: Story = {
  args: {},
  parameters: {
    a11y: {
      config: {
        rules: [
          {
            id: 'color-contrast',
            enabled: true
          },
          {
            id: 'keyboard-navigation',
            enabled: true
          }
        ]
      }
    }
  }
};
