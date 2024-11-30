import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts/core';
import { ParallelChart as EChartsParallel } from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  ParallelComponent,
  LegendComponent
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { CHART_COLORS } from '../../constants';

echarts.use([
  TitleComponent,
  TooltipComponent,
  ParallelComponent,
  LegendComponent,
  EChartsParallel,
  CanvasRenderer
]);

interface Dimension {
  name: string;
  min?: number;
  max?: number;
  type?: 'value' | 'category';
  data?: string[];
}

interface ParallelChartProps {
  data: number[][];
  dimensions: Dimension[];
  title?: string;
  height?: number;
}

const ParallelChart: React.FC<ParallelChartProps> = ({
  data,
  dimensions,
  title = '平行坐标图',
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
        trigger: 'item'
      },
      parallelAxis: dimensions.map((dim, i) => ({
        dim: i,
        name: dim.name,
        type: dim.type || 'value',
        data: dim.data,
        min: dim.min,
        max: dim.max
      })),
      parallel: {
        left: '5%',
        right: '13%',
        bottom: '10%',
        top: '20%',
        parallelAxisDefault: {
          nameLocation: 'end',
          nameGap: 20
        }
      },
      series: [
        {
          type: 'parallel',
          lineStyle: {
            width: 1,
            opacity: 0.5,
            color: CHART_COLORS[0]
          },
          emphasis: {
            lineStyle: {
              width: 2,
              opacity: 1,
              color: CHART_COLORS[1]
            }
          },
          data
        }
      ]
    };

    chartInstance.current.setOption(option);

    return () => {
      chartInstance.current?.dispose();
    };
  }, [data, dimensions, title]);

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

export default ParallelChart; 