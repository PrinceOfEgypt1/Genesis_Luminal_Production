/**
 * Sistema de logging para Genesis Luminal API
 * Configuração otimizada para desenvolvimento e produção
 * CORRIGIDO: Tipos seguros para error handling
 */

interface LogMetadata {
  [key: string]: any;
}

interface ILogger {
  info(message: string, meta?: LogMetadata): void;
  warn(message: string, meta?: LogMetadata): void;
  error(message: string, meta?: LogMetadata | unknown): void;
  debug(message: string, meta?: LogMetadata): void;
}

class Logger implements ILogger {
  private formatMessage(level: string, message: string, meta?: LogMetadata): string {
    const timestamp = new Date().toISOString();
    const metaStr = meta ? ` ${JSON.stringify(meta)}` : '';
    return `[${timestamp}] ${level.toUpperCase()}: ${message}${metaStr}`;
  }

  private safeStringify(obj: unknown): string {
    try {
      if (obj instanceof Error) {
        return JSON.stringify({
          name: obj.name,
          message: obj.message,
          stack: obj.stack
        });
      }
      return JSON.stringify(obj);
    } catch {
      return String(obj);
    }
  }

  info(message: string, meta?: LogMetadata): void {
    console.log(this.formatMessage('info', message, meta));
  }

  warn(message: string, meta?: LogMetadata): void {
    console.warn(this.formatMessage('warn', message, meta));
  }

  error(message: string, meta?: LogMetadata | unknown): void {
    let safeMeta: LogMetadata | undefined;
    
    if (meta) {
      if (typeof meta === 'object' && meta !== null) {
        safeMeta = { error: this.safeStringify(meta) };
      } else {
        safeMeta = { error: String(meta) };
      }
    }
    
    console.error(this.formatMessage('error', message, safeMeta));
  }

  debug(message: string, meta?: LogMetadata): void {
    if (process.env.NODE_ENV !== 'production') {
      console.debug(this.formatMessage('debug', message, meta));
    }
  }
}

export const logger = new Logger();
export type { ILogger, LogMetadata };
