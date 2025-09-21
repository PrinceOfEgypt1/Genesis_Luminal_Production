/**
 * @fileoverview Tracing de observabilidade - Genesis Luminal
 */

export function generateCorrelationId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function setCorrelationId(req: any, correlationId: string): void {
  req.correlationId = correlationId;
}

export function getCorrelationId(req: any): string {
  return req.correlationId || generateCorrelationId();
}
