/**
 * @fileoverview Testes unitários para Sistema de Logging - Genesis Luminal
 * @version 1.0.0
 * @author Genesis Luminal Team
 * @description Testes para logging estruturado Winston
 */

const winston = require('winston');
const { createLogger, format, transports } = winston;

describe('Winston Logger System', () => {
  let testLogger;
  let logOutput;
  
  beforeEach(() => {
    logOutput = [];
    
    // Criar logger de teste com transport customizado
    testLogger = createLogger({
      level: 'debug',
      format: format.combine(
        format.timestamp(),
        format.errors({ stack: true }),
        format.json()
      ),
      transports: [
        new transports.Stream({
          stream: {
            write: (message) => {
              logOutput.push(JSON.parse(message.trim()));
            }
          }
        })
      ]
    });
  });
  
  /**
   * @test Verificar log de informação
   */
  test('should log info messages correctly', () => {
    const testMessage = 'Test info message';
    const testMeta = { userId: '123', action: 'test' };
    
    testLogger.info(testMessage, testMeta);
    
    expect(logOutput).toHaveLength(1);
    expect(logOutput[0].level).toBe('info');
    expect(logOutput[0].message).toBe(testMessage);
    expect(logOutput[0].userId).toBe('123');
    expect(logOutput[0].action).toBe('test');
    expect(logOutput[0].timestamp).toBeDefined();
  });
  
  /**
   * @test Verificar log de erro
   */
  test('should log error messages with stack trace', () => {
    const testError = new Error('Test error');
    testError.stack = 'Error: Test error\n    at test';
    
    testLogger.error('Error occurred', { error: testError });
    
    expect(logOutput).toHaveLength(1);
    expect(logOutput[0].level).toBe('error');
    expect(logOutput[0].message).toBe('Error occurred');
    expect(logOutput[0].error).toBeDefined();
  });
  
  /**
   * @test Verificar diferentes níveis de log
   */
  test('should handle different log levels', () => {
    testLogger.debug('Debug message');
    testLogger.info('Info message');
    testLogger.warn('Warning message');
    testLogger.error('Error message');
    
    expect(logOutput).toHaveLength(4);
    expect(logOutput[0].level).toBe('debug');
    expect(logOutput[1].level).toBe('info');
    expect(logOutput[2].level).toBe('warn');
    expect(logOutput[3].level).toBe('error');
  });
  
  /**
   * @test Verificar formato de timestamp
   */
  test('should include valid timestamp', () => {
    testLogger.info('Test message');
    
    const logEntry = logOutput[0];
    expect(logEntry.timestamp).toBeDefined();
    expect(logEntry.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    
    const timestamp = new Date(logEntry.timestamp);
    expect(timestamp).toBeInstanceOf(Date);
    expect(timestamp.getTime()).not.toBeNaN();
  });
  
  /**
   * @test Verificar logging estruturado
   */
  test('should support structured logging', () => {
    const structuredData = {
      requestId: 'req-123',
      userId: 'user-456',
      action: 'emotion-analysis',
      duration: 150,
      success: true
    };
    
    testLogger.info('Emotion analysis completed', structuredData);
    
    const logEntry = logOutput[0];
    expect(logEntry.requestId).toBe('req-123');
    expect(logEntry.userId).toBe('user-456');
    expect(logEntry.action).toBe('emotion-analysis');
    expect(logEntry.duration).toBe(150);
    expect(logEntry.success).toBe(true);
  });
});
