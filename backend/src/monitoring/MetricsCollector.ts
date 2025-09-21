/**
 * @fileoverview Metrics Collector - Genesis Luminal
 * @version 1.0.0
 * @author Genesis Luminal Team
 * 
 * Coleta de métricas para observabilidade e performance monitoring
 */

import { performance } from 'perf_hooks';
import { cpuUsage, memoryUsage } from 'process';

/**
 * Tipos de métricas
 */
export enum MetricType {
  COUNTER = 'counter',
  GAUGE = 'gauge',
  HISTOGRAM = 'histogram',
  SUMMARY = 'summary'
}

/**
 * Estrutura de métrica
 */
interface Metric {
  name: string;
  type: MetricType;
  value: number;
  timestamp: number;
  labels: Record<string, string>;
  description: string;
}

/**
 * Performance budget configuration
 */
interface PerformanceBudget {
  metric: string;
  threshold: number;
  unit: string;
  severity: 'warning' | 'error';
}

/**
 * Collector de métricas enterprise
 */
export class MetricsCollector {
  private static instance: MetricsCollector;
  private metrics = new Map<string, Metric>();
  private timers = new Map<string, number>();
  private performanceBudgets: PerformanceBudget[] = [];
  private alertCallbacks: Array<(alert: any) => void> = [];
  
  // Contadores globais
  private counters = new Map<string, number>();
  private gauges = new Map<string, number>();
  private histograms = new Map<string, number[]>();
  
  private constructor() {
    this.initializePerformanceBudgets();
    this.startSystemMetricsCollection();
  }
  
  /**
   * Singleton instance
   */
  static getInstance(): MetricsCollector {
    if (!MetricsCollector.instance) {
      MetricsCollector.instance = new MetricsCollector();
    }
    return MetricsCollector.instance;
  }
  
  /**
   * Inicializa performance budgets
   */
  private initializePerformanceBudgets(): void {
    this.performanceBudgets = [
      // API Performance
      {
        metric: 'http_request_duration_ms',
        threshold: 200,
        unit: 'milliseconds',
        severity: 'warning'
      },
      {
        metric: 'http_request_duration_ms',
        threshold: 500,
        unit: 'milliseconds',
        severity: 'error'
      },
      
      // System Resources
      {
        metric: 'process_cpu_usage_percent',
        threshold: 70,
        unit: 'percent',
        severity: 'warning'
      },
      {
        metric: 'process_cpu_usage_percent',
        threshold: 90,
        unit: 'percent',
        severity: 'error'
      },
      {
        metric: 'process_memory_usage_percent',
        threshold: 80,
        unit: 'percent',
        severity: 'warning'
      },
      {
        metric: 'process_memory_usage_percent',
        threshold: 95,
        unit: 'percent',
        severity: 'error'
      },
      
      // Business Metrics
      {
        metric: 'emotion_analysis_duration_ms',
        threshold: 300,
        unit: 'milliseconds',
        severity: 'warning'
      },
      {
        metric: 'emotion_analysis_duration_ms',
        threshold: 1000,
        unit: 'milliseconds',
        severity: 'error'
      },
      
      // Error Rates
      {
        metric: 'http_request_error_rate_percent',
        threshold: 1,
        unit: 'percent',
        severity: 'warning'
      },
      {
        metric: 'http_request_error_rate_percent',
        threshold: 5,
        unit: 'percent',
        severity: 'error'
      }
    ];
  }
  
  /**
   * Inicia coleta de métricas do sistema
   */
  private startSystemMetricsCollection(): void {
    // Coletar métricas a cada 30 segundos
    setInterval(() => {
      this.collectSystemMetrics();
    }, 30000);
    
    // Primeira coleta imediata
    this.collectSystemMetrics();
  }
  
  /**
   * Coleta métricas do sistema
   */
  private collectSystemMetrics(): void {
    // CPU Usage
    const cpuStart = cpuUsage();
    setTimeout(() => {
      const cpuUsed = cpuUsage(cpuStart);
      const cpuPercent = (cpuUsed.user + cpuUsed.system) / 1000 / 10; // Aproximação
      this.gauge('process_cpu_usage_percent', cpuPercent, { 
        service: 'genesis-luminal-backend' 
      });
    }, 100);
    
    // Memory Usage
    const memUsage = memoryUsage();
    const memUsedMB = memUsage.rss / 1024 / 1024;
    const memPercent = (memUsage.heapUsed / memUsage.heapTotal) * 100;
    
    this.gauge('process_memory_usage_mb', memUsedMB, { 
      service: 'genesis-luminal-backend' 
    });
    this.gauge('process_memory_usage_percent', memPercent, { 
      service: 'genesis-luminal-backend' 
    });
    this.gauge('process_heap_used_mb', memUsage.heapUsed / 1024 / 1024, { 
      service: 'genesis-luminal-backend' 
    });
    this.gauge('process_heap_total_mb', memUsage.heapTotal / 1024 / 1024, { 
      service: 'genesis-luminal-backend' 
    });
    
    // Event Loop Lag
    const start = performance.now();
    setImmediate(() => {
      const lag = performance.now() - start;
      this.gauge('nodejs_eventloop_lag_ms', lag, { 
        service: 'genesis-luminal-backend' 
      });
    });
    
    // Uptime
    this.gauge('process_uptime_seconds', process.uptime(), { 
      service: 'genesis-luminal-backend' 
    });
  }
  
  /**
   * Incrementa contador
   */
  counter(name: string, value: number = 1, labels: Record<string, string> = {}): void {
    const key = this.buildMetricKey(name, labels);
    const current = this.counters.get(key) || 0;
    this.counters.set(key, current + value);
    
    this.recordMetric(name, MetricType.COUNTER, current + value, labels);
  }
  
  /**
   * Define gauge (valor instantâneo)
   */
  gauge(name: string, value: number, labels: Record<string, string> = {}): void {
    const key = this.buildMetricKey(name, labels);
    this.gauges.set(key, value);
    
    this.recordMetric(name, MetricType.GAUGE, value, labels);
    this.checkPerformanceBudget(name, value);
  }
  
  /**
   * Adiciona valor ao histograma
   */
  histogram(name: string, value: number, labels: Record<string, string> = {}): void {
    const key = this.buildMetricKey(name, labels);
    const values = this.histograms.get(key) || [];
    values.push(value);
    
    // Manter apenas últimos 1000 valores
    if (values.length > 1000) {
      values.shift();
    }
    
    this.histograms.set(key, values);
    this.recordMetric(name, MetricType.HISTOGRAM, value, labels);
    this.checkPerformanceBudget(name, value);
  }
  
  /**
   * Inicia timer para medição de performance
   */
  startTimer(name: string): string {
    const timerId = `${name}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.timers.set(timerId, performance.now());
    return timerId;
  }
  
  /**
   * Para timer e registra duração
   */
  stopTimer(timerId: string, labels: Record<string, string> = {}): number {
    const startTime = this.timers.get(timerId);
    if (!startTime) {
      console.warn(`Timer ${timerId} not found`);
      return 0;
    }
    
    const duration = performance.now() - startTime;
    this.timers.delete(timerId);
    
    // Extrair nome da métrica do timer ID
    const metricName = timerId.split('_')[0] + '_duration_ms';
    this.histogram(metricName, duration, labels);
    
    return duration;
  }
  
  /**
   * Convenience method para medir duração de função
   */
  measureDuration<T>(name: string, fn: () => T, labels: Record<string, string> = {}): T {
    const timerId = this.startTimer(name);
    try {
      const result = fn();
      this.stopTimer(timerId, labels);
      return result;
    } catch (error) {
      this.stopTimer(timerId, { ...labels, error: 'true' });
      throw error;
    }
  }
  
  /**
   * Convenience method para medir duração de função async
   */
  async measureDurationAsync<T>(
    name: string, 
    fn: () => Promise<T>, 
    labels: Record<string, string> = {}
  ): Promise<T> {
    const timerId = this.startTimer(name);
    try {
      const result = await fn();
      this.stopTimer(timerId, labels);
      return result;
    } catch (error) {
      this.stopTimer(timerId, { ...labels, error: 'true' });
      throw error;
    }
  }
  
  /**
   * Constrói chave única para métrica
   */
  private buildMetricKey(name: string, labels: Record<string, string>): string {
    const labelString = Object.entries(labels)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join(',');
    
    return labelString ? `${name}{${labelString}}` : name;
  }
  
  /**
   * Registra métrica com timestamp
   */
  private recordMetric(
    name: string, 
    type: MetricType, 
    value: number, 
    labels: Record<string, string>
  ): void {
    const metric: Metric = {
      name,
      type,
      value,
      timestamp: Date.now(),
      labels,
      description: this.getMetricDescription(name)
    };
    
    const key = this.buildMetricKey(name, labels);
    this.metrics.set(key, metric);
  }
  
  /**
   * Verifica performance budget
   */
  private checkPerformanceBudget(metricName: string, value: number): void {
    const budgets = this.performanceBudgets.filter(b => b.metric === metricName);
    
    for (const budget of budgets) {
      if (value > budget.threshold) {
        const alert = {
          type: 'performance_budget_exceeded',
          severity: budget.severity,
          metric: metricName,
          value,
          threshold: budget.threshold,
          unit: budget.unit,
          timestamp: new Date().toISOString(),
          message: `Performance budget exceeded: ${metricName} = ${value}${budget.unit} > ${budget.threshold}${budget.unit}`
        };
        
        this.triggerAlert(alert);
        break; // Só alertar uma vez por métrica
      }
    }
  }
  
  /**
   * Dispara alerta
   */
  private triggerAlert(alert: any): void {
    console.warn('🚨 PERFORMANCE ALERT:', alert);
    
    // Chamar callbacks registrados
    this.alertCallbacks.forEach(callback => {
      try {
        callback(alert);
      } catch (error) {
        console.error('Error in alert callback:', error);
      }
    });
  }
  
  /**
   * Registra callback para alertas
   */
  onAlert(callback: (alert: any) => void): void {
    this.alertCallbacks.push(callback);
  }
  
  /**
   * Obtém descrição da métrica
   */
  private getMetricDescription(name: string): string {
    const descriptions: Record<string, string> = {
      'http_request_duration_ms': 'HTTP request duration in milliseconds',
      'http_requests_total': 'Total number of HTTP requests',
      'http_request_error_rate_percent': 'HTTP request error rate percentage',
      'emotion_analysis_duration_ms': 'Emotion analysis duration in milliseconds',
      'emotion_analysis_total': 'Total number of emotion analyses',
      'process_cpu_usage_percent': 'Process CPU usage percentage',
      'process_memory_usage_mb': 'Process memory usage in MB',
      'process_memory_usage_percent': 'Process memory usage percentage',
      'nodejs_eventloop_lag_ms': 'Node.js event loop lag in milliseconds',
      'process_uptime_seconds': 'Process uptime in seconds'
    };
    
    return descriptions[name] || `Metric: ${name}`;
  }
  
  /**
   * Obtém todas as métricas
   */
  getAllMetrics(): Record<string, Metric> {
    const result: Record<string, Metric> = {};
    this.metrics.forEach((metric, key) => {
      result[key] = metric;
    });
    return result;
  }
  
  /**
   * Obtém métricas no formato Prometheus
   */
  getPrometheusMetrics(): string {
    let output = '';
    
    // Agrupar métricas por nome
    const metricsByName = new Map<string, Metric[]>();
    this.metrics.forEach(metric => {
      const existing = metricsByName.get(metric.name) || [];
      existing.push(metric);
      metricsByName.set(metric.name, existing);
    });
    
    // Gerar formato Prometheus
    metricsByName.forEach((metrics, name) => {
      const metric = metrics[0];
      output += `# HELP ${name} ${metric.description}\n`;
      output += `# TYPE ${name} ${metric.type}\n`;
      
      metrics.forEach(m => {
        const labels = Object.entries(m.labels)
          .map(([key, value]) => `${key}="${value}"`)
          .join(',');
        
        const labelString = labels ? `{${labels}}` : '';
        output += `${name}${labelString} ${m.value} ${m.timestamp}\n`;
      });
      
      output += '\n';
    });
    
    return output;
  }
  
  /**
   * Obtém estatísticas de histograma
   */
  getHistogramStats(name: string, labels: Record<string, string> = {}): {
    count: number;
    sum: number;
    avg: number;
    min: number;
    max: number;
    p50: number;
    p95: number;
    p99: number;
  } | null {
    const key = this.buildMetricKey(name, labels);
    const values = this.histograms.get(key);
    
    if (!values || values.length === 0) {
      return null;
    }
    
    const sorted = [...values].sort((a, b) => a - b);
    const count = values.length;
    const sum = values.reduce((a, b) => a + b, 0);
    const avg = sum / count;
    
    return {
      count,
      sum,
      avg,
      min: sorted[0],
      max: sorted[count - 1],
      p50: sorted[Math.floor(count * 0.5)],
      p95: sorted[Math.floor(count * 0.95)],
      p99: sorted[Math.floor(count * 0.99)]
    };
  }
  
  /**
   * Reset de métricas
   */
  reset(): void {
    this.metrics.clear();
    this.counters.clear();
    this.gauges.clear();
    this.histograms.clear();
    this.timers.clear();
  }
  
  /**
   * Middleware Express para métricas HTTP
   */
  static createExpressMiddleware() {
    const collector = MetricsCollector.getInstance();
    
    return (req: any, res: any, next: any) => {
      const startTime = performance.now();
      const labels = {
        method: req.method,
        route: req.route?.path || req.path,
        status_code: ''
      };
      
      // Incrementar contador de requests
      collector.counter('http_requests_total', 1, {
        method: req.method,
        route: req.route?.path || req.path
      });
      
      // Interceptar response para medir duração
      const originalSend = res.send;
      res.send = function(body: any) {
        const duration = performance.now() - startTime;
        labels.status_code = res.statusCode.toString();
        
        // Registrar duração
        collector.histogram('http_request_duration_ms', duration, labels);
        
        // Incrementar contador de erros se necessário
        if (res.statusCode >= 400) {
          collector.counter('http_request_errors_total', 1, labels);
        }
        
        return originalSend.call(this, body);
      };
      
      next();
    };
  }
}

// Export singleton instance
export const metrics = MetricsCollector.getInstance();
