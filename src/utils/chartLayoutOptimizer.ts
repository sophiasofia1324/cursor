interface LayoutConfig {
  container: HTMLElement;
  charts: Array<{
    id: string;
    width: number | string;
    height: number | string;
    minWidth?: number;
    minHeight?: number;
    maxWidth?: number;
    maxHeight?: number;
    priority: number;
  }>;
  gap?: number;
  responsive?: boolean;
}

export class ChartLayoutOptimizer {
  private static instance: ChartLayoutOptimizer;
  private layouts: Map<string, LayoutConfig> = new Map();
  private resizeObserver: ResizeObserver;

  private constructor() {
    this.resizeObserver = new ResizeObserver(this.handleResize.bind(this));
  }

  static getInstance() {
    if (!ChartLayoutOptimizer.instance) {
      ChartLayoutOptimizer.instance = new ChartLayoutOptimizer();
    }
    return ChartLayoutOptimizer.instance;
  }

  optimizeLayout(containerId: string, config: LayoutConfig) {
    this.layouts.set(containerId, config);
    if (config.responsive) {
      this.resizeObserver.observe(config.container);
    }
    this.updateLayout(containerId);
  }

  private handleResize(entries: ResizeObserverEntry[]) {
    entries.forEach(entry => {
      const containerId = entry.target.id;
      if (this.layouts.has(containerId)) {
        this.updateLayout(containerId);
      }
    });
  }

  private updateLayout(containerId: string) {
    const config = this.layouts.get(containerId);
    if (!config) return;

    const containerWidth = config.container.clientWidth;
    const containerHeight = config.container.clientHeight;
    const { charts, gap = 16 } = config;

    // 按优先级排序
    const sortedCharts = [...charts].sort((a, b) => b.priority - a.priority);

    // 计算布局
    const layout = this.calculateOptimalLayout(
      containerWidth,
      containerHeight,
      sortedCharts,
      gap
    );

    // 应用布局
    layout.forEach(item => {
      const element = document.getElementById(item.id);
      if (element) {
        Object.assign(element.style, {
          position: 'absolute',
          left: `${item.x}px`,
          top: `${item.y}px`,
          width: `${item.width}px`,
          height: `${item.height}px`
        });
      }
    });
  }

  private calculateOptimalLayout(
    containerWidth: number,
    containerHeight: number,
    charts: LayoutConfig['charts'],
    gap: number
  ) {
    // 实现布局算法，可以使用网格布局或流式布局
    return charts.map((chart, index) => ({
      id: chart.id,
      x: 0,
      y: index * (containerHeight / charts.length + gap),
      width: containerWidth,
      height: containerHeight / charts.length - gap
    }));
  }

  removeLayout(containerId: string) {
    const config = this.layouts.get(containerId);
    if (config) {
      this.resizeObserver.unobserve(config.container);
      this.layouts.delete(containerId);
    }
  }
}

export const chartLayoutOptimizer = ChartLayoutOptimizer.getInstance(); 