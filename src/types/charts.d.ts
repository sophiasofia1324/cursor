import { EChartsOption } from 'echarts';

export interface ChartProps {
  data: any;
  options?: EChartsOption;
  style?: React.CSSProperties;
  className?: string;
  theme?: string;
}

export interface ChartData {
  series: Array<{
    name: string;
    data: number[];
  }>;
  xAxis: string[];
}

export interface ChartConfig {
  type: string;
  data: ChartData;
  options?: EChartsOption;
}

export interface ChartDataItem {
  name: string;
  value: number;
  data?: any[];
  [key: string]: any;
}

export interface ChartSeriesItem {
  name: string;
  type: string;
  data: any[];
  [key: string]: any;
} 