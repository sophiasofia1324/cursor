import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts/core';
import { LineChart as EChartsLine } from 'echarts/charts';
import {
  GridComponent,
  TooltipComponent,
  TitleComponent,
  LegendComponent
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { CHART_COLORS } from '../constants';

echarts.use([
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  EChartsLine,
  CanvasRenderer
]);

interface LineChartProps {
  data: {
    xAxis: string[];
    series: Array<{
      name: string;
      data: number[];
    }>;
  };
  title?: string;
}

interface DataItem {
  name: string;
  value: number;
  data: number[];
}

const LineChart: React.FC<LineChartProps> = ({ data, title }) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts>();

  useEffect(() => {
    if (chartRef.current) {
      if (!chartInstance.current) {
        chartInstance.current = echarts.init(chartRef.current);
      }

      const option = {
        title: {
          text: title,
          left: 'center'
        },
        tooltip: {
          trigger: 'axis',
          formatter: (params: any) => {
            let result = `${params[0].axisValue}<br/>`;
            params.forEach((param: any, index: number) => {
              result += `${param.seriesName}: ¥${param.value.toFixed(2)}<br/>`;
            });
            return result;
          }
        },
        legend: {
          data: data.series.map((s: DataItem) => s.name),
          bottom: 0
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '10%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: data.xAxis
        },
        yAxis: {
          type: 'value'
        },
        series: data.series.map((s: DataItem, index: number) => ({
          name: s.name,
          type: 'line',
          data: s.data,
          color: CHART_COLORS[index % CHART_COLORS.length],
          smooth: true,
          showSymbol: false,
          emphasis: {
            focus: 'series'
          }
        }))
      };

      chartInstance.current.setOption(option);
    }

    return () => {
      chartInstance.current?.dispose();
    };
  }, [data, title]);

  return <div ref={chartRef} style={{ height: '400px', width: '100%' }} />;
};

export default LineChart; 