/**
 * Processing Metrics Value Object - Domain Layer
 * IMPLEMENTADO: Métricas de processamento como value object
 */

export class ProcessingMetrics {
  constructor(
    public readonly startTime: Date,
    public readonly endTime: Date,
    public readonly processingTimeMs: number,
    public readonly requestSize: number,
    public readonly memoryUsage?: number
  ) {
    this.validate();
  }

  private validate(): void {
    if (this.processingTimeMs < 0) {
      throw new Error('Processing time cannot be negative');
    }
    
    if (this.endTime < this.startTime) {
      throw new Error('End time cannot be before start time');
    }
    
    if (this.requestSize < 0) {
      throw new Error('Request size cannot be negative');
    }
  }

  static create(startTime: Date, requestSize: number): ProcessingMetrics {
    const endTime = new Date();
    const processingTimeMs = endTime.getTime() - startTime.getTime();
    
    return new ProcessingMetrics(
      startTime,
      endTime,
      processingTimeMs,
      requestSize,
      process.memoryUsage?.()?.heapUsed
    );
  }

  public isSlowProcessing(thresholdMs: number = 1000): boolean {
    return this.processingTimeMs > thresholdMs;
  }

  public toJSON() {
    return {
      startTime: this.startTime.toISOString(),
      endTime: this.endTime.toISOString(),
      processingTimeMs: this.processingTimeMs,
      requestSize: this.requestSize,
      memoryUsage: this.memoryUsage,
      isSlowProcessing: this.isSlowProcessing()
    };
  }
}
