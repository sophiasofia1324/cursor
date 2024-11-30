import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts/core';
import { BarChart as EChartsBar } from 'echarts/charts';
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
  EChartsBar,
  CanvasRenderer
]);

interface BarChartProps {
  data: {
    xAxis: string[];
    series: Array<{
      name: string;
      data: number[];
    }>;
  };
  title?: string;
  direction?: 'vertical' | 'horizontal';
}

const BarChart: React.FC<BarChartProps> = ({ data, title, direction = 'vertical' }) => {
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
          axisPointer: {
            type: 'shadow'
          },
          formatter: (params: any) => {
            let result = `${params[0].axisValue}<br/>`;
            params.forEach((param: any, index: number) => {
              result += `${param.seriesName}: ¥${param.value.toFixed(2)}<br/>`;
            });
            return result;
          }
        },
        legend: {
          data: data.series.map(s => s.name),
          bottom: 0
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '15%',
          containLabel: true
        },
        xAxis: direction === 'vertical' ? {
          type: 'category',
          data: data.xAxis
        } : {
          type: 'value'
        },
        yAxis: direction === 'vertical' ? {
          type: 'value'
        } : {
          type: 'category',
          data: data.xAxis
        },
        series: data.series.map((s, index) => ({
          name: s.name,
          type: 'bar',
          data: s.data,
          color: CHART_COLORS[index % CHART_COLORS.length],
          label: {
            show: true,
            position: direction === 'vertical' ? 'top' : 'right',
            formatter: '{c}'
          }
        }))
      };

      chartInstance.current.setOption(option);
    }

    return () => {
      chartInstance.current?.dispose();
    };
  }, [data, title, direction]);

  return <div ref={chartRef} style={{ height: '400px', width: '100%' }} />;
};

export default BarChart; 