/**
 * @fileoverview Fixtures para dados de emoção
 * @version 1.0.0
 * @author Genesis Luminal Team
 */

export const emotionTestCases = [
  {
    input: {
      text: 'I am absolutely thrilled about this amazing opportunity!',
      userId: 'test-user-joy',
    },
    expected: {
      dominantAffect: 'joy',
      intensityRange: [0.7, 1.0],
      confidenceRange: [0.8, 1.0],
    },
  },
  {
    input: {
      text: 'This is the worst day of my life. Everything is going wrong.',
      userId: 'test-user-sadness',
    },
    expected: {
      dominantAffect: 'sadness',
      intensityRange: [0.6, 0.9],
      confidenceRange: [0.7, 0.9],
    },
  },
  {
    input: {
      text: 'The meeting is scheduled for 3 PM.',
      userId: 'test-user-neutral',
    },
    expected: {
      dominantAffect: 'neutral',
      intensityRange: [0.0, 0.4],
      confidenceRange: [0.5, 0.8],
    },
  },
  {
    input: {
      text: 'I am furious about this terrible decision!',
      userId: 'test-user-anger',
    },
    expected: {
      dominantAffect: 'anger',
      intensityRange: [0.7, 1.0],
      confidenceRange: [0.8, 0.95],
    },
  },
];

export const invalidInputs = [
  {
    input: { text: '', userId: 'test-user' },
    expectedError: 'Text is required',
  },
  {
    input: { text: 'Valid text', userId: '' },
    expectedError: 'User ID is required',
  },
  {
    input: { text: 'A'.repeat(50000), userId: 'test-user' },
    expectedError: 'Text too long',
  },
];

export const performanceTestCases = [
  {
    description: 'Short text',
    text: 'Happy!',
    expectedMaxResponseTime: 200,
  },
  {
    description: 'Medium text',
    text: 'I am feeling quite good today and looking forward to the weekend.',
    expectedMaxResponseTime: 500,
  },
  {
    description: 'Long text',
    text: 'A'.repeat(5000),
    expectedMaxResponseTime: 1000,
  },
];

export const accessibilityTestData = {
  emotionColors: {
    joy: '#FFD700',
    sadness: '#4169E1',
    anger: '#DC143C',
    fear: '#800080',
    neutral: '#808080',
  },
  contrastRequirements: {
    normal: 4.5,
    large: 3.0,
  },
  keyboardNavigation: [
    'Tab to input field',
    'Type text',
    'Tab to analyze button',
    'Enter to submit',
    'Tab through results',
  ],
};
