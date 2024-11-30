interface PerformanceMetrics {
  renderTime: number;
  updateTime: number;
  memoryUsage: number;
  fps: number;
  domNodes: number;
  eventListeners: number;
}

interface PerformanceReport {
  metrics: PerformanceMetrics;
  bottlenecks: string[];
  suggestions: string[];
  timestamp: number;
}

export class ChartPerformanceAnalyzer {
  private static instance: ChartPerformanceAnalyzer;
  private metrics: Map<string, PerformanceMetrics[]> = new Map();
  private reports: Map<string, PerformanceReport[]> = new Map();
  private isMonitoring: Map<string, boolean> = new Map();

  static getInstance() {
    if (!ChartPerformanceAnalyzer.instance) {
      ChartPerformanceAnalyzer.instance = new ChartPerformanceAnalyzer();
    }
    return ChartPerformanceAnalyzer.instance;
  }

  startMonitoring(chartId: string) {
    if (this.isMonitoring.get(chartId)) return;
    this.isMonitoring.set(chartId, true);
    this.collectMetrics(chartId);
  }

  stopMonitoring(chartId: string) {
    this.isMonitoring.set(chartId, false);
  }

  private async collectMetrics(chartId: string) {
    while (this.isMonitoring.get(chartId)) {
      const startTime = performance.now();
      const metrics = await this.measurePerformance(chartId);
      this.storeMetrics(chartId, metrics);
      
      const report = this.analyzePerformance(chartId);
      this.storeReport(chartId, report);

      // 每秒收集一次数据
      await new Promise(resolve => setTimeout(resolve, 1000 - (performance.now() - startTime)));
    }
  }

  private async measurePerformance(chartId: string): Promise<PerformanceMetrics> {
    const chart = document.getElementById(chartId);
    if (!chart) throw new Error('Chart not found');

    const memory = (performance as any).memory;
    
    return {
      renderTime: await this.measureRenderTime(chart),
      updateTime: await this.measureUpdateTime(chart),
      memoryUsage: memory ? memory.usedJSHeapSize : 0,
      fps: await this.measureFPS(),
      domNodes: this.countDOMNodes(chart),
      eventListeners: this.countEventListeners(chart)
    };
  }

  private async measureRenderTime(element: HTMLElement): Promise<number> {
    const start = performance.now();
    await new Promise(resolve => requestAnimationFrame(resolve));
    return performance.now() - start;
  }

  private async measureUpdateTime(element: HTMLElement): Promise<number> {
    // 实现更新时间测量逻辑
    return 0;
  }

  private async measureFPS(): Promise<number> {
    let frames = 0;
    const start = performance.now();

    return new Promise(resolve => {
      const countFrames = () => {
        frames++;
        if (performance.now() - start < 1000) {
          requestAnimationFrame(countFrames);
        } else {
          resolve(frames);
        }
      };
      requestAnimationFrame(countFrames);
    });
  }

  private countDOMNodes(element: HTMLElement): number {
    return element.getElementsByTagName('*').length;
  }

  private countEventListeners(element: HTMLElement): number {
    // 实现事件监听器计数逻辑
    return 0;
  }

  private storeMetrics(chartId: string, metrics: PerformanceMetrics) {
    if (!this.metrics.has(chartId)) {
      this.metrics.set(chartId, []);
    }
    this.metrics.get(chartId)!.push(metrics);

    // 只保留最近100条记录
    const records = this.metrics.get(chartId)!;
    if (records.length > 100) {
      records.shift();
    }
  }

  private analyzePerformance(chartId: string): PerformanceReport {
    const metrics = this.metrics.get(chartId)?.slice(-1)[0] || {
      renderTime: 0,
      updateTime: 0,
      memoryUsage: 0,
      fps: 0,
      domNodes: 0,
      eventListeners: 0
    };

    const bottlenecks = [];
    const suggestions = [];

    if (metrics.renderTime > 16) {
      bottlenecks.push('High render time');
      suggestions.push('Consider reducing data points or simplifying chart');
    }

    if (metrics.fps < 30) {
      bottlenecks.push('Low FPS');
      suggestions.push('Optimize animations and reduce visual effects');
    }

    if (metrics.domNodes > 1000) {
      bottlenecks.push('Too many DOM nodes');
      suggestions.push('Consider using data sampling or virtual scrolling');
    }

    return {
      metrics,
      bottlenecks,
      suggestions,
      timestamp: Date.now()
    };
  }

  private storeReport(chartId: string, report: PerformanceReport) {
    if (!this.reports.has(chartId)) {
      this.reports.set(chartId, []);
    }
    this.reports.get(chartId)!.push(report);

    // 只保留最近10条报告
    const reports = this.reports.get(chartId)!;
    if (reports.length > 10) {
      reports.shift();
    }
  }

  getLatestReport(chartId: string): PerformanceReport | null {
    return this.reports.get(chartId)?.slice(-1)[0] || null;
  }

  getAllReports(chartId: string): PerformanceReport[] {
    return this.reports.get(chartId) || [];
  }
}

export const chartPerformanceAnalyzer = ChartPerformanceAnalyzer.getInstance(); 