import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts/core';
import { HeatmapChart as EChartsHeatmap } from 'echarts/charts';
import {
  TooltipComponent,
  VisualMapComponent,
  GridComponent,
  TitleComponent,
  DataZoomComponent
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { formatCurrency } from '../../utils/helpers';

echarts.use([
  TitleComponent,
  TooltipComponent,
  GridComponent,
  VisualMapComponent,
  DataZoomComponent,
  EChartsHeatmap,
  CanvasRenderer
]);

interface HeatmapData {
  value: [number, number, number]; // [x, y, value]
  itemStyle?: {
    color?: string;
  };
}

interface HeatmapChartProps {
  data: HeatmapData[];
  xAxis: string[];
  yAxis: string[];
  title?: string;
  visualMap?: {
    min?: number;
    max?: number;
    calculable?: boolean;
    orient?: 'horizontal' | 'vertical';
    left?: string | number;
    bottom?: string | number;
    inRange?: {
      color: string[];
    };
  };
}

const HeatmapChart: React.FC<HeatmapChartProps> = ({
  data,
  xAxis: xAxisData,
  yAxis: yAxisData,
  title,
  visualMap: visualMapProps
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts>();

  useEffect(() => {
    if (chartRef.current) {
      if (!chartInstance.current) {
        chartInstance.current = echarts.init(chartRef.current);
      }

      const values = data.map(item => item.value[2]);
      const defaultVisualMap = {
        min: Math.min(...values),
        max: Math.max(...values),
        calculable: true,
        orient: 'horizontal',
        left: 'center',
        bottom: '5%',
        inRange: {
          color: ['#313695', '#4575b4', '#74add1', '#abd9e9', '#e0f3f8', '#ffffbf',
            '#fee090', '#fdae61', '#f46d43', '#d73027', '#a50026']
        }
      };

      const option = {
        title: {
          text: title,
          left: 'center'
        },
        tooltip: {
          position: 'top',
          formatter: (params: any) => {
            const value = params.value;
            return `${xAxisData[value[0]]}, ${yAxisData[value[1]]}<br/>
              数值: ${formatCurrency(value[2])}`;
          }
        },
        animation: true,
        grid: {
          height: '70%',
          top: '10%'
        },
        xAxis: {
          type: 'category',
          data: xAxisData,
          splitArea: {
            show: true
          }
        },
        yAxis: {
          type: 'category',
          data: yAxisData,
          splitArea: {
            show: true
          }
        },
        visualMap: {
          ...defaultVisualMap,
          ...visualMapProps
        },
        series: [{
          name: title,
          type: 'heatmap',
          data: data,
          label: {
            show: true,
            formatter: (params: any) => formatCurrency(params.value[2])
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }]
      };

      chartInstance.current.setOption(option);
    }

    return () => {
      chartInstance.current?.dispose();
    };
  }, [data, xAxisData, yAxisData, title, visualMapProps]);

  return <div ref={chartRef} style={{ height: '500px', width: '100%' }} />;
};

export default HeatmapChart; 