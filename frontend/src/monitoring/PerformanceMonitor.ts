declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

/**
 * @fileoverview Performance Monitor - Genesis Luminal Frontend
 * @version 1.0.0
 * @author Genesis Luminal Team
 * 
 * Monitoring de performance frontend com Core Web Vitals
 */

import { getCLS, getFID, getFCP, getLCP, getTTFB, Metric } from 'web-vitals';

/**
 * Performance budget thresholds
 */
const PERFORMANCE_BUDGETS = {
  // Core Web Vitals
  LCP: { good: 2500, poor: 4000, unit: 'ms' }, // Largest Contentful Paint
  FID: { good: 100, poor: 300, unit: 'ms' },   // First Input Delay
  CLS: { good: 0.1, poor: 0.25, unit: 'score' }, // Cumulative Layout Shift
  
  // Other metrics
  FCP: { good: 1800, poor: 3000, unit: 'ms' }, // First Contentful Paint
  TTFB: { good: 800, poor: 1800, unit: 'ms' }, // Time to First Byte
  
  // Custom metrics
  bundleSize: { good: 250, poor: 500, unit: 'KB' },
  memoryUsage: { good: 50, poor: 100, unit: 'MB' },
  fps: { good: 55, poor: 45, unit: 'fps' }
};

/**
 * Performance alert severities
 */
type AlertSeverity = 'good' | 'needs-improvement' | 'poor';

/**
 * Performance alert
 */
interface PerformanceAlert {
  metric: string;
  value: number;
  threshold: number;
  severity: AlertSeverity;
  timestamp: number;
  url: string;
  userAgent: string;
}

/**
 * Performance monitor class
 */
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private alerts: PerformanceAlert[] = [];
  private fps: number[] = [];
  private memoryMeasurements: number[] = [];
  private bundleSizeChecked = false;
  
  private constructor() {
    this.initializeWebVitals();
    this.initializeCustomMetrics();
  }
  
  /**
   * Singleton instance
   */
  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }
  
  /**
   * Inicializa Web Vitals monitoring
   */
  private initializeWebVitals(): void {
    // Largest Contentful Paint
    getLCP((metric: Metric) => {
      this.checkPerformanceBudget('LCP', metric.value, PERFORMANCE_BUDGETS.LCP);
      this.sendMetricToAnalytics('LCP', metric.value);
    });
    
    // First Input Delay
    getFID((metric: Metric) => {
      this.checkPerformanceBudget('FID', metric.value, PERFORMANCE_BUDGETS.FID);
      this.sendMetricToAnalytics('FID', metric.value);
    });
    
    // Cumulative Layout Shift
    getCLS((metric: Metric) => {
      this.checkPerformanceBudget('CLS', metric.value, PERFORMANCE_BUDGETS.CLS);
      this.sendMetricToAnalytics('CLS', metric.value);
    });
    
    // First Contentful Paint
    getFCP((metric: Metric) => {
      this.checkPerformanceBudget('FCP', metric.value, PERFORMANCE_BUDGETS.FCP);
      this.sendMetricToAnalytics('FCP', metric.value);
    });
    
    // Time to First Byte
    getTTFB((metric: Metric) => {
      this.checkPerformanceBudget('TTFB', metric.value, PERFORMANCE_BUDGETS.TTFB);
      this.sendMetricToAnalytics('TTFB', metric.value);
    });
  }
  
  /**
   * Inicializa métricas customizadas
   */
  private initializeCustomMetrics(): void {
    // FPS monitoring
    this.startFPSMonitoring();
    
    // Memory monitoring
    this.startMemoryMonitoring();
    
    // Bundle size check
    this.checkBundleSize();
    
    // Resource loading monitoring
    this.monitorResourceLoading();
  }
  
  /**
   * Monitora FPS
   */
  private startFPSMonitoring(): void {
    let lastTime = performance.now();
    let frames = 0;
    
    const measureFPS = (currentTime: number) => {
      frames++;
      
      if (currentTime - lastTime >= 1000) { // Cada segundo
        const fps = Math.round((frames * 1000) / (currentTime - lastTime));
        this.fps.push(fps);
        
        // Manter apenas últimas 60 medições
        if (this.fps.length > 60) {
          this.fps.shift();
        }
        
        this.checkPerformanceBudget('fps', fps, PERFORMANCE_BUDGETS.fps);
        this.sendMetricToAnalytics('FPS', fps);
        
        frames = 0;
        lastTime = currentTime;
      }
      
      requestAnimationFrame(measureFPS);
    };
    
    requestAnimationFrame(measureFPS);
  }
  
  /**
   * Monitora uso de memória
   */
  private startMemoryMonitoring(): void {
    if ('memory' in performance) {
      setInterval(() => {
        const memory = (performance as any).memory;
        if (memory) {
          const usedMB = memory.usedJSHeapSize / 1024 / 1024;
          this.memoryMeasurements.push(usedMB);
          
          // Manter apenas últimas 60 medições
          if (this.memoryMeasurements.length > 60) {
            this.memoryMeasurements.shift();
          }
          
          this.checkPerformanceBudget('memoryUsage', usedMB, PERFORMANCE_BUDGETS.memoryUsage);
          this.sendMetricToAnalytics('MemoryUsage', usedMB);
        }
      }, 5000); // A cada 5 segundos
    }
  }
  
  /**
   * Verifica tamanho do bundle
   */
  private checkBundleSize(): void {
    if (this.bundleSizeChecked) return;
    
    // Usar Performance API para estimar tamanho dos recursos
    window.addEventListener('load', () => {
      const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
      let totalSize = 0;
      
      resources.forEach(resource => {
        if (resource.name.includes('.js') || resource.name.includes('.css')) {
          // Estimar tamanho baseado em transferSize
          totalSize += resource.transferSize || 0;
        }
      });
      
      const totalSizeKB = totalSize / 1024;
      this.checkPerformanceBudget('bundleSize', totalSizeKB, PERFORMANCE_BUDGETS.bundleSize);
      this.sendMetricToAnalytics('BundleSize', totalSizeKB);
      
      this.bundleSizeChecked = true;
    });
  }
  
  /**
   * Monitora carregamento de recursos
   */
  private monitorResourceLoading(): void {
    // Observar recursos que demoram muito para carregar
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.entryType === 'resource') {
          const resource = entry as PerformanceResourceTiming;
          const loadTime = resource.responseEnd - resource.requestStart;
          
          // Alertar se recurso demorou mais que 3 segundos
          if (loadTime > 3000) {
            console.warn('🐌 Slow resource loading detected:', {
              name: resource.name,
              duration: loadTime,
              size: resource.transferSize
            });
            
            this.sendMetricToAnalytics('SlowResource', loadTime, {
              resourceName: resource.name,
              resourceType: resource.initiatorType
            });
          }
        }
      });
    });
    
    observer.observe({ entryTypes: ['resource'] });
  }
  
  /**
   * Verifica performance budget
   */
  private checkPerformanceBudget(
    metric: string, 
    value: number, 
    budget: { good: number; poor: number; unit: string }
  ): void {
    let severity: AlertSeverity = 'good';
    let threshold = budget.good;
    
    if (value > budget.poor) {
      severity = 'poor';
      threshold = budget.poor;
    } else if (value > budget.good) {
      severity = 'needs-improvement';
      threshold = budget.good;
    }
    
    if (severity !== 'good') {
      const alert: PerformanceAlert = {
        metric,
        value,
        threshold,
        severity,
        timestamp: Date.now(),
        url: window.location.href,
        userAgent: navigator.userAgent
      };
      
      this.alerts.push(alert);
      
      // Manter apenas últimos 100 alertas
      if (this.alerts.length > 100) {
        this.alerts.shift();
      }
      
      console.warn(`⚠️ Performance budget exceeded: ${metric} = ${value}${budget.unit} (threshold: ${threshold}${budget.unit})`);
      
      // Enviar alerta para analytics
      this.sendPerformanceAlert(alert);
    }
  }
  
  /**
   * Envia métrica para analytics
   */
  private sendMetricToAnalytics(metric: string, value: number, labels: Record<string, string> = {}): void {
    // Integração com Google Analytics 4
    if (typeof window.gtag !== 'undefined') {
      window.gtag?.('event', 'performance_metric', {
        metric_name: metric,
        metric_value: value,
        ...labels
      });
    }
    
    // Enviar para backend
    if (navigator.sendBeacon) {
      const data = JSON.stringify({
        metric,
        value,
        labels,
        timestamp: Date.now(),
        url: window.location.href
      });
      
      navigator.sendBeacon('/api/metrics', data);
    } else {
      // Fallback para fetch
      fetch('/api/metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          metric,
          value,
          labels,
          timestamp: Date.now(),
          url: window.location.href
        })
      }).catch(console.error);
    }
  }
  
  /**
   * Envia alerta de performance
   */
  private sendPerformanceAlert(alert: PerformanceAlert): void {
    // Integração com Google Analytics
    if (typeof window.gtag !== 'undefined') {
      window.gtag?.('event', 'performance_alert', {
        metric_name: alert.metric,
        severity: alert.severity,
        value: alert.value,
        threshold: alert.threshold
      });
    }
    
    // Enviar para backend
    fetch('/api/performance-alerts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(alert)
    }).catch(console.error);
  }
  
  /**
   * Obtém estatísticas de FPS
   */
  getFPSStats(): { avg: number; min: number; max: number; current: number } {
    if (this.fps.length === 0) {
      return { avg: 0, min: 0, max: 0, current: 0 };
    }
    
    const avg = this.fps.reduce((a, b) => a + b, 0) / this.fps.length;
    const min = Math.min(...this.fps);
    const max = Math.max(...this.fps);
    const current = this.fps[this.fps.length - 1] || 0;
    
    return { avg: Math.round(avg), min, max, current };
  }
  
  /**
   * Obtém estatísticas de memória
   */
  getMemoryStats(): { avg: number; min: number; max: number; current: number } {
    if (this.memoryMeasurements.length === 0) {
      return { avg: 0, min: 0, max: 0, current: 0 };
    }
    
    const avg = this.memoryMeasurements.reduce((a, b) => a + b, 0) / this.memoryMeasurements.length;
    const min = Math.min(...this.memoryMeasurements);
    const max = Math.max(...this.memoryMeasurements);
    const current = this.memoryMeasurements[this.memoryMeasurements.length - 1] || 0;
    
    return { 
      avg: Math.round(avg * 100) / 100, 
      min: Math.round(min * 100) / 100, 
      max: Math.round(max * 100) / 100, 
      current: Math.round(current * 100) / 100 
    };
  }
  
  /**
   * Obtém todos os alertas
   */
  getAlerts(): PerformanceAlert[] {
    return [...this.alerts];
  }
  
  /**
   * Obtém score geral de performance
   */
  getPerformanceScore(): { score: number; grade: string; details: Record<string, any> } {
    const fpsStats = this.getFPSStats();
    const memoryStats = this.getMemoryStats();
    
    // Calcular score baseado em diferentes métricas
    let score = 100;
    const details: Record<string, any> = {};
    
    // FPS penalty
    if (fpsStats.avg < PERFORMANCE_BUDGETS.fps.poor) {
      score -= 20;
      details.fps = 'poor';
    } else if (fpsStats.avg < PERFORMANCE_BUDGETS.fps.good) {
      score -= 10;
      details.fps = 'needs-improvement';
    } else {
      details.fps = 'good';
    }
    
    // Memory penalty
    if (memoryStats.avg > PERFORMANCE_BUDGETS.memoryUsage.poor) {
      score -= 15;
      details.memory = 'poor';
    } else if (memoryStats.avg > PERFORMANCE_BUDGETS.memoryUsage.good) {
      score -= 7;
      details.memory = 'needs-improvement';
    } else {
      details.memory = 'good';
    }
    
    // Alertas recentes penalty
    const recentAlerts = this.alerts.filter(a => Date.now() - a.timestamp < 60000); // Último minuto
    score -= recentAlerts.length * 5;
    
    // Grade calculation
    let grade = 'A';
    if (score < 90) grade = 'B';
    if (score < 80) grade = 'C';
    if (score < 70) grade = 'D';
    if (score < 60) grade = 'F';
    
    return {
      score: Math.max(0, Math.round(score)),
      grade,
      details: {
        ...details,
        recentAlerts: recentAlerts.length,
        totalAlerts: this.alerts.length
      }
    };
  }
  
  /**
   * Mede performance de uma função
   */
  measureFunction<T>(name: string, fn: () => T): T {
    const start = performance.now();
    try {
      const result = fn();
      const duration = performance.now() - start;
      
      this.sendMetricToAnalytics(`CustomTiming_${name}`, duration);
      
      if (duration > 100) {
        console.warn(`🐌 Slow function detected: ${name} took ${duration.toFixed(2)}ms`);
      }
      
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      this.sendMetricToAnalytics(`CustomTiming_${name}_Error`, duration);
      throw error;
    }
  }
  
  /**
   * Mede performance de função async
   */
  async measureAsyncFunction<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const start = performance.now();
    try {
      const result = await fn();
      const duration = performance.now() - start;
      
      this.sendMetricToAnalytics(`CustomTiming_${name}`, duration);
      
      if (duration > 100) {
        console.warn(`🐌 Slow async function detected: ${name} took ${duration.toFixed(2)}ms`);
      }
      
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      this.sendMetricToAnalytics(`CustomTiming_${name}_Error`, duration);
      throw error;
    }
  }
}

// Export singleton instance
export const performanceMonitor = PerformanceMonitor.getInstance();

// Auto-initialize
if (typeof window !== 'undefined') {
  // Initialize on page load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      performanceMonitor; // Just access to initialize
    });
  } else {
    performanceMonitor; // Initialize immediately
  }
}
