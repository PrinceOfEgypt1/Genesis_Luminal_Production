/**
 * @fileoverview Métricas de observabilidade - Genesis Luminal
 */

export function recordHttpRequest(
  method: string,
  route: string,
  statusCode: number,
  duration: number
): void {
  // Implementação simples de métricas
  console.log(`HTTP ${method} ${route} ${statusCode} ${duration}ms`);
}

export function recordBusinessMetric(
  name: string,
  value: number,
  labels?: Record<string, string>
): void {
  console.log(`METRIC ${name}=${value}`, labels || {});
}
