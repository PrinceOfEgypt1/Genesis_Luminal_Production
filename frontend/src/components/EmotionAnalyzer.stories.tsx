/**
 * @fileoverview Stories do EmotionAnalyzer - Genesis Luminal
 */

import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import { within, userEvent } from '@storybook/test';
import { EmotionAnalyzer } from './EmotionAnalyzer';

const meta: Meta<typeof EmotionAnalyzer> = {
  title: 'Components/EmotionAnalyzer',
  component: EmotionAnalyzer,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    placeholder: { control: 'text' },
  },
  args: {
    onAnalysis: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: 'Digite seu texto para análise emocional...',
  },
};

export const WithCustomPlaceholder: Story = {
  args: {
    placeholder: 'Como você está se sentindo hoje?',
  },
};

export const InteractiveTest: Story = {
  args: {
    placeholder: 'Teste interativo - digite algo positivo!',
  },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    
    const input = canvas.getByPlaceholderText(/Digite/i);
    await userEvent.type(input, 'I am feeling absolutely wonderful today!');
    
    const button = canvas.getByRole('button', { name: /analisar/i });
    await userEvent.click(button);
  },
};
