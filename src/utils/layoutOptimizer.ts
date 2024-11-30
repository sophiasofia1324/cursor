interface LayoutConfig {
  container: HTMLElement;
  charts: Array<{
    id: string;
    minWidth: number;
    minHeight: number;
    aspectRatio?: number;
    priority: number;
  }>;
  gap?: number;
  maxColumns?: number;
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
    this.resizeObserver.observe(config.container);
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

    const { container, charts, gap = 16, maxColumns = 3 } = config;
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;

    // 按优先级排序
    const sortedCharts = [...charts].sort((a, b) => b.priority - a.priority);

    // 计算最佳列数
    const columns = this.calculateOptimalColumns(containerWidth, sortedCharts, gap, maxColumns);

    // 计算每个图表的尺寸和位置
    const layouts = this.calculateChartLayouts(
      containerWidth,
      containerHeight,
      columns,
      sortedCharts,
      gap
    );

    // 应用布局
    layouts.forEach(layout => {
      const element = document.getElementById(layout.id);
      if (element) {
        Object.assign(element.style, {
          position: 'absolute',
          left: `${layout.x}px`,
          top: `${layout.y}px`,
          width: `${layout.width}px`,
          height: `${layout.height}px`
        });
      }
    });
  }

  private calculateOptimalColumns(
    containerWidth: number,
    charts: LayoutConfig['charts'],
    gap: number,
    maxColumns: number
  ): number {
    let bestColumns = 1;
    let minWaste = Infinity;

    for (let cols = 1; cols <= maxColumns; cols++) {
      const availableWidth = (containerWidth - (cols - 1) * gap) / cols;
      const waste = charts.reduce((acc, chart) => {
        const fits = chart.minWidth <= availableWidth;
        return acc + (fits ? 0 : Math.abs(availableWidth - chart.minWidth));
      }, 0);

      if (waste < minWaste) {
        minWaste = waste;
        bestColumns = cols;
      }
    }

    return bestColumns;
  }

  private calculateChartLayouts(
    containerWidth: number,
    containerHeight: number,
    columns: number,
    charts: LayoutConfig['charts'],
    gap: number
  ) {
    const layouts = [];
    const columnWidth = (containerWidth - (columns - 1) * gap) / columns;
    let x = 0;
    let y = 0;
    let maxRowHeight = 0;

    charts.forEach((chart, index) => {
      const colIndex = index % columns;
      const height = chart.aspectRatio ? columnWidth / chart.aspectRatio : chart.minHeight;

      if (colIndex === 0 && index > 0) {
        x = 0;
        y += maxRowHeight + gap;
        maxRowHeight = 0;
      }

      layouts.push({
        id: chart.id,
        x,
        y,
        width: columnWidth,
        height
      });

      maxRowHeight = Math.max(maxRowHeight, height);
      x += columnWidth + gap;
    });

    return layouts;
  }

  removeLayout(containerId: string) {
    const config = this.layouts.get(containerId);
    if (config) {
      this.resizeObserver.unobserve(config.container);
      this.layouts.delete(containerId);
    }
  }
}

export const layoutOptimizer = ChartLayoutOptimizer.getInstance(); 