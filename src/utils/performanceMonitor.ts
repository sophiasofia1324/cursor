import { debounce } from 'lodash';

interface PerformanceMetrics {
  fps: number;
  memory?: {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
  };
  renderTime: number;
  loadTime: number;
}

class ChartPerformanceMonitor {
  private static instance: ChartPerformanceMonitor;
  private metrics: PerformanceMetrics = {
    fps: 0,
    renderTime: 0,
    loadTime: 0
  };
  private frameCount = 0;
  private lastTime = performance.now();
  private isMonitoring = false;

  private constructor() {
    this.updateFPS = debounce(this.updateFPS.bind(this), 1000);
  }

  static getInstance() {
    if (!ChartPerformanceMonitor.instance) {
      ChartPerformanceMonitor.instance = new ChartPerformanceMonitor();
    }
    return ChartPerformanceMonitor.instance;
  }

  startMonitoring(chart: echarts.ECharts) {
    if (this.isMonitoring) return;
    this.isMonitoring = true;

    // 监控FPS
    const measureFPS = () => {
      this.frameCount++;
      const currentTime = performance.now();
      if (currentTime - this.lastTime >= 1000) {
        this.metrics.fps = this.frameCount;
        this.frameCount = 0;
        this.lastTime = currentTime;
      }
      if (this.isMonitoring) {
        requestAnimationFrame(measureFPS);
      }
    };
    requestAnimationFrame(measureFPS);

    // 监控内存使用
    if (window.performance && (performance as any).memory) {
      setInterval(() => {
        this.metrics.memory = {
          usedJSHeapSize: (performance as any).memory.usedJSHeapSize,
          totalJSHeapSize: (performance as any).memory.totalJSHeapSize
        };
      }, 2000);
    }

    // 监控渲染时间
    chart.on('rendered', () => {
      const renderStart = performance.now();
      requestAnimationFrame(() => {
        this.metrics.renderTime = performance.now() - renderStart;
      });
    });
  }

  stopMonitoring() {
    this.isMonitoring = false;
  }

  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  isPerformancePoor(): boolean {
    return (
      this.metrics.fps < 30 ||
      this.metrics.renderTime > 100 ||
      (this.metrics.memory?.usedJSHeapSize || 0) > 0.8 * (this.metrics.memory?.totalJSHeapSize || Infinity)
    );
  }
}

export const performanceMonitor = ChartPerformanceMonitor.getInstance(); 