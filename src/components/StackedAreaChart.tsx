import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts/core';
import { LineChart } from 'echarts/charts';
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
  LineChart,
  CanvasRenderer
]);

interface StackedAreaChartProps {
  data: {
    xAxis: string[];
    series: Array<{
      name: string;
      data: number[];
    }>;
  };
  title?: string;
}

const StackedAreaChart: React.FC<StackedAreaChartProps> = ({ data, title }) => {
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
            type: 'cross',
            label: {
              backgroundColor: '#6a7985'
            }
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
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: data.xAxis
        },
        yAxis: {
          type: 'value'
        },
        series: data.series.map((s, index) => ({
          name: s.name,
          type: 'line',
          stack: '总量',
          areaStyle: {
            color: CHART_COLORS[index % CHART_COLORS.length],
            opacity: 0.3
          },
          lineStyle: {
            color: CHART_COLORS[index % CHART_COLORS.length]
          },
          itemStyle: {
            color: CHART_COLORS[index % CHART_COLORS.length]
          },
          emphasis: {
            focus: 'series'
          },
          data: s.data
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

export default StackedAreaChart; 