import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts/core';
import { LineChart as EChartsLine } from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { CHART_COLORS } from '../../constants';

echarts.use([
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  EChartsLine,
  CanvasRenderer
]);

interface LineChartProps {
  data: Array<{
    name: string;
    data: number[];
  }>;
  xAxis: string[];
  title?: string;
  height?: number;
}

const LineChart: React.FC<LineChartProps> = ({
  data,
  xAxis,
  title = '折线图',
  height = 400
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts>();

  useEffect(() => {
    if (!chartRef.current) return;

    if (!chartInstance.current) {
      chartInstance.current = echarts.init(chartRef.current);
    }

    const option = {
      title: {
        text: title,
        left: 'center'
      },
      tooltip: {
        trigger: 'axis'
      },
      legend: {
        data: data.map(s => s.name),
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
        data: xAxis
      },
      yAxis: {
        type: 'value'
      },
      series: data.map((s, index) => ({
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

    return () => {
      chartInstance.current?.dispose();
    };
  }, [data, xAxis, title]);

  useEffect(() => {
    const handleResize = () => {
      chartInstance.current?.resize();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return <div ref={chartRef} style={{ width: '100%', height }} />;
};

export default LineChart; 