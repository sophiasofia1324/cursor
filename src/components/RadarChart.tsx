import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts/core';
import { RadarChart as EChartsRadar } from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { CHART_COLORS } from '../constants';

echarts.use([
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  EChartsRadar,
  CanvasRenderer
]);

interface RadarChartProps {
  data: {
    indicators: Array<{
      name: string;
      max: number;
    }>;
    series: Array<{
      name: string;
      value: number[];
    }>;
  };
  title?: string;
}

const RadarChart: React.FC<RadarChartProps> = ({ data, title }) => {
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
          trigger: 'item'
        },
        legend: {
          data: data.series.map(s => s.name),
          bottom: 0
        },
        radar: {
          indicator: data.indicators,
          shape: 'circle',
          splitNumber: 5,
          axisName: {
            color: '#999'
          },
          splitLine: {
            lineStyle: {
              color: [
                'rgba(238, 197, 102, 0.1)',
                'rgba(238, 197, 102, 0.2)',
                'rgba(238, 197, 102, 0.4)',
                'rgba(238, 197, 102, 0.6)',
                'rgba(238, 197, 102, 0.8)',
                'rgba(238, 197, 102, 1)'
              ].reverse()
            }
          },
          splitArea: {
            show: false
          },
          axisLine: {
            lineStyle: {
              color: 'rgba(238, 197, 102, 0.5)'
            }
          }
        },
        series: data.series.map((s, index) => ({
          name: s.name,
          type: 'radar',
          data: [{
            value: s.value,
            name: s.name,
            itemStyle: {
              color: CHART_COLORS[index % CHART_COLORS.length]
            },
            areaStyle: {
              color: CHART_COLORS[index % CHART_COLORS.length],
              opacity: 0.3
            }
          }]
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

export default RadarChart; 