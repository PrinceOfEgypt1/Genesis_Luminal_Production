/**
 * Adapter que implementa ILogger usando winston logger existente
 */

import { ILogger } from '../../domain/interfaces/IEmotionalAnalyzer';
import { logger } from '../../utils/logger';

export class LoggerAdapter implements ILogger {
  info(message: string, meta?: any): void {
    logger.info(message, meta);
  }

  warn(message: string, meta?: any): void {
    logger.warn(message, meta);
  }

  error(message: string, meta?: any): void {
    logger.error(message, meta);
  }

  debug(message: string, meta?: any): void {
    logger.debug(message, meta);
  }
}
