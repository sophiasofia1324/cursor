import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts/core';
import { GaugeChart as EChartsGauge } from 'echarts/charts';
import {
  TooltipComponent,
  TitleComponent
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { formatCurrency } from '../../utils/helpers';

echarts.use([
  TitleComponent,
  TooltipComponent,
  EChartsGauge,
  CanvasRenderer
]);

interface GaugeData {
  name: string;
  value: number;
  title?: string;
  detail?: string;
}

interface GaugeChartProps {
  data: GaugeData[];
  title?: string;
  min?: number;
  max?: number;
  splitNumber?: number;
  startAngle?: number;
  endAngle?: number;
  radius?: string;
  axisLine?: {
    lineStyle: {
      width: number;
      color: Array<[number, string]>;
    };
  };
}

const GaugeChart: React.FC<GaugeChartProps> = ({
  data,
  title,
  min = 0,
  max = 100,
  splitNumber = 10,
  startAngle = 225,
  endAngle = -45,
  radius = '75%',
  axisLine = {
    lineStyle: {
      width: 30,
      color: [
        [0.3, '#67e0e3'],
        [0.7, '#37a2da'],
        [1, '#fd666d']
      ]
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
          formatter: '{b}: {c}%'
        },
        series: data.map(item => ({
          type: 'gauge',
          min,
          max,
          splitNumber,
          radius,
          startAngle,
          endAngle,
          axisLine,
          pointer: {
            icon: 'path://M12.8,0.7l12,40.1H0.7L12.8,0.7z',
            length: '12%',
            width: 2,
            offsetCenter: [0, '-60%'],
            itemStyle: {
              color: 'auto'
            }
          },
          axisTick: {
            length: 12,
            lineStyle: {
              color: 'auto',
              width: 2
            }
          },
          splitLine: {
            length: 20,
            lineStyle: {
              color: 'auto',
              width: 5
            }
          },
          axisLabel: {
            color: '#464646',
            fontSize: 20,
            distance: -60,
            formatter: (value: number) => {
              if (value === min || value === max) {
                return formatCurrency(value);
              }
              return '';
            }
          },
          title: {
            offsetCenter: [0, '-20%'],
            fontSize: 30
          },
          detail: {
            fontSize: 50,
            offsetCenter: [0, '0%'],
            valueAnimation: true,
            formatter: (value: number) => formatCurrency(value),
            color: 'auto'
          },
          data: [{
            value: item.value,
            name: item.name,
            title: item.title,
            detail: item.detail
          }]
        }))
      };

      chartInstance.current.setOption(option);
    }

    return () => {
      chartInstance.current?.dispose();
    };
  }, [data, title, min, max, splitNumber, startAngle, endAngle, radius, axisLine]);

  return (
    <div className="relative">
      <div ref={chartRef} style={{ height: '400px', width: '100%' }} />
      <div className="absolute bottom-4 right-4 space-x-2">
        <button
          className="px-2 py-1 text-sm bg-white rounded shadow hover:bg-gray-50"
          onClick={() => {
            if (chartInstance.current) {
              const option = chartInstance.current.getOption();
              const currentAngle = option.series[0].startAngle;
              const newStartAngle = currentAngle === 225 ? 180 : 225;
              const newEndAngle = currentAngle === 225 ? 0 : -45;
              
              option.series.forEach((series: any) => {
                series.startAngle = newStartAngle;
                series.endAngle = newEndAngle;
              });
              
              chartInstance.current.setOption(option);
            }
          }}
        >
          切换角度
        </button>
      </div>
    </div>
  );
};

export default GaugeChart; 