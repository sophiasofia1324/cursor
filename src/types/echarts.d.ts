declare module 'echarts/core' {
  export interface ECharts {
    setOption(option: any): void;
    dispose(): void;
    resize(): void;
    getOption(): any;
    showLoading(): void;
    hideLoading(): void;
  }

  export function init(dom: HTMLElement, theme?: string): ECharts;
  export function use(components: any[]): void;
}

declare module 'echarts/charts' {
  export const LineChart: any;
  export const BarChart: any;
  export const PieChart: any;
  export const ScatterChart: any;
  export const RadarChart: any;
  export const HeatmapChart: any;
  export const TreemapChart: any;
  export const SunburstChart: any;
  export const SankeyChart: any;
  export const FunnelChart: any;
  export const GraphChart: any;
  export const BoxplotChart: any;
  export const ThemeRiverChart: any;
  export const CandlestickChart: any;
  export const GaugeChart: any;
  export const ParallelChart: any;
  export const RoseChart: any;
}

declare module 'echarts/components' {
  export const TitleComponent: any;
  export const TooltipComponent: any;
  export const GridComponent: any;
  export const LegendComponent: any;
  export const DataZoomComponent: any;
  export const VisualMapComponent: any;
  export const ToolboxComponent: any;
  export const CalendarComponent: any;
  export const SingleAxisComponent: any;
  export const MarkLineComponent: any;
  export const MarkPointComponent: any;
  export const PolarComponent: any;
  export const AngleAxisComponent: any;
  export const RadiusAxisComponent: any;
}

declare module 'echarts/renderers' {
  export const CanvasRenderer: any;
}

declare module 'echarts' {
  export * from 'echarts/core';
  export interface EChartsOption {
    [key: string]: any;
  }
}

declare module 'echarts-wordcloud' {
  const wordcloud: any;
  export default wordcloud;
} 