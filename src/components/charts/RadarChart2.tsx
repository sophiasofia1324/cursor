import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts/core';
import { RadarChart } from 'echarts/charts';
import {
  TooltipComponent,
  LegendComponent,
  TitleComponent,
  ToolboxComponent
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { CHART_COLORS } from '../../constants';
import { formatCurrency } from '../../utils/helpers';

echarts.use([
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  ToolboxComponent,
  RadarChart,
  CanvasRenderer
]);

interface RadarIndicator {
  name: string;
  max: number;
  min?: number;
  color?: string;
}

interface RadarSeriesData {
  name: string;
  value: number[];
  symbol?: string;
  symbolSize?: number;
  lineStyle?: {
    width?: number;
    type?: 'solid' | 'dashed' | 'dotted';
    color?: string;
  };
  areaStyle?: {
    opacity?: number;
    color?: string;
  };
}

interface RadarChartProps {
  indicators: RadarIndicator[];
  data: RadarSeriesData[];
  title?: string;
  width?: string | number;
  height?: string | number;
  shape?: 'polygon' | 'circle';
  splitNumber?: number;
  center?: [string | number, string | number];
  radius?: string | number;
  axisName?: {
    show?: boolean;
    formatter?: string | ((value: string) => string);
    color?: string;
    fontSize?: number;
  };
  splitLine?: {
    show?: boolean;
    lineStyle?: {
      color?: string;
      width?: number;
      type?: 'solid' | 'dashed' | 'dotted';
    };
  };
  splitArea?: {
    show?: boolean;
    areaStyle?: {
      color?: string[];
      opacity?: number;
    };
  };
}

const RadarChart2: React.FC<RadarChartProps> = ({
  indicators,
  data,
  title,
  width = '100%',
  height = 400,
  shape = 'polygon',
  splitNumber = 5,
  center = ['50%', '50%'],
  radius = '75%',
  axisName = {
    show: true,
    color: '#333',
    fontSize: 12
  },
  splitLine = {
    show: true,
    lineStyle: {
      color: '#ccc',
      width: 1,
      type: 'solid'
    }
  },
  splitArea = {
    show: true,
    areaStyle: {
      color: ['rgba(250,250,250,0.3)', 'rgba(200,200,200,0.3)'],
      opacity: 1
    }
  }
}) => {
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
          trigger: 'item',
          formatter: (params: any) => {
            const { name, value, marker } = params;
            let result = `${marker} ${name}<br/>`;
            indicators.forEach((indicator, index) => {
              result += `${indicator.name}: ${formatCurrency(value[index])}<br/>`;
            });
            return result;
          }
        },
        legend: {
          data: data.map(item => item.name),
          bottom: 0
        },
        radar: {
          shape,
          indicator: indicators,
          splitNumber,
          center,
          radius,
          axisName,
          splitLine,
          splitArea
        },
        series: [{
          type: 'radar',
          data: data.map((item, index) => ({
            name: item.name,
            value: item.value,
            symbol: item.symbol || 'circle',
            symbolSize: item.symbolSize || 4,
            lineStyle: {
              width: 2,
              ...item.lineStyle,
              color: item.lineStyle?.color || CHART_COLORS[index % CHART_COLORS.length]
            },
            areaStyle: {
              opacity: 0.3,
              ...item.areaStyle,
              color: item.areaStyle?.color || CHART_COLORS[index % CHART_COLORS.length]
            }
          }))
        }]
      };

      chartInstance.current.setOption(option);
    }

    return () => {
      chartInstance.current?.dispose();
    };
  }, [indicators, data, title, shape, splitNumber, center, radius, axisName, splitLine, splitArea]);

  return (
    <div className="relative">
      <div ref={chartRef} style={{ width, height }} />
      <div className="absolute bottom-4 right-4 space-x-2">
        <button
          className="px-2 py-1 text-sm bg-white rounded shadow hover:bg-gray-50"
          onClick={() => {
            if (chartInstance.current) {
              const option = chartInstance.current.getOption();
              const currentShape = option.radar[0].shape;
              option.radar[0].shape = currentShape === 'polygon' ? 'circle' : 'polygon';
              chartInstance.current.setOption(option);
            }
          }}
        >
          切换形状
        </button>
        <button
          className="px-2 py-1 text-sm bg-white rounded shadow hover:bg-gray-50"
          onClick={() => {
            if (chartInstance.current) {
              const option = chartInstance.current.getOption();
              const currentOpacity = option.series[0].data[0].areaStyle.opacity;
              const newOpacity = currentOpacity === 0.3 ? 0.7 : 0.3;
              
              option.series[0].data.forEach((item: any) => {
                item.areaStyle.opacity = newOpacity;
              });
              
              chartInstance.current.setOption(option);
            }
          }}
        >
          切换透明度
        </button>
      </div>
    </div>
  );
};

export default RadarChart2; 