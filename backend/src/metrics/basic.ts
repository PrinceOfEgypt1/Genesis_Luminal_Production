/**
 * Métricas básicas - Sprint 5 Passo 1
 */
export class BasicMetrics {
  private requestCount = 0;

  public recordRequest(): void {
    this.requestCount++;
    console.log(`Total requests: ${this.requestCount}`);
  }

  public getMetrics(): string {
    return `requests_total ${this.requestCount}`;
  }
}

export const metrics = new BasicMetrics();
