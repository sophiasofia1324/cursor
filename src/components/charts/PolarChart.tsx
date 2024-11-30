import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts/core';
import { BarChart } from 'echarts/charts';
import {
  TooltipComponent,
  LegendComponent,
  PolarComponent,
  TitleComponent,
  ToolboxComponent,
  AngleAxisComponent,
  RadiusAxisComponent
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { CHART_COLORS } from '../../constants';
import { formatCurrency } from '../../utils/helpers';

echarts.use([
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  PolarComponent,
  ToolboxComponent,
  AngleAxisComponent,
  RadiusAxisComponent,
  BarChart,
  CanvasRenderer
]);

interface PolarData {
  name: string;
  data: number[];
  type?: 'bar' | 'line' | 'scatter';
  stack?: string;
  itemStyle?: {
    color?: string;
    opacity?: number;
  };
  label?: {
    show?: boolean;
    position?: 'inside' | 'outside';
  };
}

interface PolarChartProps {
  data: PolarData[];
  categories: string[];
  title?: string;
  width?: string | number;
  height?: string | number;
  radius?: string | number | [string | number, string | number];
  angleAxis?: {
    startAngle?: number;
    clockwise?: boolean;
  };
  radiusAxis?: {
    min?: number;
    max?: number;
  };
  showLabel?: boolean;
  showLegend?: boolean;
  showToolbox?: boolean;
}

const PolarChart: React.FC<PolarChartProps> = ({
  data,
  categories,
  title,
  width = '100%',
  height = 400,
  radius = ['20%', '80%'],
  angleAxis = {
    startAngle: 90,
    clockwise: false
  },
  radiusAxis = {},
  showLabel = true,
  showLegend = true,
  showToolbox = true
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
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          },
          formatter: (params: any) => {
            let result = `${params[0].axisValue}<br/>`;
            params.forEach((param: any) => {
              result += `${param.marker}${param.seriesName}: ${formatCurrency(param.value)}<br/>`;
            });
            return result;
          }
        },
        legend: showLegend ? {
          data: data.map(item => item.name),
          bottom: 0
        } : undefined,
        toolbox: showToolbox ? {
          feature: {
            dataView: { show: true, readOnly: false },
            restore: { show: true },
            saveAsImage: { show: true }
          }
        } : undefined,
        polar: {
          radius
        },
        angleAxis: {
          type: 'category',
          data: categories,
          startAngle: angleAxis.startAngle,
          clockwise: angleAxis.clockwise
        },
        radiusAxis: {
          ...radiusAxis,
          axisLabel: {
            formatter: (value: number) => formatCurrency(value)
          }
        },
        series: data.map((item, index) => ({
          name: item.name,
          type: item.type || 'bar',
          coordinateSystem: 'polar',
          stack: item.stack,
          data: item.data,
          label: {
            show: showLabel,
            position: item.label?.position || 'outside',
            formatter: (params: any) => formatCurrency(params.value)
          },
          itemStyle: {
            ...item.itemStyle,
            color: item.itemStyle?.color || CHART_COLORS[index % CHART_COLORS.length]
          }
        }))
      };

      chartInstance.current.setOption(option);
    }

    return () => {
      chartInstance.current?.dispose();
    };
  }, [data, categories, title, radius, angleAxis, radiusAxis, showLabel, showLegend, showToolbox]);

  return (
    <div className="relative">
      <div ref={chartRef} style={{ width, height }} />
      <div className="absolute bottom-4 right-4 space-x-2">
        <button
          className="px-2 py-1 text-sm bg-white rounded shadow hover:bg-gray-50"
          onClick={() => {
            if (chartInstance.current) {
              const option = chartInstance.current.getOption();
              const currentClockwise = option.angleAxis[0].clockwise;
              option.angleAxis[0].clockwise = !currentClockwise;
              chartInstance.current.setOption(option);
            }
          }}
        >
          切换方向
        </button>
        <button
          className="px-2 py-1 text-sm bg-white rounded shadow hover:bg-gray-50"
          onClick={() => {
            if (chartInstance.current) {
              const option = chartInstance.current.getOption();
              const currentStartAngle = option.angleAxis[0].startAngle;
              option.angleAxis[0].startAngle = (currentStartAngle + 90) % 360;
              chartInstance.current.setOption(option);
            }
          }}
        >
          旋转角度
        </button>
      </div>
    </div>
  );
};

export default PolarChart; 