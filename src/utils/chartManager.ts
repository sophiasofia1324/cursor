import * as echarts from 'echarts/core';

type ChartType = 'line' | 'bar' | 'pie' | 'scatter' | 'heatmap' | 'radar';
type EChartsOption = any;

interface ChartConfig {
  type: ChartType;
  container: HTMLElement;
  theme?: string;
  autoResize?: boolean;
  loading?: boolean;
}

export class ChartManager {
  private static instance: ChartManager;
  private charts: Map<string, echarts.ECharts> = new Map();
  private configs: Map<string, ChartConfig> = new Map();

  static getInstance() {
    if (!ChartManager.instance) {
      ChartManager.instance = new ChartManager();
    }
    return ChartManager.instance;
  }

  createChart(id: string, config: ChartConfig): echarts.ECharts {
    if (this.charts.has(id)) {
      this.disposeChart(id);
    }

    const chart = echarts.init(config.container, config.theme);
    if (config.autoResize) {
      window.addEventListener('resize', () => chart.resize());
    }

    this.charts.set(id, chart);
    this.configs.set(id, config);
    return chart;
  }

  updateChart(id: string, option: EChartsOption) {
    const chart = this.charts.get(id);
    if (chart) {
      chart.setOption(option);
    }
  }

  getChart(id: string): echarts.ECharts | undefined {
    return this.charts.get(id);
  }

  disposeChart(id: string) {
    const chart = this.charts.get(id);
    if (chart) {
      chart.dispose();
      this.charts.delete(id);
      this.configs.delete(id);
    }
  }

  disposeAll() {
    this.charts.forEach(chart => chart.dispose());
    this.charts.clear();
    this.configs.clear();
  }

  resizeChart(id: string) {
    const chart = this.charts.get(id);
    if (chart) {
      chart.resize();
    }
  }

  setLoading(id: string, loading: boolean) {
    const chart = this.charts.get(id);
    if (chart) {
      loading ? chart.showLoading() : chart.hideLoading();
    }
  }

  setTheme(id: string, theme: string) {
    const config = this.configs.get(id);
    if (config) {
      const newConfig = { ...config, theme };
      this.createChart(id, newConfig);
    }
  }
}

export const chartManager = ChartManager.getInstance(); 